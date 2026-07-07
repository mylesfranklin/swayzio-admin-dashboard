import { osSql } from "./db";
import type { StripeDashboard } from "@/server/integrations/stripe-dashboard";
import type { HubspotDashboard } from "@/server/integrations/hubspot-dashboard";

type Row = Record<string, unknown>;

const num = (v: unknown): number => Number(v ?? 0);
const str = (v: unknown): string | null => (v == null ? null : String(v));
const bool = (v: unknown): boolean => v === true || v === "true";

function canReadOs(): boolean {
  return Boolean(process.env.SWAYZIO_OS_DATABASE_URL);
}

function staleFromFinishedAt(finishedAt: unknown): boolean {
  if (!finishedAt) return true;
  return Date.now() - new Date(String(finishedAt)).getTime() > 8 * 60 * 60 * 1000;
}

export async function getOsStripeDashboard(): Promise<StripeDashboard | null> {
  if (!canReadOs()) return null;
  try {
    const sql = osSql();
    const [snapshot] = (await sql`SELECT *, computed_at::text AS computed_at_text FROM api.stripe_snapshot`) as Row[];
    if (!snapshot) return null;
    const revenueRows = (await sql`
      SELECT label, revenue, charges FROM api.revenue_monthly ORDER BY month_start
    `) as Array<{ label: string; revenue: number | string; charges: number | string }>;
    const mixRows = (await sql`SELECT status, interval, subscriptions FROM api.stripe_subscription_mix`) as Array<{
      status: string;
      interval: string | null;
      subscriptions: number | string;
    }>;
    const topRows = (await sql`SELECT * FROM api.stripe_top_subscriptions`) as Row[];
    const [fresh] = (await sql`
      SELECT finished_at::text AS finished_at FROM api.sync_health
      WHERE source='stripe' AND entity='subscription'
    `) as Row[];

    const byStatus: Record<string, number> = {};
    const byInterval = { monthly: 0, annual: 0, other: 0 };
    for (const row of mixRows) {
      byStatus[row.status] = (byStatus[row.status] ?? 0) + num(row.subscriptions);
      if (row.status === "active") {
        if (row.interval === "month") byInterval.monthly += num(row.subscriptions);
        else if (row.interval === "year") byInterval.annual += num(row.subscriptions);
        else byInterval.other += num(row.subscriptions);
      }
    }

    return {
      mrr: num(snapshot.mrr),
      mrrAnnualizedRunRate: num(snapshot.mrr_annualized),
      activeSubscriptions: num(snapshot.active_subs),
      customers: num(snapshot.customers),
      payingSubscriptions: num(snapshot.paying_subs),
      payingMrr: num(snapshot.paying_mrr),
      payingRatePct: num(snapshot.paying_rate_pct),
      voidInvoiceSubscriptions: num(snapshot.void_invoice_subs),
      collectibleMrr: snapshot.collectible_mrr == null ? null : num(snapshot.collectible_mrr),
      collectedLastFullMonth: num(snapshot.collected_last_full_month),
      collectionRatePct: num(snapshot.collection_rate_pct),
      revenue12mo: num(snapshot.revenue_12mo),
      pastDueSubscriptions: num(snapshot.past_due_subs),
      pastDueMrrAtRisk: num(snapshot.past_due_mrr_at_risk),
      churnRatePct: num(snapshot.churn_rate_pct),
      canceledLast30Days: num(snapshot.canceled_30d),
      byStatus,
      byInterval,
      revenueByMonth: revenueRows.map((r) => ({ month: r.label, revenue: num(r.revenue), charges: num(r.charges) })),
      topSubscriptions: topRows.map((r) => ({
        id: String(r.id),
        customer: String(r.customer ?? ""),
        plan: String(r.plan ?? ""),
        amount: num(r.amount),
        status: String(r.status ?? ""),
        nextBillingDate: str(r.next_billing_date),
      })),
      nonUsdActive: num(snapshot.non_usd_active),
      updatedAt: str(fresh?.finished_at ?? snapshot.computed_at_text),
      stale: staleFromFinishedAt(fresh?.finished_at),
    };
  } catch (err) {
    console.error("[os-dashboard] Stripe OS read failed:", (err as Error).message);
    return null;
  }
}

export async function getOsHubspotDashboard(): Promise<HubspotDashboard | null> {
  if (!canReadOs()) return null;
  try {
    const sql = osSql();
    const [snapshot] = (await sql`SELECT *, computed_at::text AS computed_at_text FROM api.hubspot_snapshot`) as Row[];
    if (!snapshot) return null;
    const [fresh] = (await sql`
      SELECT finished_at::text AS finished_at FROM api.sync_health
      WHERE source='hubspot' AND entity='contact'
    `) as Row[];
    const proDistribution = (await sql`
      SELECT pro AS label, count(*)::int AS value
      FROM core.contact
      WHERE pro IS NOT NULL
      GROUP BY pro
      ORDER BY value DESC
    `) as Array<{ label: string; value: number }>;
    const growthByMonth = (await sql`
      WITH months AS (
        SELECT generate_series(date_trunc('month', now()) - interval '11 months', date_trunc('month', now()), interval '1 month') AS month_start
      )
      SELECT to_char(m.month_start, 'Mon YY') AS month, count(ct.*)::int AS contacts
      FROM months m
      LEFT JOIN core.contact ct
        ON ct.created_at >= m.month_start AND ct.created_at < m.month_start + interval '1 month'
      GROUP BY m.month_start
      ORDER BY m.month_start
    `) as Array<{ month: string; contacts: number }>;
    const powerUsers = (await sql`
      SELECT id, coalesce(artist_name, email::text, 'Unknown') AS name, coalesce(email::text, '') AS email,
             tagged_tracks AS tracks, pro, coalesce(subscribed,false) AS subscribed,
             last_modified::text AS last_activity
      FROM core.contact
      WHERE tagged_tracks > 0
      ORDER BY tagged_tracks DESC
      LIMIT 100
    `) as Row[];
    const companies = (await sql`
      WITH contacts AS (
        SELECT nullif(split_part(lower(email::text), '@', 2), '') AS domain,
               email::text, tagged_tracks, subscribed, last_modified
        FROM core.contact
        WHERE email IS NOT NULL AND tagged_tracks > 0
      ),
      ranked AS (
        SELECT domain, email, tagged_tracks, subscribed, last_modified,
               row_number() OVER (PARTITION BY domain ORDER BY tagged_tracks DESC, last_modified DESC NULLS LAST) AS rn
        FROM contacts
        WHERE domain IS NOT NULL AND domain <> 'swayzio.com' AND NOT core.is_personal_domain(domain)
      )
      SELECT domain,
             max(email) FILTER (WHERE rn=1) AS email,
             sum(tagged_tracks)::int AS tracks,
             count(*)::int AS users,
             count(*) FILTER (WHERE subscribed)::int AS subscribed,
             max(last_modified)::text AS last_activity
      FROM ranked
      GROUP BY domain
      ORDER BY tracks DESC
      LIMIT 40
    `) as Row[];
    const reacquireMonths = (await sql`
      WITH months AS (
        SELECT generate_series(date_trunc('month', now()) - interval '11 months', date_trunc('month', now()), interval '1 month') AS month_start
      )
      SELECT to_char(m.month_start, 'Mon YY') AS month,
             count(ct.*)::int AS candidates,
             count(ct.*) FILTER (WHERE ct.tagged_tracks >= 50)::int AS high_value
      FROM months m
      LEFT JOIN core.contact ct
        ON ct.last_modified >= m.month_start
       AND ct.last_modified < m.month_start + interval '1 month'
       AND ct.tagged_tracks > 0
       AND coalesce(ct.subscribed,false) = false
      GROUP BY m.month_start
      ORDER BY m.month_start
    `) as Array<{ month: string; candidates: number; high_value: number }>;
    const [reacquireTotal] = (await sql`
      SELECT count(*)::int AS n FROM core.contact
      WHERE tagged_tracks > 0 AND coalesce(subscribed,false) = false
    `) as Array<{ n: number }>;
    const reacquireEmails = (await sql`
      SELECT email::text AS email FROM core.contact
      WHERE tagged_tracks > 0 AND coalesce(subscribed,false) = false AND email IS NOT NULL
      ORDER BY tagged_tracks DESC
      LIMIT 200
    `) as Array<{ email: string }>;

    const distribution = async (column: "acquisition_channel" | "role" | "company_type") => {
      if (column === "acquisition_channel") {
        return (await sql`
          SELECT acquisition_channel AS label, count(*)::int AS value
          FROM core.contact
          WHERE acquisition_channel IS NOT NULL AND acquisition_channel <> ''
          GROUP BY acquisition_channel
          ORDER BY value DESC
        `) as Array<{ label: string; value: number }>;
      }
      if (column === "role") {
        return (await sql`
          SELECT role AS label, count(*)::int AS value
          FROM core.contact
          WHERE role IS NOT NULL AND role <> ''
          GROUP BY role
          ORDER BY value DESC
        `) as Array<{ label: string; value: number }>;
      }
      return (await sql`
        SELECT company_type AS label, count(*)::int AS value
        FROM core.contact
        WHERE company_type IS NOT NULL AND company_type <> ''
        GROUP BY company_type
        ORDER BY value DESC
      `) as Array<{ label: string; value: number }>;
    };

    const totalTracks = num(snapshot.tagged_tracks_total) + num(snapshot.untagged_tracks_total);

    return {
      totalContacts: num(snapshot.total_contacts),
      artists: num(snapshot.artists),
      subscribed: num(snapshot.subscribed),
      activeSubscribers: { last30: num(snapshot.active_subs_30d), last60: num(snapshot.active_subs_60d) },
      subscribedConvPct: num(snapshot.artists) > 0 ? Math.round((num(snapshot.subscribed) / num(snapshot.artists)) * 1000) / 10 : 0,
      signedToDeal: num(snapshot.signed_to_deal),
      hasPro: num(snapshot.has_pro),
      taggedTracksTotal: num(snapshot.tagged_tracks_total),
      untaggedTracksTotal: num(snapshot.untagged_tracks_total),
      totalTracks,
      artistsWithTracks: num(snapshot.artists_with_tracks),
      proDistribution,
      growthByMonth,
      powerUsers: powerUsers.map((r) => ({
        id: String(r.id),
        name: String(r.name),
        email: String(r.email),
        tracks: num(r.tracks),
        pro: str(r.pro),
        subscribed: bool(r.subscribed),
        lastActivity: str(r.last_activity),
      })),
      companies: companies.map((r) => ({
        domain: String(r.domain),
        email: String(r.email ?? ""),
        tracks: num(r.tracks),
        users: num(r.users),
        subscribed: num(r.subscribed),
        lastActivity: str(r.last_activity),
      })),
      reacquire: {
        totalTargets: reacquireTotal?.n ?? 0,
        emails: reacquireEmails.map((r) => r.email),
        byMonth: reacquireMonths.map((r) => ({ month: r.month, candidates: r.candidates, highValue: r.high_value })),
      },
      acquisitionChannels: await distribution("acquisition_channel"),
      roleDistribution: await distribution("role"),
      companyTypeDistribution: await distribution("company_type"),
      updatedAt: str(fresh?.finished_at ?? snapshot.computed_at_text),
      stale: staleFromFinishedAt(fresh?.finished_at),
    };
  } catch (err) {
    console.error("[os-dashboard] HubSpot OS read failed:", (err as Error).message);
    return null;
  }
}

export interface SyncHealthRow {
  source: string;
  entity: string;
  status: string;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;
  rowsRead: number;
  rowsWritten: number;
  age: string | null;
  hasError: boolean;
  stale8h: boolean;
}

export interface DataQualityRow {
  source: string;
  entity: string;
  sourceRows: number;
  neonRows: number;
  rowDelta: number;
  nullIdentityRows: number;
  nullIdentityPct: number;
  nullEmailRows: number;
  nullEmailPct: number;
}

export async function getOsSyncStatus(): Promise<{ health: SyncHealthRow[]; quality: DataQualityRow[]; error: string | null }> {
  if (!canReadOs()) return { health: [], quality: [], error: "Swayzio OS is not configured." };
  try {
    const sql = osSql();
    const health = (await sql`
      SELECT source, entity, status, started_at::text AS started_at, finished_at::text AS finished_at,
             duration_ms, rows_read, rows_written, age::text AS age, has_error, stale_8h
      FROM api.sync_health
    `) as Row[];
    const quality = (await sql`SELECT * FROM api.data_quality`) as Row[];
    return {
      health: health.map((r) => ({
        source: String(r.source),
        entity: String(r.entity),
        status: String(r.status),
        startedAt: str(r.started_at),
        finishedAt: str(r.finished_at),
        durationMs: r.duration_ms == null ? null : num(r.duration_ms),
        rowsRead: num(r.rows_read),
        rowsWritten: num(r.rows_written),
        age: str(r.age),
        hasError: bool(r.has_error),
        stale8h: bool(r.stale_8h),
      })),
      quality: quality.map((r) => ({
        source: String(r.source),
        entity: String(r.entity),
        sourceRows: num(r.source_rows),
        neonRows: num(r.neon_rows),
        rowDelta: num(r.row_delta),
        nullIdentityRows: num(r.null_identity_rows),
        nullIdentityPct: num(r.null_identity_pct),
        nullEmailRows: num(r.null_email_rows),
        nullEmailPct: num(r.null_email_pct),
      })),
      error: null,
    };
  } catch (err) {
    return { health: [], quality: [], error: (err as Error).message };
  }
}
