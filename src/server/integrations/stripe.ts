import Stripe from "stripe";

/**
 * Stripe metrics — rebuilt for accuracy (Phase 3). Verified against the live
 * account on 2026-06-20. Key corrections vs the legacy Replit service:
 *
 *  - Reads period from the SUBSCRIPTION ITEM (`item.current_period_end`). The
 *    SDK pins API 2025-11-17.clover, where the top-level `current_period_end`
 *    no longer exists — the old code read undefined, breaking next-billing dates.
 *  - Leads with REAL collected revenue (succeeded charges − refunds), not a
 *    reconstructed/smooth MRR curve. The reconstruction hid that collected
 *    revenue is declining while nominal MRR looks healthy.
 *  - Surfaces the past_due crisis (count + at-risk MRR) and a COLLECTION RATE
 *    (last full month collected ÷ MRR run-rate) — the real story for founders.
 *  - MRR scoped to USD (the entire active base is USD; non-USD surfaced if any).
 */

function client(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { maxNetworkRetries: 4, timeout: 30000 });
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (true) {
        const idx = i++;
        if (idx >= items.length) break;
        out[idx] = await fn(items[idx]);
      }
    })
  );
  return out;
}

/** Normalize a recurring amount (cents) to its monthly-equivalent (cents). */
function monthlyCents(amountCents: number, interval: string, intervalCount = 1): number {
  const ic = intervalCount > 0 ? intervalCount : 1;
  switch (interval) {
    case "year": return amountCents / (12 * ic);
    case "week": return (amountCents * 52) / (12 * ic);
    case "day": return (amountCents * 365) / (12 * ic);
    default: return amountCents / ic; // month
  }
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Subscriptions (MRR, active, past_due, status, top list)
// ─────────────────────────────────────────────────────────────────────────────

export interface SubscriptionMetrics {
  mrr: number;                 // $/mo — active USD run-rate
  mrrAnnualizedRunRate: number;// $/yr — mrr * 12
  activeSubscriptions: number;
  pastDueSubscriptions: number;
  pausedSubscriptions: number;
  pastDueMrrAtRisk: number;    // $/mo of past_due subs (USD)
  byStatus: Record<string, number>;
  byInterval: { monthly: number; annual: number; other: number };
  nonUsdActive: number;
  topSubscriptions: Array<{
    id: string;
    customer: string;
    plan: string;
    amount: number;            // $/mo normalized
    status: string;
    nextBillingDate: string | null;
  }>;
}

interface RawSub {
  id: string;
  status: string;
  monthly: number;             // normalized monthly cents (USD; 0 if non-usd)
  currency: string;
  interval: string;
  customer: string;
  plan: string;
  nextBilling: number | null;
  created: number;
  canceledAt: number | null;
}

function mapSub(sub: Stripe.Subscription): RawSub {
  const items = sub.items?.data ?? [];
  let cents = 0;
  let currency = "usd";
  let interval = "month";
  for (const it of items) {
    const p = it.price;
    if (!p?.recurring) continue;
    currency = p.currency;
    interval = p.recurring.interval;
    cents += monthlyCents((p.unit_amount ?? 0) * (it.quantity ?? 1), p.recurring.interval, p.recurring.interval_count ?? 1);
  }
  // recurring discounts (array form in current API). Typed loosely — the Discount
  // shape shifts across API versions and this is a rare path (the active base has none).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const disc: any = Array.isArray(sub.discounts)
    ? sub.discounts.find((d) => d && typeof d === "object")
    : undefined;
  const coupon = disc?.coupon;
  if (coupon && (coupon.duration === "forever" || coupon.duration === "repeating")) {
    if (coupon.percent_off) cents *= 1 - coupon.percent_off / 100;
    else if (coupon.amount_off) cents -= coupon.amount_off;
  }
  if (cents < 0) cents = 0;

  const cust = sub.customer;
  const custObj = cust && typeof cust === "object" && !("deleted" in cust && cust.deleted) ? (cust as Stripe.Customer) : null;
  const firstPrice = items[0]?.price;

  return {
    id: sub.id,
    status: sub.status,
    monthly: currency === "usd" ? cents : 0,
    currency,
    interval,
    customer: custObj ? (custObj.name || custObj.email || custObj.id) : (typeof cust === "string" ? cust : ""),
    plan: firstPrice?.nickname || `Plan ${firstPrice?.id?.slice(-8) ?? "?"}`,
    // period now lives on the item (API 2025-11-17.clover)
    nextBilling: items[0]?.current_period_end ?? null,
    created: sub.created,
    canceledAt: sub.canceled_at ?? null,
  };
}

/** Paginate all non-canceled subs, bucketed by created-time for parallelism. */
async function fetchNonCanceledSubs(): Promise<RawSub[]> {
  const s = client();
  const now = Math.floor(Date.now() / 1000) + 1;
  const MONTH = 30 * 24 * 60 * 60;
  const ago = (m: number) => now - m * MONTH;
  const bounds = [now, ago(1), ago(2), ago(3), ago(6), ago(12), ago(24), ago(48), 0];
  const ranges: Array<{ gte: number; lt: number }> = [];
  for (let i = 0; i < bounds.length - 1; i++) ranges.push({ gte: bounds[i + 1], lt: bounds[i] });

  const perRange = await mapWithConcurrency(ranges, 4, async (r) => {
    const acc: RawSub[] = [];
    let startingAfter: string | undefined;
    do {
      const page = await s.subscriptions.list({
        limit: 100,
        created: { gte: r.gte, lt: r.lt },
        expand: ["data.items.data.price", "data.customer"],
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });
      acc.push(...page.data.map(mapSub));
      startingAfter = page.has_more ? page.data[page.data.length - 1]?.id : undefined;
    } while (startingAfter);
    return acc;
  });
  return perRange.flat();
}

export async function getSubscriptionMetrics(): Promise<SubscriptionMetrics> {
  const subs = await fetchNonCanceledSubs();
  const byStatus: Record<string, number> = {};
  let mrrCents = 0, pastDueCents = 0, activeCount = 0, pastDue = 0, paused = 0, nonUsdActive = 0;
  const byInterval = { monthly: 0, annual: 0, other: 0 };

  for (const sub of subs) {
    byStatus[sub.status] = (byStatus[sub.status] ?? 0) + 1;
    if (sub.status === "active") {
      activeCount++;
      mrrCents += sub.monthly;
      if (sub.currency !== "usd") nonUsdActive++;
      if (sub.interval === "month") byInterval.monthly++;
      else if (sub.interval === "year") byInterval.annual++;
      else byInterval.other++;
    } else if (sub.status === "past_due") {
      pastDue++;
      pastDueCents += sub.monthly;
    } else if (sub.status === "paused") {
      paused++;
    }
  }

  const topSubscriptions = subs
    .filter((s) => s.status === "active")
    .sort((a, b) => b.monthly - a.monthly)
    .slice(0, 100)
    .map((s) => ({
      id: s.id,
      customer: s.customer,
      plan: s.plan,
      amount: Math.round((s.monthly / 100) * 100) / 100,
      status: s.status,
      nextBillingDate: s.nextBilling ? new Date(s.nextBilling * 1000).toISOString() : null,
    }));

  const mrr = Math.round(mrrCents / 100);
  return {
    mrr,
    mrrAnnualizedRunRate: mrr * 12,
    activeSubscriptions: activeCount,
    pastDueSubscriptions: pastDue,
    pausedSubscriptions: paused,
    pastDueMrrAtRisk: Math.round(pastDueCents / 100),
    byStatus,
    byInterval,
    nonUsdActive,
    topSubscriptions,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Revenue (REAL collected — succeeded charges minus refunds)
// ─────────────────────────────────────────────────────────────────────────────

export interface RevenueMetrics {
  total12mo: number;                 // $ net, trailing 12 months
  lastFullMonth: number;             // $ net, previous complete month
  byMonth: Array<{ month: string; revenue: number; charges: number }>;
}

async function chargeRevenue(s: Stripe, gte: number, lt: number) {
  let net = 0, charges = 0;
  let page: string | undefined;
  do {
    const res = await s.charges.search({
      query: `status:"succeeded" AND created>=${gte} AND created<${lt}`,
      limit: 100,
      ...(page ? { page } : {}),
    });
    for (const c of res.data) { net += (c.amount ?? 0) - (c.amount_refunded ?? 0); charges++; }
    page = res.has_more ? (res.next_page ?? undefined) : undefined;
  } while (page);
  return { net, charges };
}

export async function getRevenueMetrics(): Promise<RevenueMetrics> {
  const s = client();
  const now = new Date();
  const ranges: Array<{ label: string; gte: number; lt: number }> = [];
  for (let i = 11; i >= 0; i--) {
    const a = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const b = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    ranges.push({ label: monthLabel(a), gte: Math.floor(a.getTime() / 1000), lt: Math.floor(b.getTime() / 1000) });
  }
  const results = await mapWithConcurrency(ranges, 3, (r) => chargeRevenue(s, r.gte, r.lt));
  const byMonth = ranges.map((r, i) => ({
    month: r.label,
    revenue: Math.round(results[i].net / 100),
    charges: results[i].charges,
  }));
  const total12mo = byMonth.reduce((sum, m) => sum + m.revenue, 0);
  // last FULL month = second-to-last entry (the final entry is the current partial month)
  const lastFullMonth = byMonth.length >= 2 ? byMonth[byMonth.length - 2].revenue : 0;
  return { total12mo, lastFullMonth, byMonth };
}

// ─────────────────────────────────────────────────────────────────────────────
// Customer count (full pagination — cached separately, long TTL)
// ─────────────────────────────────────────────────────────────────────────────

export async function getCustomerCount(): Promise<number> {
  const s = client();
  let count = 0;
  let startingAfter: string | undefined;
  do {
    const page = await s.customers.list({ limit: 100, ...(startingAfter ? { starting_after: startingAfter } : {}) });
    count += page.data.length;
    startingAfter = page.has_more ? page.data[page.data.length - 1]?.id : undefined;
  } while (startingAfter);
  return count;
}

// ─────────────────────────────────────────────────────────────────────────────
// Churn (events-based, last 30 days)
// ─────────────────────────────────────────────────────────────────────────────

export async function getCanceledLast30Days(): Promise<number> {
  const s = client();
  const since = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
  let count = 0;
  let startingAfter: string | undefined;
  do {
    const events = await s.events.list({
      type: "customer.subscription.deleted",
      created: { gte: since },
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    count += events.data.length;
    startingAfter = events.has_more ? events.data[events.data.length - 1]?.id : undefined;
  } while (startingAfter);
  return count;
}
