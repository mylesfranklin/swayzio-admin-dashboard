"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarClock,
  ExternalLink,
  Globe,
  MessageCircle,
  MousePointer2,
  Search,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { SiFacebook, SiInstagram } from "react-icons/si";
import { FreshnessBadge } from "@/components/dashboard/freshness-badge";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MetricTile } from "@/components/dashboard/metric-tile";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import type { SuperFollower, SuperFollowersDashboard } from "@/server/os/social-dashboard";

type Recency = "all" | "7" | "30" | "90";
type Sort = "impact" | "recent" | "followers" | "engagements" | "comments" | "dms" | "span";
type Platform = "all" | "instagram" | "facebook";
type ProfileFilter = "all" | "enriched" | "verified" | "has_website" | "unknown_reach";

const tiers = ["all", "major", "high", "emerging", "niche", "unknown"] as const;
const sources = ["all", "comment", "dm", "mention"] as const;
const actions = ["all", "Partnership lead", "Warm engager", "Recent touch", "DM follow-up", "Monitor"] as const;
const platforms = ["all", "instagram", "facebook"] as const;
const profileFilters = ["all", "enriched", "verified", "has_website", "unknown_reach"] as const;
const PAGE_SIZE = 100;

function compact(n: number | null | undefined) {
  if (n == null) return "N/A";
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

function pct(part: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

function daysBetween(start: string | null | undefined, end: string | null | undefined) {
  if (!start || !end) return 0;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  if (!Number.isFinite(diff) || diff < 0) return 0;
  return Math.max(1, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

function daysSince(value: string | null | undefined) {
  if (!value) return null;
  const diff = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(diff)) return null;
  return Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)));
}

function date(value: string | null | undefined) {
  return value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }) : "N/A";
}

function cleanType(value: string | null | undefined) {
  return value?.replace(/^(instagram|facebook)_/, "").replaceAll("_", " ") ?? "touch";
}

function optionLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function platformIcon(platform: string) {
  if (platform === "instagram") return <SiInstagram className="h-3.5 w-3.5 text-primary" />;
  if (platform === "facebook") return <SiFacebook className="h-3.5 w-3.5 text-primary" />;
  return <Users className="h-3.5 w-3.5 text-ink-faint" />;
}

function sourceMatches(row: SuperFollower, source: (typeof sources)[number]) {
  if (source === "all") return true;
  if (source === "comment") return row.commentCount > 0;
  if (source === "dm") return row.dmCount > 0;
  return row.mentionCount > 0;
}

function recencyMatches(row: SuperFollower, recency: Recency) {
  if (recency === "all") return true;
  const since = daysSince(row.latestEngagementAt);
  return since != null && since <= Number(recency);
}

function profileMatches(row: SuperFollower, profile: ProfileFilter) {
  if (profile === "all") return true;
  if (profile === "enriched") return row.isEnriched;
  if (profile === "verified") return row.isVerified === true;
  if (profile === "has_website") return Boolean(row.website);
  return row.followerCount == null || row.followerCount === 0;
}

function primarySource(row: SuperFollower) {
  const entries = [
    { label: "DM", value: row.dmCount },
    { label: "Mention", value: row.mentionCount },
    { label: "Comment", value: row.commentCount },
  ].sort((a, b) => b.value - a.value);
  return entries[0]?.value ? entries[0].label : "Touch";
}

function audienceLabel(row: SuperFollower) {
  if (row.followerTier === "major") return "Major reach";
  if (row.followerTier === "high") return "High reach";
  if (row.followerTier === "emerging") return "Emerging reach";
  if (row.followerTier === "niche") return "Niche audience";
  return "Unknown reach";
}

function relationshipStage(row: SuperFollower) {
  if (row.dmCount > 0) return "Direct conversation";
  if (row.mentionCount > 0) return "Mentioned us";
  if (row.totalEngagements >= 3) return "Repeat engager";
  if ((daysSince(row.latestEngagementAt) ?? Infinity) <= 14) return "Recent touch";
  return "Known engager";
}

function rowTone(row: SuperFollower): "neutral" | "success" | "warning" | "error" | "info" {
  if (row.suggestedAction === "Partnership lead" || row.suggestedAction === "DM follow-up") return "success";
  if (row.suggestedAction === "Warm engager") return "info";
  if (row.followerTier === "unknown") return "warning";
  return "neutral";
}

function engagementDensity(row: SuperFollower) {
  const span = daysBetween(row.firstEngagementAt, row.latestEngagementAt);
  return span ? row.totalEngagements / Math.max(span / 30, 1) : row.totalEngagements;
}

export function SuperFollowersClient({ data, error }: { data: SuperFollowersDashboard | null; error: string | null }) {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<(typeof tiers)[number]>("all");
  const [source, setSource] = useState<(typeof sources)[number]>("all");
  const [action, setAction] = useState<(typeof actions)[number]>("all");
  const [platform, setPlatform] = useState<Platform>("all");
  const [profile, setProfile] = useState<ProfileFilter>("all");
  const [recency, setRecency] = useState<Recency>("all");
  const [minFollowers, setMinFollowers] = useState(0);
  const [minTouches, setMinTouches] = useState(0);
  const [sort, setSort] = useState<Sort>("impact");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.followers
      .filter((row) => {
        const recentText = row.recentEngagements.map((engagement) => `${engagement.type ?? ""} ${engagement.message ?? ""}`).join(" ");
        const text = [
          row.platform,
          row.username,
          row.displayName,
          row.biography,
          row.website,
          row.suggestedAction,
          audienceLabel(row),
          relationshipStage(row),
          recentText,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return !q || text.includes(q);
      })
      .filter((row) => platform === "all" || row.platform === platform)
      .filter((row) => tier === "all" || row.followerTier === tier)
      .filter((row) => sourceMatches(row, source))
      .filter((row) => action === "all" || row.suggestedAction === action)
      .filter((row) => profileMatches(row, profile))
      .filter((row) => recencyMatches(row, recency))
      .filter((row) => (row.followerCount ?? 0) >= minFollowers)
      .filter((row) => row.totalEngagements >= minTouches)
      .sort((a, b) => {
        if (sort === "recent") return new Date(b.latestEngagementAt ?? 0).getTime() - new Date(a.latestEngagementAt ?? 0).getTime();
        if (sort === "followers") return (b.followerCount ?? -1) - (a.followerCount ?? -1);
        if (sort === "engagements") return b.totalEngagements - a.totalEngagements;
        if (sort === "comments") return b.commentCount - a.commentCount;
        if (sort === "dms") return b.dmCount - a.dmCount;
        if (sort === "span") return daysBetween(b.firstEngagementAt, b.latestEngagementAt) - daysBetween(a.firstEngagementAt, a.latestEngagementAt);
        return b.impactScore - a.impactScore;
      });
  }, [action, data, minFollowers, minTouches, platform, profile, query, recency, sort, source, tier]);

  useEffect(() => {
    setPage(0);
  }, [action, minFollowers, minTouches, platform, profile, query, recency, sort, source, tier]);

  if (error || !data) {
    return (
      <div className="rounded-box border border-error/30 bg-error/10 p-6 text-sm text-error">
        Couldn't load top engaged accounts{error ? `: ${error}` : ""}.
      </div>
    );
  }

  const totals = filtered.reduce(
    (acc, row) => ({
      touches: acc.touches + row.totalEngagements,
      comments: acc.comments + row.commentCount,
      dms: acc.dms + row.dmCount,
      mentions: acc.mentions + row.mentionCount,
      likes: acc.likes + row.engagementLikes,
      knownReach: acc.knownReach + (row.followerCount ?? 0),
      enriched: acc.enriched + (row.isEnriched ? 1 : 0),
      verified: acc.verified + (row.isVerified ? 1 : 0),
      partnership: acc.partnership + (row.suggestedAction === "Partnership lead" ? 1 : 0),
      direct: acc.direct + (row.dmCount > 0 ? 1 : 0),
      unknownReach: acc.unknownReach + (!row.followerCount ? 1 : 0),
    }),
    { touches: 0, comments: 0, dms: 0, mentions: 0, likes: 0, knownReach: 0, enriched: 0, verified: 0, partnership: 0, direct: 0, unknownReach: 0 }
  );

  const topRow = filtered[0];
  const visibleHighImpact = filtered.filter((row) => (row.followerCount ?? 0) >= 5000).length;
  const sourceTotal = Math.max(totals.comments + totals.dms + totals.mentions, 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageStart = safePage * PAGE_SIZE;
  const pageRows = filtered.slice(pageStart, pageStart + PAGE_SIZE);
  const pageRangeStart = filtered.length ? pageStart + 1 : 0;
  const pageRangeEnd = Math.min(pageStart + PAGE_SIZE, filtered.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold text-ink">Top Engaged</h1>
          </div>
          <p className="mt-1 max-w-3xl text-sm text-ink-muted">
            Every known external account that has commented, DM'd, mentioned, or otherwise engaged, ranked for reach, recency, relationship depth, and follow-up priority.
          </p>
        </div>
        <FreshnessBadge label="Social engagement" updatedAt={data.freshness.updatedAt} stale={data.freshness.stale} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Known Accounts" value={formatNumber(data.summary.actors)} subtitle={`${formatNumber(data.summary.enriched)} enriched profiles`} icon={Users} accent="brand" />
        <KpiCard title="Priority Accounts" value={formatNumber(data.summary.highImpact)} subtitle={`${formatNumber(data.summary.major)} major reach`} icon={Sparkles} accent="success" animationDelay={75} />
        <KpiCard title="Recent 30d" value={formatNumber(data.summary.recent30d)} subtitle="accounts with a fresh touch" icon={CalendarClock} accent="info" animationDelay={150} />
        <KpiCard title="Total Touches" value={formatNumber(data.summary.totalEngagements)} subtitle="comments, DMs, mentions" icon={MessageCircle} accent="warning" animationDelay={225} />
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.7fr_repeat(8,minmax(0,1fr))]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search account, bio, website, message, stage..."
              className="h-9 w-full rounded-field border border-line bg-base-300 pl-8 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand"
            />
          </label>
          <Select label="Platform" value={platform} onChange={(value) => setPlatform(value as Platform)} options={platforms} />
          <Select label="Reach" value={tier} onChange={(value) => setTier(value as typeof tier)} options={tiers} />
          <Select label="Source" value={source} onChange={(value) => setSource(value as typeof source)} options={sources} />
          <Select label="Recency" value={recency} onChange={(value) => setRecency(value as Recency)} options={["all", "7", "30", "90"]} />
          <Select label="Profile" value={profile} onChange={(value) => setProfile(value as ProfileFilter)} options={profileFilters} />
          <Select label="Action" value={action} onChange={(value) => setAction(value as typeof action)} options={actions} />
          <Select label="Sort" value={sort} onChange={(value) => setSort(value as Sort)} options={["impact", "recent", "followers", "engagements", "comments", "dms", "span"]} />
          <div className="grid grid-cols-2 gap-2">
            <NumberFilter label="Followers" value={minFollowers} step={1000} onChange={setMinFollowers} />
            <NumberFilter label="Touches" value={minTouches} step={1} onChange={setMinTouches} />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <QuickFilter label="All accounts" active={query.trim() === "" && platform === "all" && tier === "all" && source === "all" && profile === "all" && recency === "all" && action === "all" && minFollowers === 0 && minTouches === 0} onClick={() => {
            setQuery("");
            setPlatform("all");
            setTier("all");
            setSource("all");
            setProfile("all");
            setRecency("all");
            setAction("all");
            setMinFollowers(0);
            setMinTouches(0);
          }} />
          <QuickFilter label="High reach" active={tier === "all" && minFollowers >= 25000} onClick={() => {
            setTier("all");
            setMinFollowers(25000);
          }} />
          <QuickFilter label="Recent" active={recency === "30"} onClick={() => setRecency("30")} />
          <QuickFilter label="DMs" active={source === "dm"} onClick={() => setSource("dm")} />
          <QuickFilter label="Unknown reach" active={profile === "unknown_reach"} onClick={() => setProfile("unknown_reach")} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Visible Accounts" value={formatNumber(filtered.length)} detail={`${formatNumber(visibleHighImpact)} with 5k+ known reach`} tone="brand" />
        <MetricTile label="Known Reach" value={compact(totals.knownReach)} detail={`${formatNumber(totals.unknownReach)} accounts still need reach enrichment`} tone="success" />
        <MetricTile label="Direct Threads" value={formatNumber(totals.direct)} detail={`${formatNumber(totals.dms)} DM touches in current filter`} tone="info" />
        <MetricTile label="Priority Follow-up" value={formatNumber(totals.partnership)} detail="accounts currently marked as partnership leads" tone="warning" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-ink">Engagement Mix</h2>
              <p className="text-xs text-ink-faint">Current filter by source type and relationship surface.</p>
            </div>
            <Badge tone="info">{formatNumber(totals.touches)} touches</Badge>
          </div>
          <div className="space-y-3">
            <SourceBar label="Comments" value={totals.comments} total={sourceTotal} />
            <SourceBar label="DMs" value={totals.dms} total={sourceTotal} />
            <SourceBar label="Mentions" value={totals.mentions} total={sourceTotal} />
          </div>
        </Card>
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-ink">Top Match</h2>
              <p className="text-xs text-ink-faint">Highest-ranked account under the current filters.</p>
            </div>
            <Badge tone={topRow ? rowTone(topRow) : "neutral"}>{topRow ? topRow.suggestedAction : "None"}</Badge>
          </div>
          {topRow ? (
            <div className="flex items-start gap-3">
              <Avatar row={topRow} />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-ink">@{topRow.username ?? topRow.displayName ?? "unknown"}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  {audienceLabel(topRow)} / {relationshipStage(topRow)} / {primarySource(topRow)}
                </p>
                <p className="mt-2 line-clamp-2 text-xs text-ink-faint">{topRow.biography || topRow.recentEngagements[0]?.message || "No profile or recent message text synced yet."}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-muted">No accounts match the current filters.</p>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-medium text-ink">Top Engaged Accounts</h2>
            <p className="text-xs text-ink-faint">Audience, relationship, source mix, recent context, and next action in one queue.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="info">{formatNumber(filtered.length)} matched</Badge>
            <Badge tone="neutral">{pageRangeStart}-{pageRangeEnd} shown</Badge>
            <Badge tone="neutral">{formatNumber(totals.enriched)} enriched</Badge>
            <Badge tone="neutral">{formatNumber(totals.verified)} verified</Badge>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-2 font-medium">Account</th>
                <th className="px-4 py-2 font-medium">Signal</th>
                <th className="px-4 py-2 font-medium">Audience</th>
                <th className="px-4 py-2 font-medium">Relationship</th>
                <th className="px-4 py-2 font-medium">Engagement Mix</th>
                <th className="px-4 py-2 font-medium">Timeline</th>
                <th className="px-4 py-2 font-medium">Recent Context</th>
                <th className="px-4 py-2 font-medium">Profile Data</th>
                <th className="px-4 py-2 font-medium">Next Move</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr key={row.id} className="border-t border-line/60 align-top transition-colors hover:bg-base-300/40">
                  <td className="min-w-[19rem] px-4 py-3">
                    <div className="flex items-start gap-3">
                      <Avatar row={row} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          {platformIcon(row.platform)}
                          <p className="truncate font-medium text-ink">@{row.username ?? "unknown"}</p>
                          {row.isVerified ? <BadgeCheck className="h-3.5 w-3.5 text-info" /> : null}
                          {row.profileUrl ? (
                            <a href={row.profileUrl} target="_blank" rel="noreferrer" className="text-primary hover:text-base-content" aria-label={`Open @${row.username ?? "account"}`}>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : null}
                        </div>
                        <p className="truncate text-xs text-ink-muted">{row.displayName ?? row.website ?? optionLabel(row.platform)}</p>
                        {row.biography ? <p className="mt-1 line-clamp-2 max-w-[24rem] text-xs text-ink-faint">{row.biography}</p> : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold tabular-nums text-ink">{row.impactScore.toFixed(1)}</p>
                    <p className="mt-1 text-xs text-ink-faint">{primarySource(row)} led</p>
                    <Badge tone={rowTone(row)}>{row.suggestedAction}</Badge>
                  </td>
                  <td className="min-w-[9rem] px-4 py-3 tabular-nums text-ink">
                    <p className="font-medium">{compact(row.followerCount)}</p>
                    <p className="text-xs text-ink-faint">{audienceLabel(row)}</p>
                    <p className="text-xs text-ink-faint">{row.followsCount != null ? `${compact(row.followsCount)} following` : "following unknown"}</p>
                  </td>
                  <td className="min-w-[10rem] px-4 py-3">
                    <p className="font-medium text-ink">{relationshipStage(row)}</p>
                    <p className="mt-1 text-xs text-ink-faint">{row.totalEngagements >= 3 ? "repeat account" : "single-thread account"}</p>
                    <p className="text-xs text-ink-faint">{row.engagementLikes ? `${formatNumber(row.engagementLikes)} likes on touches` : "no like signal"}</p>
                  </td>
                  <td className="min-w-[12rem] px-4 py-3 tabular-nums">
                    <p className="font-medium text-ink">{formatNumber(row.totalEngagements)} total</p>
                    <div className="mt-2 space-y-1">
                      <MiniBar label="C" value={row.commentCount} total={row.totalEngagements} />
                      <MiniBar label="DM" value={row.dmCount} total={row.totalEngagements} />
                      <MiniBar label="M" value={row.mentionCount} total={row.totalEngagements} />
                    </div>
                  </td>
                  <td className="min-w-[10rem] px-4 py-3 text-ink-muted">
                    <p><span className="text-ink">Latest</span> {date(row.latestEngagementAt)}</p>
                    <p className="text-xs text-ink-faint">First {date(row.firstEngagementAt)}</p>
                    <p className="text-xs text-ink-faint">{engagementDensity(row).toFixed(1)} touches/mo</p>
                  </td>
                  <td className="min-w-[24rem] px-4 py-3">
                    <div className="space-y-1.5">
                      {row.recentEngagements.length ? row.recentEngagements.slice(0, 3).map((engagement, index) => (
                        <div key={`${row.id}-${index}`} className="rounded-field border border-line/60 bg-base-300/30 px-2.5 py-2">
                          <div className="mb-1 flex items-center justify-between gap-3">
                            <span className="text-[0.625rem] uppercase tracking-wide text-ink-faint">{cleanType(engagement.type)}</span>
                            <span className="text-[0.625rem] text-ink-faint">{date(engagement.occurred_at)}</span>
                          </div>
                          <p className="line-clamp-2 text-xs text-ink-muted">{engagement.message || "No message text synced"}</p>
                        </div>
                      )) : (
                        <p className="text-xs text-ink-faint">No recent message payload synced.</p>
                      )}
                    </div>
                  </td>
                  <td className="min-w-[12rem] px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge tone={row.isEnriched ? "success" : "neutral"}>{row.isEnriched ? "enriched" : "not enriched"}</Badge>
                      <Badge tone={row.isVerified ? "info" : "neutral"}>{row.isVerified ? "verified" : "unverified"}</Badge>
                      <Badge tone={row.website ? "info" : "neutral"}>{row.website ? "website" : "no website"}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-ink-faint">{row.mediaCount != null ? `${formatNumber(row.mediaCount)} media` : "media count unknown"}</p>
                    {row.website ? (
                      <a href={row.website} target="_blank" rel="noreferrer" className="mt-1 inline-flex max-w-[10rem] items-center gap-1 truncate text-xs text-primary hover:text-base-content">
                        <Globe className="h-3 w-3 shrink-0" />
                        {row.website.replace(/^https?:\/\//, "")}
                      </a>
                    ) : null}
                  </td>
                  <td className="min-w-[12rem] px-4 py-3">
                    <Badge tone={rowTone(row)}>{row.suggestedAction}</Badge>
                    <p className="mt-2 text-xs text-ink-muted">
                      {row.suggestedAction === "DM follow-up"
                        ? "Reply while the direct thread is warm."
                        : row.suggestedAction === "Partnership lead"
                          ? "Review profile and prep outreach."
                          : row.suggestedAction === "Warm engager"
                            ? "Keep close and invite into the next campaign."
                            : row.suggestedAction === "Recent touch"
                              ? "Acknowledge the latest engagement."
                              : "Monitor for another signal."}
                    </p>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr className="border-t border-line/60">
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-ink-muted">
                    No engaged accounts match the current filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {filtered.length > PAGE_SIZE ? (
          <div className="flex flex-col gap-3 border-t border-line p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-ink-faint">
              Showing {formatNumber(pageRangeStart)}-{formatNumber(pageRangeEnd)} of {formatNumber(filtered.length)} matched accounts.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(0, value - 1))}
                disabled={safePage === 0}
                className="h-8 rounded-field border border-line bg-base-300 px-3 text-xs font-medium text-ink-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="min-w-20 text-center text-xs tabular-nums text-ink-faint">
                {safePage + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))}
                disabled={safePage >= totalPages - 1}
                className="h-8 rounded-field border border-line bg-base-300 px-3 text-xs font-medium text-ink-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function Avatar({ row }: { row: SuperFollower }) {
  if (row.profilePictureUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={row.profilePictureUrl} alt="" className="h-10 w-10 rounded-full border border-line object-cover" />;
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-base-300">
      {platformIcon(row.platform)}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}) {
  return (
    <label className="flex h-9 items-center gap-2 rounded-field border border-line bg-base-300 px-2.5">
      <span className="text-[0.625rem] uppercase tracking-wide text-ink-faint">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-base-200 text-ink">
            {optionLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberFilter({ label, value, step, onChange }: { label: string; value: number; step: number; onChange: (value: number) => void }) {
  return (
    <label className="flex h-9 items-center gap-2 rounded-field border border-line bg-base-300 px-2.5">
      <span className="text-[0.625rem] uppercase tracking-wide text-ink-faint">{label}</span>
      <input
        type="number"
        min={0}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value || 0))}
        className="min-w-0 flex-1 bg-transparent text-sm tabular-nums text-ink outline-none"
      />
    </label>
  );
}

function QuickFilter({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-7 items-center gap-1.5 rounded-field border px-2.5 text-xs transition-colors ${
        active ? "border-brand bg-brand/10 text-ink" : "border-line bg-base-300 text-ink-muted hover:text-ink"
      }`}
    >
      <MousePointer2 className="h-3 w-3" />
      {label}
    </button>
  );
}

function SourceBar({ label, value, total }: { label: string; value: number; total: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-ink-muted">{label}</span>
        <span className="tabular-nums text-ink">{formatNumber(value)} / {pct(value, total)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-base-300">
        <div className="h-full rounded-full bg-primary" style={{ width: pct(value, total) }} />
      </div>
    </div>
  );
}

function MiniBar({ label, value, total }: { label: string; value: number; total: number }) {
  return (
    <div className="grid grid-cols-[2rem_1fr_2.5rem] items-center gap-2 text-[0.6875rem] text-ink-faint">
      <span>{label}</span>
      <div className="h-1.5 overflow-hidden rounded-full bg-base-300">
        <div className="h-full rounded-full bg-primary" style={{ width: pct(value, Math.max(total, 1)) }} />
      </div>
      <span className="text-right tabular-nums">{formatNumber(value)}</span>
    </div>
  );
}
