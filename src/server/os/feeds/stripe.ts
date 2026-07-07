/**
 * Stripe ELT feed → Swayzio OS.  raw.records → core.customer/subscription (identity-resolved)
 * → metrics.stripe_daily + metrics.stripe_revenue_monthly.
 *
 * Extraction + the monthly-normalization math are ported VERBATIM from
 * src/server/integrations/stripe.ts (hard rule #2). metrics.stripe_daily is then derived from
 * core.subscription and verified to equal getStripeDashboard() (see scripts/os-verify.ts).
 */
import Stripe from "stripe";
import { osSql } from "../db";
import { withSyncRun } from "../sync";
import { chunk, resolveIdentities, landRaw } from "../load";
import { getRevenueMetrics, getCustomerCount, getCanceledLast30Days } from "@/server/integrations/stripe";

// Identical client config to stripe.ts (same SDK-pinned API version, retries, timeout).
function client(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { maxNetworkRetries: 4, timeout: 30000 });
}

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (true) {
        const idx = i++;
        if (idx >= items.length) break;
        out[idx] = await fn(items[idx]);
      }
    }),
  );
  return out;
}

/** Normalize a recurring amount (cents) to its monthly-equivalent (cents). VERBATIM from stripe.ts. */
function monthlyCents(amountCents: number, interval: string, intervalCount = 1): number {
  const ic = intervalCount > 0 ? intervalCount : 1;
  switch (interval) {
    case "year": return amountCents / (12 * ic);
    case "week": return (amountCents * 52) / (12 * ic);
    case "day": return (amountCents * 365) / (12 * ic);
    default: return amountCents / ic;
  }
}

interface SubRow {
  id: string;
  customerId: string | null;
  custEmail: string | null;
  custName: string | null;
  custCurrency: string | null;
  custCreated: string | null;
  status: string;
  currency: string;
  monthlyCents: number; // USD only; 0 if non-USD (matches stripe.ts)
  interval: string;
  intervalCount: number;
  plan: string;
  latestInvoiceStatus: string | null;
  currentPeriodEnd: string | null;
  created: string;
  canceledAt: string | null;
  raw: Record<string, unknown>;
}

const iso = (unixSec: number | null | undefined) =>
  unixSec ? new Date(unixSec * 1000).toISOString() : null;

function mapSub(sub: Stripe.Subscription): SubRow {
  const items = sub.items?.data ?? [];
  let cents = 0;
  let currency = "usd";
  let interval = "month";
  let intervalCount = 1;
  for (const it of items) {
    const p = it.price;
    if (!p?.recurring) continue;
    currency = p.currency;
    interval = p.recurring.interval;
    intervalCount = p.recurring.interval_count ?? 1;
    cents += monthlyCents((p.unit_amount ?? 0) * (it.quantity ?? 1), p.recurring.interval, p.recurring.interval_count ?? 1);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const disc: any = Array.isArray(sub.discounts) ? sub.discounts.find((d) => d && typeof d === "object") : undefined;
  const coupon = disc?.coupon;
  if (coupon && (coupon.duration === "forever" || coupon.duration === "repeating")) {
    if (coupon.percent_off) cents *= 1 - coupon.percent_off / 100;
    else if (coupon.amount_off) cents -= coupon.amount_off;
  }
  if (cents < 0) cents = 0;

  const cust = sub.customer;
  const custObj = cust && typeof cust === "object" && !("deleted" in cust && cust.deleted) ? (cust as Stripe.Customer) : null;
  const customerId = custObj ? custObj.id : typeof cust === "string" ? cust : null;
  const firstPrice = items[0]?.price;
  const inv = sub.latest_invoice;
  const latestInvoiceStatus = inv && typeof inv === "object" ? inv.status ?? null : null;

  return {
    id: sub.id,
    customerId,
    custEmail: custObj?.email ?? null,
    custName: custObj?.name ?? null,
    custCurrency: custObj?.currency ?? null,
    custCreated: iso(custObj?.created),
    status: sub.status,
    currency,
    monthlyCents: currency === "usd" ? cents : 0,
    interval,
    intervalCount,
    plan: firstPrice?.nickname || `Plan ${firstPrice?.id?.slice(-8) ?? "?"}`,
    latestInvoiceStatus,
    currentPeriodEnd: iso(items[0]?.current_period_end),
    created: new Date(sub.created * 1000).toISOString(),
    canceledAt: iso(sub.canceled_at),
    raw: {
      id: sub.id, status: sub.status, currency, customer: customerId,
      customer_email: custObj?.email ?? null, items: items.map((i) => ({ price: i.price?.id, qty: i.quantity })),
      latest_invoice_status: latestInvoiceStatus, current_period_end: items[0]?.current_period_end ?? null,
      created: sub.created, canceled_at: sub.canceled_at ?? null,
    },
  };
}

/** Paginate all non-canceled subs, bucketed by created-time for parallelism. VERBATIM strategy. */
async function fetchSubs(): Promise<SubRow[]> {
  const s = client();
  const now = Math.floor(Date.now() / 1000) + 1;
  const MONTH = 30 * 24 * 60 * 60;
  const ago = (m: number) => now - m * MONTH;
  const bounds = [now, ago(1), ago(2), ago(3), ago(6), ago(12), ago(24), ago(48), 0];
  const ranges: Array<{ gte: number; lt: number }> = [];
  for (let i = 0; i < bounds.length - 1; i++) ranges.push({ gte: bounds[i + 1], lt: bounds[i] });

  const perRange = await mapWithConcurrency(ranges, 4, async (r) => {
    const acc: SubRow[] = [];
    let startingAfter: string | undefined;
    do {
      const page = await s.subscriptions.list({
        limit: 100,
        created: { gte: r.gte, lt: r.lt },
        expand: ["data.items.data.price", "data.customer", "data.latest_invoice"],
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });
      acc.push(...page.data.map(mapSub));
      startingAfter = page.has_more ? page.data[page.data.length - 1]?.id : undefined;
    } while (startingAfter);
    return acc;
  });
  return perRange.flat();
}

async function upsertCustomers(sql: ReturnType<typeof osSql>, rows: SubRow[]) {
  const m = new Map<string, SubRow>();
  for (const r of rows) if (r.customerId) m.set(r.customerId, r);
  const cs = [...m.values()];
  if (cs.length === 0) return;
  await resolveIdentities(sql, "stripe", cs.map((r) => ({ sourceId: r.customerId!, email: r.custEmail, name: r.custName })));
  await sql`
    INSERT INTO core.customer (id, email, name, currency, created_at, identity_id)
    SELECT u.id, NULLIF(u.email,'')::citext, u.name, u.currency, u.created_at::timestamptz, i.id
    FROM unnest(${cs.map((r) => r.customerId!)}::text[], ${cs.map((r) => r.custEmail)}::text[],
                ${cs.map((r) => r.custName)}::text[], ${cs.map((r) => r.custCurrency)}::text[],
                ${cs.map((r) => r.custCreated)}::text[]) AS u(id, email, name, currency, created_at)
    LEFT JOIN core.identity i ON i.email = NULLIF(u.email,'')::citext
    ON CONFLICT (id) DO UPDATE
      SET email=EXCLUDED.email, name=COALESCE(EXCLUDED.name, core.customer.name),
          currency=EXCLUDED.currency, identity_id=EXCLUDED.identity_id, synced_at=now()
  `;
}

async function upsertSubscriptions(sql: ReturnType<typeof osSql>, rows: SubRow[]) {
  await sql`
    INSERT INTO core.subscription
      (id, customer_id, identity_id, status, currency, monthly_cents, interval, interval_count,
       plan, latest_invoice_status, current_period_end, created_at, canceled_at)
    SELECT u.id, u.customer_id, c.identity_id, u.status, u.currency, u.monthly_cents::numeric,
           u.interval, u.interval_count::int, u.plan, NULLIF(u.latest_invoice_status,''),
           u.current_period_end::timestamptz, u.created_at::timestamptz, u.canceled_at::timestamptz
    FROM unnest(
      ${rows.map((r) => r.id)}::text[], ${rows.map((r) => r.customerId)}::text[],
      ${rows.map((r) => r.status)}::text[], ${rows.map((r) => r.currency)}::text[],
      ${rows.map((r) => r.monthlyCents)}::numeric[], ${rows.map((r) => r.interval)}::text[],
      ${rows.map((r) => r.intervalCount)}::int[], ${rows.map((r) => r.plan)}::text[],
      ${rows.map((r) => r.latestInvoiceStatus)}::text[], ${rows.map((r) => r.currentPeriodEnd)}::text[],
      ${rows.map((r) => r.created)}::text[], ${rows.map((r) => r.canceledAt)}::text[]
    ) AS u(id, customer_id, status, currency, monthly_cents, interval, interval_count, plan,
           latest_invoice_status, current_period_end, created_at, canceled_at)
    LEFT JOIN core.customer c ON c.id = u.customer_id
    ON CONFLICT (id) DO UPDATE SET
      customer_id=EXCLUDED.customer_id, identity_id=EXCLUDED.identity_id, status=EXCLUDED.status,
      currency=EXCLUDED.currency, monthly_cents=EXCLUDED.monthly_cents, interval=EXCLUDED.interval,
      interval_count=EXCLUDED.interval_count, plan=EXCLUDED.plan,
      latest_invoice_status=EXCLUDED.latest_invoice_status, current_period_end=EXCLUDED.current_period_end,
      created_at=EXCLUDED.created_at, canceled_at=EXCLUDED.canceled_at, synced_at=now()
  `;
}

export async function syncStripeSubscriptions() {
  return withSyncRun("stripe", "subscription", async (ctx) => {
    const sql = osSql();
    const subs = await fetchSubs();
    ctx.read(subs.length);
    for (const batch of chunk(subs, 300)) {
      await landRaw(sql, "stripe", "subscription", ctx.runId, batch.map((r) => ({ sourceId: r.id, payload: r.raw })));
      await upsertCustomers(sql, batch);
      await upsertSubscriptions(sql, batch);
      ctx.wrote(batch.length);
    }
    ctx.setCursor(new Date().toISOString());
  });
}

export async function syncStripeRevenue() {
  return withSyncRun("stripe", "revenue", async (ctx) => {
    const sql = osSql();
    const rev = await getRevenueMetrics();
    ctx.read(rev.byMonth.length);
    // month label "Mon YY" → month_start date; index from the end = months-ago
    const now = new Date();
    const rows = rev.byMonth.map((m, idx) => {
      const monthsAgo = rev.byMonth.length - 1 - idx;
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, 1));
      return { monthStart: d.toISOString().slice(0, 10), label: m.month, revenue: m.revenue, charges: m.charges };
    });
    await sql`
      INSERT INTO metrics.stripe_revenue_monthly (month_start, label, revenue, charges)
      SELECT u.ms::date, u.label, u.revenue::numeric, u.charges::int
      FROM unnest(${rows.map((r) => r.monthStart)}::text[], ${rows.map((r) => r.label)}::text[],
                  ${rows.map((r) => r.revenue)}::numeric[], ${rows.map((r) => r.charges)}::int[])
           AS u(ms, label, revenue, charges)
      ON CONFLICT (month_start) DO UPDATE
        SET label=EXCLUDED.label, revenue=EXCLUDED.revenue, charges=EXCLUDED.charges, computed_at=now()
    `;
    ctx.wrote(rows.length);
  });
}

/** Derive today's metrics.stripe_daily from core.subscription + revenue table + cheap counts. */
export async function refreshStripeDaily() {
  const sql = osSql();
  const [agg] = (await sql`
    SELECT
      round(coalesce(sum(monthly_cents) filter (where status='active'),0)/100)                              AS mrr,
      count(*) filter (where status='active')                                                              AS active_subs,
      count(*) filter (where status='active' and latest_invoice_status='paid')                             AS paying_subs,
      round(coalesce(sum(monthly_cents) filter (where status='active' and latest_invoice_status='paid'),0)/100) AS paying_mrr,
      count(*) filter (where status='active' and latest_invoice_status='void')                             AS void_invoice_subs,
      count(*) filter (where status='past_due')                                                            AS past_due_subs,
      round(coalesce(sum(monthly_cents) filter (where status='past_due'),0)/100)                           AS past_due_mrr_at_risk,
      count(*) filter (where status='past_due' and latest_invoice_status='open')                           AS past_due_open_subs,
      round(coalesce(sum(monthly_cents) filter (where status='past_due' and latest_invoice_status='open'),0)/100) AS past_due_open_mrr,
      count(*) filter (where status='paused')                                                              AS paused_subs,
      count(*) filter (where status='active' and currency<>'usd')                                          AS non_usd_active
    FROM core.subscription
  `) as Array<Record<string, number>>;

  const [rev] = (await sql`
    SELECT
      (SELECT coalesce(sum(revenue),0) FROM (SELECT revenue FROM metrics.stripe_revenue_monthly ORDER BY month_start DESC LIMIT 12) t) AS revenue_12mo,
      (SELECT revenue FROM metrics.stripe_revenue_monthly ORDER BY month_start DESC OFFSET 1 LIMIT 1)                                  AS collected_last_full_month
  `) as Array<Record<string, number>>;

  const customers = await getCustomerCount();
  const canceled30 = await getCanceledLast30Days();

  const mrr = Number(agg.mrr) || 0;
  const active = Number(agg.active_subs) || 0;
  const lastFull = Number(rev.collected_last_full_month) || 0;
  const paying_rate_pct = active > 0 ? Math.round((Number(agg.paying_subs) / active) * 1000) / 10 : 0;
  const collection_rate_pct = mrr > 0 ? Math.round((lastFull / mrr) * 1000) / 10 : 0;
  // ≈ Stripe's own MRR tile: billing still live (docs/STRIPE-MRR-INVESTIGATION.md)
  const collectible_mrr = Number(agg.paying_mrr) + Number(agg.past_due_open_mrr);
  const churn_rate_pct = active + canceled30 > 0 ? Math.round((canceled30 / (active + canceled30)) * 1000) / 10 : 0;

  await sql`
    INSERT INTO metrics.stripe_daily (
      day, mrr, mrr_annualized, active_subs, paying_subs, paying_mrr, paying_rate_pct,
      void_invoice_subs, past_due_subs, past_due_mrr_at_risk, past_due_open_subs, past_due_open_mrr,
      collectible_mrr, paused_subs, non_usd_active,
      customers, collected_last_full_month, collection_rate_pct, revenue_12mo, canceled_30d, churn_rate_pct
    ) VALUES (
      current_date, ${mrr}, ${mrr * 12}, ${active}, ${Number(agg.paying_subs)}, ${Number(agg.paying_mrr)}, ${paying_rate_pct},
      ${Number(agg.void_invoice_subs)}, ${Number(agg.past_due_subs)}, ${Number(agg.past_due_mrr_at_risk)}, ${Number(agg.past_due_open_subs)}, ${Number(agg.past_due_open_mrr)},
      ${collectible_mrr}, ${Number(agg.paused_subs)}, ${Number(agg.non_usd_active)},
      ${customers}, ${lastFull}, ${collection_rate_pct}, ${Number(rev.revenue_12mo)}, ${canceled30}, ${churn_rate_pct}
    )
    ON CONFLICT (day) DO UPDATE SET
      mrr=EXCLUDED.mrr, mrr_annualized=EXCLUDED.mrr_annualized, active_subs=EXCLUDED.active_subs,
      paying_subs=EXCLUDED.paying_subs, paying_mrr=EXCLUDED.paying_mrr, paying_rate_pct=EXCLUDED.paying_rate_pct,
      void_invoice_subs=EXCLUDED.void_invoice_subs, past_due_subs=EXCLUDED.past_due_subs,
      past_due_mrr_at_risk=EXCLUDED.past_due_mrr_at_risk, past_due_open_subs=EXCLUDED.past_due_open_subs,
      past_due_open_mrr=EXCLUDED.past_due_open_mrr, collectible_mrr=EXCLUDED.collectible_mrr,
      paused_subs=EXCLUDED.paused_subs,
      non_usd_active=EXCLUDED.non_usd_active, customers=EXCLUDED.customers,
      collected_last_full_month=EXCLUDED.collected_last_full_month, collection_rate_pct=EXCLUDED.collection_rate_pct,
      revenue_12mo=EXCLUDED.revenue_12mo, canceled_30d=EXCLUDED.canceled_30d, churn_rate_pct=EXCLUDED.churn_rate_pct,
      computed_at=now()
  `;
}

export async function syncStripe() {
  await syncStripeSubscriptions();
  await syncStripeRevenue();
  await refreshStripeDaily();
}
