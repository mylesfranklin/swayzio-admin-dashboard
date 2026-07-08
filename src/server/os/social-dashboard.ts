import { getOrCompute } from "@/server/cache";
import { osSql } from "./db";

type Row = Record<string, unknown>;
const MIN = 60 * 1000;

const num = (v: unknown): number => Number(v ?? 0);
const str = (v: unknown): string | null => (v == null ? null : String(v));

function jsonArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [];
  }
}

function canReadOs(): boolean {
  return Boolean(process.env.SWAYZIO_OS_DATABASE_URL);
}

function staleFromFinishedAt(finishedAt: unknown): boolean {
  if (!finishedAt) return true;
  return Date.now() - new Date(String(finishedAt)).getTime() > 8 * 60 * 60 * 1000;
}

async function freshness(source: "facebook" | "instagram") {
  const sql = osSql();
  const rows = (await sql`
    SELECT entity, status, finished_at::text AS finished_at, rows_read, rows_written
    FROM api.sync_health
    WHERE source = ${source}
    ORDER BY entity
  `) as Row[];
  const latest = rows.reduce<string | null>((max, row) => {
    const finished = str(row.finished_at);
    if (!finished) return max;
    return !max || new Date(finished) > new Date(max) ? finished : max;
  }, null);
  return {
    updatedAt: latest,
    stale: staleFromFinishedAt(latest),
    rows: rows.map((r) => ({
      entity: String(r.entity),
      status: String(r.status),
      finishedAt: str(r.finished_at),
      rowsRead: num(r.rows_read),
      rowsWritten: num(r.rows_written),
    })),
  };
}

export interface SocialFreshness {
  updatedAt: string | null;
  stale: boolean;
  rows: Array<{ entity: string; status: string; finishedAt: string | null; rowsRead: number; rowsWritten: number }>;
}

export interface FacebookDashboard {
  freshness: SocialFreshness;
  snapshot: {
    pages: number;
    posts: number;
    followers: number;
    fans: number;
    latestPostAt: string | null;
    comments: number;
    likes: number;
    reactions: number;
    shares: number;
  };
  pages: Array<{ id: string; name: string; username: string | null; followers: number; fans: number; verified: boolean; link: string | null }>;
  topPosts: Array<{ id: string; pageName: string; createdAt: string | null; permalink: string | null; preview: string; reactions: number; comments: number; shares: number; engagement: number }>;
  recentPosts: Array<{ id: string; pageName: string; createdAt: string | null; permalink: string | null; message: string | null; statusType: string | null; reactions: number; comments: number; shares: number }>;
  adsDaily: Array<{ label: string; spend: number; impressions: number; reach: number; clicks: number; ctr: number; cpc: number; cpm: number }>;
  adsSummary: { spend: number; impressions: number; reach: number; clicks: number; ctr: number };
  campaigns: Array<{ id: string; name: string; accountName: string | null; currency: string | null; firstSeen: string | null; lastSeen: string | null; spend: number; impressions: number; reach: number; clicks: number; ctr: number; cpc: number; cpm: number }>;
  adAccounts: Array<{ id: string; name: string; status: number; currency: string | null; amountSpent: number; balance: number }>;
}

export interface InstagramDashboard {
  freshness: SocialFreshness;
  snapshot: {
    accounts: number;
    followers: number;
    follows: number;
    totalMediaOnProfile: number;
    syncedMedia: number;
    latestMediaAt: string | null;
    syncedLikes: number;
    syncedComments: number;
  };
  accounts: Array<{ id: string; username: string; name: string | null; biography: string | null; website: string | null; profilePictureUrl: string | null; followers: number; follows: number; mediaCount: number; facebookPageName: string | null }>;
  accountInsights: Array<{ metric: string; title: string; value: number; period: string | null; endTime: string | null }>;
  accountInsightTrend: Array<{ label: string; reach: number; followerCount: number }>;
  topMedia: Array<{ id: string; accountUsername: string; mediaType: string | null; mediaProductType: string | null; timestamp: string | null; permalink: string | null; preview: string; likes: number; comments: number; engagement: number }>;
  recentMedia: Array<{ id: string; accountUsername: string; mediaType: string | null; mediaProductType: string | null; timestamp: string | null; permalink: string | null; caption: string | null; likes: number; comments: number }>;
  mediaInsights: Array<{ mediaId: string; metric: string; value: number; mediaTimestamp: string | null; permalink: string | null; caption: string | null; mediaType: string | null }>;
  mediaInsightTotals: Array<{ metric: string; value: number }>;
}

export interface SuperFollower {
  id: string;
  platform: string;
  username: string | null;
  displayName: string | null;
  biography: string | null;
  website: string | null;
  profileUrl: string | null;
  profilePictureUrl: string | null;
  followerCount: number | null;
  followsCount: number | null;
  mediaCount: number | null;
  followerTier: string;
  isVerified: boolean | null;
  isEnriched: boolean;
  totalEngagements: number;
  commentCount: number;
  dmCount: number;
  mentionCount: number;
  engagementLikes: number;
  firstEngagementAt: string | null;
  latestEngagementAt: string | null;
  impactScore: number;
  suggestedAction: string;
  recentEngagements: Array<{ type?: string; platform?: string; message?: string; occurred_at?: string; permalink?: string }>;
}

export interface SuperFollowersDashboard {
  freshness: SocialFreshness;
  summary: {
    actors: number;
    highImpact: number;
    major: number;
    enriched: number;
    recent30d: number;
    totalEngagements: number;
  };
  followers: SuperFollower[];
}

export async function getFacebookDashboard(): Promise<FacebookDashboard | null> {
  if (!canReadOs()) return null;
  const sql = osSql();
  const [snapshot] = (await sql`SELECT * FROM api.facebook_organic_snapshot`) as Row[];
  if (!snapshot) return null;
  const [fresh, pages, topPosts, recentPosts, adsDaily, adsSummaryRows, campaigns, adAccounts] = await Promise.all([
    freshness("facebook"),
    sql`
      SELECT id, name, username, followers_count, fan_count, is_verified, link
      FROM api.facebook_pages
      ORDER BY followers_count DESC NULLS LAST
      LIMIT 12
    ` as Promise<Row[]>,
    sql`SELECT * FROM api.facebook_top_posts LIMIT 12` as Promise<Row[]>,
    sql`
      SELECT id, page_name, created_time::text AS created_time, permalink_url, message, status_type,
             reactions_count, comments_count, shares_count
      FROM api.facebook_posts
      ORDER BY created_time DESC NULLS LAST
      LIMIT 12
    ` as Promise<Row[]>,
    sql`
      SELECT *
      FROM (
        SELECT
          date_start::text AS date_start,
          round(sum(spend), 2) AS spend,
          sum(impressions)::bigint AS impressions,
          sum(reach)::bigint AS reach,
          sum(clicks)::bigint AS clicks,
          CASE WHEN sum(impressions) > 0 THEN round((sum(clicks)::numeric / sum(impressions)) * 100, 4) END AS ctr,
          CASE WHEN sum(clicks) > 0 THEN round(sum(spend) / sum(clicks), 4) END AS cpc,
          CASE WHEN sum(impressions) > 0 THEN round((sum(spend) / sum(impressions)) * 1000, 4) END AS cpm
        FROM api.facebook_ads_daily
        GROUP BY date_start
        ORDER BY date_start DESC NULLS LAST
        LIMIT 30
      ) d
      ORDER BY date_start
    ` as Promise<Row[]>,
    sql`
      SELECT
        round(coalesce(sum(spend), 0), 2) AS spend,
        coalesce(sum(impressions), 0)::bigint AS impressions,
        coalesce(sum(reach), 0)::bigint AS reach,
        coalesce(sum(clicks), 0)::bigint AS clicks,
        CASE WHEN coalesce(sum(impressions), 0) > 0 THEN round((sum(clicks)::numeric / sum(impressions)) * 100, 4) ELSE 0 END AS ctr
      FROM api.facebook_ads_daily
    ` as Promise<Row[]>,
    sql`SELECT * FROM api.facebook_campaign_summary LIMIT 12` as Promise<Row[]>,
    sql`
      SELECT id, name, account_status, currency, amount_spent, balance
      FROM api.facebook_ad_accounts
      ORDER BY amount_spent DESC NULLS LAST
      LIMIT 12
    ` as Promise<Row[]>,
  ]);

  const adsSummary = adsSummaryRows[0] ?? {};
  return {
    freshness: fresh,
    snapshot: {
      pages: num(snapshot.pages),
      posts: num(snapshot.posts),
      followers: num(snapshot.followers),
      fans: num(snapshot.fans),
      latestPostAt: str(snapshot.latest_post_at),
      comments: num(snapshot.comments),
      likes: num(snapshot.likes),
      reactions: num(snapshot.reactions),
      shares: num(snapshot.shares),
    },
    pages: pages.map((r) => ({
      id: String(r.id),
      name: String(r.name ?? "Untitled page"),
      username: str(r.username),
      followers: num(r.followers_count),
      fans: num(r.fan_count),
      verified: r.is_verified === true,
      link: str(r.link),
    })),
    topPosts: topPosts.map((r) => ({
      id: String(r.id),
      pageName: String(r.page_name ?? "Facebook"),
      createdAt: str(r.created_time),
      permalink: str(r.permalink_url),
      preview: String(r.preview ?? ""),
      reactions: num(r.reactions),
      comments: num(r.comments),
      shares: num(r.shares),
      engagement: num(r.engagement),
    })),
    recentPosts: recentPosts.map((r) => ({
      id: String(r.id),
      pageName: String(r.page_name ?? "Facebook"),
      createdAt: str(r.created_time),
      permalink: str(r.permalink_url),
      message: str(r.message),
      statusType: str(r.status_type),
      reactions: num(r.reactions_count),
      comments: num(r.comments_count),
      shares: num(r.shares_count),
    })),
    adsDaily: adsDaily.map((r) => ({
      label: r.date_start ? new Date(String(r.date_start)).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—",
      spend: num(r.spend),
      impressions: num(r.impressions),
      reach: num(r.reach),
      clicks: num(r.clicks),
      ctr: num(r.ctr),
      cpc: num(r.cpc),
      cpm: num(r.cpm),
    })),
    adsSummary: {
      spend: num(adsSummary.spend),
      impressions: num(adsSummary.impressions),
      reach: num(adsSummary.reach),
      clicks: num(adsSummary.clicks),
      ctr: num(adsSummary.ctr),
    },
    campaigns: campaigns.map((r) => ({
      id: String(r.campaign_id ?? "unknown"),
      name: String(r.campaign_name ?? "Untitled campaign"),
      accountName: str(r.ad_account_name),
      currency: str(r.currency),
      firstSeen: str(r.first_seen_date),
      lastSeen: str(r.last_seen_date),
      spend: num(r.spend),
      impressions: num(r.impressions),
      reach: num(r.reach),
      clicks: num(r.clicks),
      ctr: num(r.ctr),
      cpc: num(r.cpc),
      cpm: num(r.cpm),
    })),
    adAccounts: adAccounts.map((r) => ({
      id: String(r.id),
      name: String(r.name ?? "Ad account"),
      status: num(r.account_status),
      currency: str(r.currency),
      amountSpent: num(r.amount_spent),
      balance: num(r.balance),
    })),
  };
}

export async function getInstagramDashboard(): Promise<InstagramDashboard | null> {
  if (!canReadOs()) return null;
  const sql = osSql();
  const [snapshot] = (await sql`SELECT * FROM api.instagram_snapshot`) as Row[];
  if (!snapshot) return null;
  const [fresh, accounts, accountInsights, accountTrend, topMedia, recentMedia, mediaInsights, mediaTotals] = await Promise.all([
    freshness("instagram"),
    sql`
      SELECT id, username, name, biography, website, profile_picture_url, followers_count,
             follows_count, media_count, facebook_page_name
      FROM api.instagram_accounts
      ORDER BY followers_count DESC NULLS LAST
      LIMIT 12
    ` as Promise<Row[]>,
    sql`
      WITH latest AS (
        SELECT DISTINCT ON (instagram_account_id, metric_name)
               metric_name, title, period, end_time, numeric_value
        FROM api.instagram_account_insights
        WHERE numeric_value IS NOT NULL
        ORDER BY instagram_account_id, metric_name, end_time DESC NULLS LAST, synced_at DESC
      )
      SELECT metric_name, max(title) AS title, max(period) AS period,
             max(end_time)::text AS end_time, sum(numeric_value)::numeric AS numeric_value
      FROM latest
      GROUP BY metric_name
      ORDER BY metric_name
    ` as Promise<Row[]>,
    sql`
      SELECT to_char(day, 'Mon DD') AS label, reach, follower_count
      FROM (
        SELECT end_time::date AS day,
               sum(numeric_value) FILTER (WHERE metric_name = 'reach') AS reach,
               sum(numeric_value) FILTER (WHERE metric_name = 'follower_count') AS follower_count
        FROM api.instagram_account_insights
        WHERE metric_name IN ('reach','follower_count') AND end_time IS NOT NULL
        GROUP BY end_time::date
        ORDER BY end_time::date DESC
        LIMIT 30
      ) latest_days
      ORDER BY day
    ` as Promise<Row[]>,
    sql`SELECT * FROM api.instagram_top_media LIMIT 12` as Promise<Row[]>,
    sql`
      SELECT id, account_username, media_type, media_product_type, timestamp::text AS timestamp,
             permalink, caption, like_count, comments_count
      FROM api.instagram_media
      ORDER BY timestamp DESC NULLS LAST
      LIMIT 12
    ` as Promise<Row[]>,
    sql`
      SELECT media_id, metric_name, numeric_value, media_timestamp::text AS media_timestamp,
             permalink, caption, media_type
      FROM api.instagram_media_insights
      WHERE numeric_value IS NOT NULL
      ORDER BY media_timestamp DESC NULLS LAST
      LIMIT 80
    ` as Promise<Row[]>,
    sql`
      SELECT metric_name, sum(numeric_value)::numeric AS value
      FROM api.instagram_media_insights
      WHERE numeric_value IS NOT NULL
      GROUP BY metric_name
      ORDER BY value DESC
    ` as Promise<Row[]>,
  ]);

  return {
    freshness: fresh,
    snapshot: {
      accounts: num(snapshot.accounts),
      followers: num(snapshot.followers),
      follows: num(snapshot.follows),
      totalMediaOnProfile: num(snapshot.total_media_on_profile),
      syncedMedia: num(snapshot.synced_media),
      latestMediaAt: str(snapshot.latest_media_at),
      syncedLikes: num(snapshot.synced_likes),
      syncedComments: num(snapshot.synced_comments),
    },
    accounts: accounts.map((r) => ({
      id: String(r.id),
      username: String(r.username ?? "instagram"),
      name: str(r.name),
      biography: str(r.biography),
      website: str(r.website),
      profilePictureUrl: str(r.profile_picture_url),
      followers: num(r.followers_count),
      follows: num(r.follows_count),
      mediaCount: num(r.media_count),
      facebookPageName: str(r.facebook_page_name),
    })),
    accountInsights: accountInsights.map((r) => ({
      metric: String(r.metric_name),
      title: String(r.title ?? r.metric_name),
      value: num(r.numeric_value),
      period: str(r.period),
      endTime: str(r.end_time),
    })),
    accountInsightTrend: accountTrend.map((r) => ({
      label: String(r.label),
      reach: num(r.reach),
      followerCount: num(r.follower_count),
    })),
    topMedia: topMedia.map((r) => ({
      id: String(r.id),
      accountUsername: String(r.account_username ?? "instagram"),
      mediaType: str(r.media_type),
      mediaProductType: str(r.media_product_type),
      timestamp: str(r.timestamp),
      permalink: str(r.permalink),
      preview: String(r.preview ?? ""),
      likes: num(r.likes),
      comments: num(r.comments),
      engagement: num(r.engagement),
    })),
    recentMedia: recentMedia.map((r) => ({
      id: String(r.id),
      accountUsername: String(r.account_username ?? "instagram"),
      mediaType: str(r.media_type),
      mediaProductType: str(r.media_product_type),
      timestamp: str(r.timestamp),
      permalink: str(r.permalink),
      caption: str(r.caption),
      likes: num(r.like_count),
      comments: num(r.comments_count),
    })),
    mediaInsights: mediaInsights.map((r) => ({
      mediaId: String(r.media_id),
      metric: String(r.metric_name),
      value: num(r.numeric_value),
      mediaTimestamp: str(r.media_timestamp),
      permalink: str(r.permalink),
      caption: str(r.caption),
      mediaType: str(r.media_type),
    })),
    mediaInsightTotals: mediaTotals.map((r) => ({ metric: String(r.metric_name), value: num(r.value) })),
  };
}

export async function getSuperFollowersDashboard(): Promise<SuperFollowersDashboard | null> {
  if (!canReadOs()) return null;
  const sql = osSql();
  const [fresh, rows, summaryRows] = await Promise.all([
    freshness("instagram"),
    sql`
      SELECT id, platform, username, display_name, biography, website, profile_url,
             profile_picture_url, follower_count, follows_count, media_count, follower_tier,
             is_verified, is_business_discovery_enriched, total_engagements, comment_count,
             dm_count, mention_count, engagement_likes, first_engagement_at::text AS first_engagement_at,
             latest_engagement_at::text AS latest_engagement_at, impact_score, suggested_action,
             recent_engagements
      FROM api.super_followers
    ` as Promise<Row[]>,
    sql`
      SELECT
        count(*)::int AS actors,
        count(*) FILTER (WHERE coalesce(follower_count, 0) >= 5000)::int AS high_impact,
        count(*) FILTER (WHERE follower_tier = 'major')::int AS major,
        count(*) FILTER (WHERE is_business_discovery_enriched)::int AS enriched,
        count(*) FILTER (WHERE latest_engagement_at >= now() - interval '30 days')::int AS recent_30d,
        coalesce(sum(total_engagements), 0)::int AS total_engagements
      FROM api.super_followers
    ` as Promise<Row[]>,
  ]);
  const summary = summaryRows[0] ?? {};
  return {
    freshness: fresh,
    summary: {
      actors: num(summary.actors),
      highImpact: num(summary.high_impact),
      major: num(summary.major),
      enriched: num(summary.enriched),
      recent30d: num(summary.recent_30d),
      totalEngagements: num(summary.total_engagements),
    },
    followers: rows.map((r) => ({
      id: String(r.id),
      platform: String(r.platform),
      username: str(r.username),
      displayName: str(r.display_name),
      biography: str(r.biography),
      website: str(r.website),
      profileUrl: str(r.profile_url),
      profilePictureUrl: str(r.profile_picture_url),
      followerCount: r.follower_count == null ? null : num(r.follower_count),
      followsCount: r.follows_count == null ? null : num(r.follows_count),
      mediaCount: r.media_count == null ? null : num(r.media_count),
      followerTier: String(r.follower_tier ?? "unknown"),
      isVerified: r.is_verified == null ? null : r.is_verified === true,
      isEnriched: r.is_business_discovery_enriched === true,
      totalEngagements: num(r.total_engagements),
      commentCount: num(r.comment_count),
      dmCount: num(r.dm_count),
      mentionCount: num(r.mention_count),
      engagementLikes: num(r.engagement_likes),
      firstEngagementAt: str(r.first_engagement_at),
      latestEngagementAt: str(r.latest_engagement_at),
      impactScore: num(r.impact_score),
      suggestedAction: String(r.suggested_action ?? "Monitor"),
      recentEngagements: jsonArray<SuperFollower["recentEngagements"][number]>(r.recent_engagements),
    })),
  };
}

function withCachedFreshness<T extends { freshness: SocialFreshness }>(data: T, stale: boolean): T {
  return { ...data, freshness: { ...data.freshness, stale: data.freshness.stale || stale } };
}

export async function getCachedFacebookDashboard(): Promise<FacebookDashboard | null> {
  const cached = await getOrCompute(
    "os:facebook-dashboard",
    async () => {
      const data = await getFacebookDashboard();
      if (!data) throw new Error("Swayzio OS Facebook dashboard is unavailable");
      return data;
    },
    15 * MIN,
  );
  return withCachedFreshness(cached.data, cached.meta.stale);
}

export async function getCachedInstagramDashboard(): Promise<InstagramDashboard | null> {
  const cached = await getOrCompute(
    "os:instagram-dashboard",
    async () => {
      const data = await getInstagramDashboard();
      if (!data) throw new Error("Swayzio OS Instagram dashboard is unavailable");
      return data;
    },
    15 * MIN,
  );
  return withCachedFreshness(cached.data, cached.meta.stale);
}

export async function getCachedSuperFollowersDashboard(): Promise<SuperFollowersDashboard | null> {
  const cached = await getOrCompute(
    "os:top-engaged-dashboard:v2",
    async () => {
      const data = await getSuperFollowersDashboard();
      if (!data) throw new Error("Swayzio OS Top Engaged dashboard is unavailable");
      return data;
    },
    15 * MIN,
  );
  return withCachedFreshness(cached.data, cached.meta.stale);
}
