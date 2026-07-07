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

const STRIPE_API_VERSION = "2025-11-17.clover";

// Identical client config to stripe.ts (same SDK-pinned API version, retries, timeout).
function client(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: STRIPE_API_VERSION, maxNetworkRetries: 4, timeout: 30000 });
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
  priceId: string | null;
  plan: string;
  latestInvoiceStatus: string | null;
  currentPeriodEnd: string | null;
  created: string;
  canceledAt: string | null;
  raw: Record<string, unknown>;
}

const iso = (unixSec: number | null | undefined) =>
  unixSec ? new Date(unixSec * 1000).toISOString() : null;

const idOf = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "id" in value && typeof (value as { id?: unknown }).id === "string") {
    return (value as { id: string }).id;
  }
  return null;
};

function financeCreatedFilter(): { gte: number } {
  const days = Number(process.env.STRIPE_FINANCE_LOOKBACK_DAYS ?? 30);
  return { gte: Math.floor(Date.now() / 1000) - Math.max(days, 1) * 86_400 };
}

interface StripeSearchPage<T> {
  data: T[];
  has_more: boolean;
  next_page?: string | null;
}

interface InvoiceLike {
  id: string;
  customer?: unknown;
  subscription?: unknown;
  parent?: { subscription_details?: { subscription?: unknown } };
  status?: string | null;
  currency?: string | null;
  amount_due?: number | null;
  amount_paid?: number | null;
  amount_remaining?: number | null;
  total?: number | null;
  subtotal?: number | null;
  created?: number | null;
  status_transitions?: { finalized_at?: number | null; paid_at?: number | null };
  hosted_invoice_url?: string | null;
}

async function stripeRest<T>(path: string, params: Record<string, string | number | undefined>): Promise<T> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  const url = new URL(`https://api.stripe.com/v1/${path}`);
  for (const [name, value] of Object.entries(params)) {
    if (value != null) url.searchParams.set(name, String(value));
  }
  let lastError: unknown;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${key}`, "Stripe-Version": STRIPE_API_VERSION },
        signal: AbortSignal.timeout(30000),
      });
      if (res.ok) return (await res.json()) as T;
      const body = await res.text();
      if (res.status < 500 && res.status !== 429) {
        throw new Error(`Stripe REST ${path} failed ${res.status}: ${body}`);
      }
      lastError = new Error(`Stripe REST ${path} failed ${res.status}: ${body}`);
    } catch (err) {
      lastError = err;
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
  }
  throw lastError instanceof Error ? lastError : new Error(`Stripe REST ${path} failed`);
}

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
    priceId: firstPrice?.id ?? null,
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

async function upsertStripeCustomers(
  sql: ReturnType<typeof osSql>,
  rows: Array<{
    id: string;
    email: string | null;
    name: string | null;
    currency: string | null;
    createdAt: string | null;
    raw: unknown;
  }>,
) {
  if (rows.length === 0) return;
  await resolveIdentities(sql, "stripe", rows.map((r) => ({ sourceId: r.id, email: r.email, name: r.name })));
  await sql`
    INSERT INTO core.customer (id, email, name, currency, created_at, identity_id)
    SELECT u.id, NULLIF(u.email,'')::citext, u.name, u.currency, u.created_at::timestamptz, i.id
    FROM unnest(
      ${rows.map((r) => r.id)}::text[], ${rows.map((r) => r.email)}::text[],
      ${rows.map((r) => r.name)}::text[], ${rows.map((r) => r.currency)}::text[],
      ${rows.map((r) => r.createdAt)}::text[]
    ) AS u(id, email, name, currency, created_at)
    LEFT JOIN core.identity i ON i.email = NULLIF(u.email,'')::citext
    ON CONFLICT (id) DO UPDATE
      SET email=EXCLUDED.email, name=COALESCE(EXCLUDED.name, core.customer.name),
          currency=EXCLUDED.currency, created_at=COALESCE(core.customer.created_at, EXCLUDED.created_at),
          identity_id=COALESCE(EXCLUDED.identity_id, core.customer.identity_id), synced_at=now()
  `;
}

export async function syncStripeCustomers() {
  return withSyncRun("stripe", "customer", async (ctx) => {
    const sql = osSql();
    const s = client();
    let startingAfter: string | undefined;
    do {
      const page = await s.customers.list({ limit: 100, ...(startingAfter ? { starting_after: startingAfter } : {}) });
      ctx.read(page.data.length);
      for (const batch of chunk(page.data, 300)) {
        await landRaw(sql, "stripe", "customer", ctx.runId, batch.map((c) => ({ sourceId: c.id, payload: c })));
        await upsertStripeCustomers(sql, batch.map((c) => ({
          id: c.id,
          email: c.email ?? null,
          name: c.name ?? null,
          currency: c.currency ?? null,
          createdAt: iso(c.created),
          raw: c,
        })));
        ctx.wrote(batch.length);
      }
      startingAfter = page.has_more ? page.data[page.data.length - 1]?.id : undefined;
    } while (startingAfter);
    ctx.setCursor(new Date().toISOString());
  });
}

async function upsertSubscriptions(sql: ReturnType<typeof osSql>, rows: SubRow[]) {
  await sql`
    INSERT INTO core.subscription
      (id, customer_id, identity_id, status, currency, monthly_cents, interval, interval_count,
       price_id, plan, latest_invoice_status, current_period_end, created_at, canceled_at)
    SELECT u.id, u.customer_id, c.identity_id, u.status, u.currency, u.monthly_cents::numeric,
           u.interval, u.interval_count::int, NULLIF(u.price_id,''), u.plan, NULLIF(u.latest_invoice_status,''),
           u.current_period_end::timestamptz, u.created_at::timestamptz, u.canceled_at::timestamptz
    FROM unnest(
      ${rows.map((r) => r.id)}::text[], ${rows.map((r) => r.customerId)}::text[],
      ${rows.map((r) => r.status)}::text[], ${rows.map((r) => r.currency)}::text[],
      ${rows.map((r) => r.monthlyCents)}::numeric[], ${rows.map((r) => r.interval)}::text[],
      ${rows.map((r) => r.intervalCount)}::int[], ${rows.map((r) => r.priceId)}::text[],
      ${rows.map((r) => r.plan)}::text[],
      ${rows.map((r) => r.latestInvoiceStatus)}::text[], ${rows.map((r) => r.currentPeriodEnd)}::text[],
      ${rows.map((r) => r.created)}::text[], ${rows.map((r) => r.canceledAt)}::text[]
    ) AS u(id, customer_id, status, currency, monthly_cents, interval, interval_count, price_id, plan,
           latest_invoice_status, current_period_end, created_at, canceled_at)
    LEFT JOIN core.customer c ON c.id = u.customer_id
    ON CONFLICT (id) DO UPDATE SET
      customer_id=EXCLUDED.customer_id, identity_id=EXCLUDED.identity_id, status=EXCLUDED.status,
      currency=EXCLUDED.currency, monthly_cents=EXCLUDED.monthly_cents, interval=EXCLUDED.interval,
      interval_count=EXCLUDED.interval_count, price_id=EXCLUDED.price_id, plan=EXCLUDED.plan,
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

export async function syncStripeProducts() {
  return withSyncRun("stripe", "product", async (ctx) => {
    const sql = osSql();
    const s = client();
    let startingAfter: string | undefined;
    do {
      const page = await s.products.list({ limit: 100, ...(startingAfter ? { starting_after: startingAfter } : {}) });
      ctx.read(page.data.length);
      for (const batch of chunk(page.data, 300)) {
        await landRaw(sql, "stripe", "product", ctx.runId, batch.map((p) => ({ sourceId: p.id, payload: p })));
        await sql`
          INSERT INTO core.stripe_product (id, name, active, created_at, updated_at, raw)
          SELECT u.id, u.name, u.active::boolean, u.created_at::timestamptz, u.updated_at::timestamptz, u.raw::jsonb
          FROM unnest(
            ${batch.map((p) => p.id)}::text[], ${batch.map((p) => p.name ?? null)}::text[],
            ${batch.map((p) => String(p.active))}::text[], ${batch.map((p) => iso(p.created))}::text[],
            ${batch.map((p) => iso(p.updated))}::text[], ${batch.map((p) => JSON.stringify(p))}::text[]
          ) AS u(id, name, active, created_at, updated_at, raw)
          ON CONFLICT (id) DO UPDATE SET
            name=EXCLUDED.name, active=EXCLUDED.active, created_at=EXCLUDED.created_at,
            updated_at=EXCLUDED.updated_at, raw=EXCLUDED.raw, synced_at=now()
        `;
        ctx.wrote(batch.length);
      }
      startingAfter = page.has_more ? page.data[page.data.length - 1]?.id : undefined;
    } while (startingAfter);
  });
}

export async function syncStripePrices() {
  return withSyncRun("stripe", "price", async (ctx) => {
    const sql = osSql();
    const s = client();
    let startingAfter: string | undefined;
    do {
      const page = await s.prices.list({ limit: 100, expand: ["data.product"], ...(startingAfter ? { starting_after: startingAfter } : {}) });
      ctx.read(page.data.length);
      for (const batch of chunk(page.data, 300)) {
        await landRaw(sql, "stripe", "price", ctx.runId, batch.map((p) => ({ sourceId: p.id, payload: p })));
        await sql`
          INSERT INTO core.stripe_price
            (id, product_id, active, currency, unit_amount, recurring_interval, interval_count, nickname, created_at, raw)
          SELECT u.id, u.product_id, u.active::boolean, u.currency, u.unit_amount::bigint,
                 NULLIF(u.recurring_interval,''), u.interval_count::int, NULLIF(u.nickname,''),
                 u.created_at::timestamptz, u.raw::jsonb
          FROM unnest(
            ${batch.map((p) => p.id)}::text[], ${batch.map((p) => idOf(p.product))}::text[],
            ${batch.map((p) => String(p.active))}::text[], ${batch.map((p) => p.currency)}::text[],
            ${batch.map((p) => p.unit_amount ?? null)}::bigint[], ${batch.map((p) => p.recurring?.interval ?? "")}::text[],
            ${batch.map((p) => p.recurring?.interval_count ?? null)}::int[], ${batch.map((p) => p.nickname ?? "")}::text[],
            ${batch.map((p) => iso(p.created))}::text[], ${batch.map((p) => JSON.stringify(p))}::text[]
          ) AS u(id, product_id, active, currency, unit_amount, recurring_interval, interval_count, nickname, created_at, raw)
          ON CONFLICT (id) DO UPDATE SET
            product_id=EXCLUDED.product_id, active=EXCLUDED.active, currency=EXCLUDED.currency,
            unit_amount=EXCLUDED.unit_amount, recurring_interval=EXCLUDED.recurring_interval,
            interval_count=EXCLUDED.interval_count, nickname=EXCLUDED.nickname,
            created_at=EXCLUDED.created_at, raw=EXCLUDED.raw, synced_at=now()
        `;
        ctx.wrote(batch.length);
      }
      startingAfter = page.has_more ? page.data[page.data.length - 1]?.id : undefined;
    } while (startingAfter);
  });
}

export async function syncStripeCoupons() {
  return withSyncRun("stripe", "coupon", async (ctx) => {
    const sql = osSql();
    const s = client();
    let startingAfter: string | undefined;
    do {
      const page = await s.coupons.list({ limit: 100, ...(startingAfter ? { starting_after: startingAfter } : {}) });
      ctx.read(page.data.length);
      for (const batch of chunk(page.data, 300)) {
        await landRaw(sql, "stripe", "coupon", ctx.runId, batch.map((c) => ({ sourceId: c.id, payload: c })));
        await sql`
          INSERT INTO core.stripe_coupon
            (id, name, percent_off, amount_off, currency, duration, valid, created_at, raw)
          SELECT u.id, NULLIF(u.name,''), u.percent_off::numeric, u.amount_off::bigint,
                 NULLIF(u.currency,''), u.duration, u.valid::boolean, u.created_at::timestamptz, u.raw::jsonb
          FROM unnest(
            ${batch.map((c) => c.id)}::text[], ${batch.map((c) => c.name ?? "")}::text[],
            ${batch.map((c) => c.percent_off ?? null)}::numeric[], ${batch.map((c) => c.amount_off ?? null)}::bigint[],
            ${batch.map((c) => c.currency ?? "")}::text[], ${batch.map((c) => c.duration)}::text[],
            ${batch.map((c) => String(c.valid))}::text[], ${batch.map((c) => iso(c.created))}::text[],
            ${batch.map((c) => JSON.stringify(c))}::text[]
          ) AS u(id, name, percent_off, amount_off, currency, duration, valid, created_at, raw)
          ON CONFLICT (id) DO UPDATE SET
            name=EXCLUDED.name, percent_off=EXCLUDED.percent_off, amount_off=EXCLUDED.amount_off,
            currency=EXCLUDED.currency, duration=EXCLUDED.duration, valid=EXCLUDED.valid,
            created_at=EXCLUDED.created_at, raw=EXCLUDED.raw, synced_at=now()
        `;
        ctx.wrote(batch.length);
      }
      startingAfter = page.has_more ? page.data[page.data.length - 1]?.id : undefined;
    } while (startingAfter);
  });
}

export async function syncStripeInvoices() {
  return withSyncRun("stripe", "invoice", async (ctx) => {
    const sql = osSql();
    const { gte } = financeCreatedFilter();
    let pageToken: string | undefined;
    do {
      const page = await stripeRest<StripeSearchPage<InvoiceLike>>("invoices/search", {
        query: `created>=${gte}`,
        limit: 100,
        page: pageToken,
      });
      ctx.read(page.data.length);
      for (const batch of chunk(page.data, 300)) {
        await landRaw(sql, "stripe", "invoice", ctx.runId, batch.map((i) => ({ sourceId: i.id, payload: i })));
        await sql`
          INSERT INTO core.stripe_invoice
            (id, customer_id, subscription_id, identity_id, status, currency, amount_due, amount_paid,
             amount_remaining, total, subtotal, created_at, finalized_at, paid_at, hosted_invoice_url, raw)
          SELECT u.id, u.customer_id, u.subscription_id, c.identity_id, NULLIF(u.status,''), u.currency,
                 u.amount_due::bigint, u.amount_paid::bigint, u.amount_remaining::bigint,
                 u.total::bigint, u.subtotal::bigint, u.created_at::timestamptz,
                 u.finalized_at::timestamptz, u.paid_at::timestamptz, NULLIF(u.hosted_invoice_url,''), u.raw::jsonb
          FROM unnest(
            ${batch.map((i) => i.id)}::text[],
            ${batch.map((i) => idOf(i.customer))}::text[],
            ${batch.map((i) => idOf((i as unknown as { subscription?: unknown }).subscription) ?? idOf((i as unknown as { parent?: { subscription_details?: { subscription?: unknown } } }).parent?.subscription_details?.subscription))}::text[],
            ${batch.map((i) => i.status ?? "")}::text[], ${batch.map((i) => i.currency ?? "")}::text[],
            ${batch.map((i) => i.amount_due ?? 0)}::bigint[], ${batch.map((i) => i.amount_paid ?? 0)}::bigint[],
            ${batch.map((i) => i.amount_remaining ?? 0)}::bigint[], ${batch.map((i) => i.total ?? 0)}::bigint[],
            ${batch.map((i) => i.subtotal ?? 0)}::bigint[], ${batch.map((i) => iso(i.created))}::text[],
            ${batch.map((i) => iso(i.status_transitions?.finalized_at))}::text[],
            ${batch.map((i) => iso(i.status_transitions?.paid_at))}::text[],
            ${batch.map((i) => i.hosted_invoice_url ?? "")}::text[], ${batch.map((i) => JSON.stringify(i))}::text[]
          ) AS u(id, customer_id, subscription_id, status, currency, amount_due, amount_paid, amount_remaining,
                 total, subtotal, created_at, finalized_at, paid_at, hosted_invoice_url, raw)
          LEFT JOIN core.customer c ON c.id = u.customer_id
          ON CONFLICT (id) DO UPDATE SET
            customer_id=EXCLUDED.customer_id, subscription_id=EXCLUDED.subscription_id, identity_id=EXCLUDED.identity_id,
            status=EXCLUDED.status, currency=EXCLUDED.currency, amount_due=EXCLUDED.amount_due,
            amount_paid=EXCLUDED.amount_paid, amount_remaining=EXCLUDED.amount_remaining,
            total=EXCLUDED.total, subtotal=EXCLUDED.subtotal, created_at=EXCLUDED.created_at,
            finalized_at=EXCLUDED.finalized_at, paid_at=EXCLUDED.paid_at,
            hosted_invoice_url=EXCLUDED.hosted_invoice_url, raw=EXCLUDED.raw, synced_at=now()
        `;
        ctx.wrote(batch.length);
      }
      pageToken = page.has_more ? (page.next_page ?? undefined) : undefined;
    } while (pageToken);
    ctx.setCursor(new Date().toISOString());
  });
}

export async function syncStripeCharges() {
  return withSyncRun("stripe", "charge", async (ctx) => {
    const sql = osSql();
    const s = client();
    const created = financeCreatedFilter();
    let startingAfter: string | undefined;
    do {
      const page = await s.charges.list({ limit: 100, created, ...(startingAfter ? { starting_after: startingAfter } : {}) });
      ctx.read(page.data.length);
      for (const batch of chunk(page.data, 300)) {
        await landRaw(sql, "stripe", "charge", ctx.runId, batch.map((c) => ({ sourceId: c.id, payload: c })));
        await sql`
          INSERT INTO core.stripe_charge
            (id, customer_id, invoice_id, balance_transaction_id, identity_id, status, currency,
             amount, amount_refunded, refunded, paid, created_at, raw)
          SELECT u.id, u.customer_id, u.invoice_id, u.balance_transaction_id, c.identity_id, u.status, u.currency,
                 u.amount::bigint, u.amount_refunded::bigint, u.refunded::boolean, u.paid::boolean,
                 u.created_at::timestamptz, u.raw::jsonb
          FROM unnest(
            ${batch.map((c) => c.id)}::text[], ${batch.map((c) => idOf(c.customer))}::text[],
            ${batch.map((c) => idOf((c as unknown as { invoice?: unknown }).invoice))}::text[], ${batch.map((c) => idOf(c.balance_transaction))}::text[],
            ${batch.map((c) => c.status)}::text[], ${batch.map((c) => c.currency)}::text[],
            ${batch.map((c) => c.amount ?? 0)}::bigint[], ${batch.map((c) => c.amount_refunded ?? 0)}::bigint[],
            ${batch.map((c) => String(c.refunded))}::text[], ${batch.map((c) => String(c.paid))}::text[],
            ${batch.map((c) => iso(c.created))}::text[], ${batch.map((c) => JSON.stringify(c))}::text[]
          ) AS u(id, customer_id, invoice_id, balance_transaction_id, status, currency, amount, amount_refunded,
                 refunded, paid, created_at, raw)
          LEFT JOIN core.customer c ON c.id = u.customer_id
          ON CONFLICT (id) DO UPDATE SET
            customer_id=EXCLUDED.customer_id, invoice_id=EXCLUDED.invoice_id,
            balance_transaction_id=EXCLUDED.balance_transaction_id, identity_id=EXCLUDED.identity_id,
            status=EXCLUDED.status, currency=EXCLUDED.currency, amount=EXCLUDED.amount,
            amount_refunded=EXCLUDED.amount_refunded, refunded=EXCLUDED.refunded, paid=EXCLUDED.paid,
            created_at=EXCLUDED.created_at, raw=EXCLUDED.raw, synced_at=now()
        `;
        ctx.wrote(batch.length);
      }
      startingAfter = page.has_more ? page.data[page.data.length - 1]?.id : undefined;
    } while (startingAfter);
    ctx.setCursor(new Date().toISOString());
  });
}

export async function syncStripeRefunds() {
  return withSyncRun("stripe", "refund", async (ctx) => {
    const sql = osSql();
    const s = client();
    const created = financeCreatedFilter();
    let startingAfter: string | undefined;
    do {
      const page = await s.refunds.list({ limit: 100, created, ...(startingAfter ? { starting_after: startingAfter } : {}) });
      ctx.read(page.data.length);
      for (const batch of chunk(page.data, 300)) {
        await landRaw(sql, "stripe", "refund", ctx.runId, batch.map((r) => ({ sourceId: r.id, payload: r })));
        await sql`
          INSERT INTO core.stripe_refund
            (id, charge_id, balance_transaction_id, status, currency, amount, reason, created_at, raw)
          SELECT u.id, u.charge_id, u.balance_transaction_id, NULLIF(u.status,''), u.currency,
                 u.amount::bigint, NULLIF(u.reason,''), u.created_at::timestamptz, u.raw::jsonb
          FROM unnest(
            ${batch.map((r) => r.id)}::text[], ${batch.map((r) => idOf(r.charge))}::text[],
            ${batch.map((r) => idOf(r.balance_transaction))}::text[], ${batch.map((r) => r.status ?? "")}::text[],
            ${batch.map((r) => r.currency ?? "")}::text[], ${batch.map((r) => r.amount ?? 0)}::bigint[],
            ${batch.map((r) => r.reason ?? "")}::text[], ${batch.map((r) => iso(r.created))}::text[],
            ${batch.map((r) => JSON.stringify(r))}::text[]
          ) AS u(id, charge_id, balance_transaction_id, status, currency, amount, reason, created_at, raw)
          ON CONFLICT (id) DO UPDATE SET
            charge_id=EXCLUDED.charge_id, balance_transaction_id=EXCLUDED.balance_transaction_id,
            status=EXCLUDED.status, currency=EXCLUDED.currency, amount=EXCLUDED.amount,
            reason=EXCLUDED.reason, created_at=EXCLUDED.created_at, raw=EXCLUDED.raw, synced_at=now()
        `;
        ctx.wrote(batch.length);
      }
      startingAfter = page.has_more ? page.data[page.data.length - 1]?.id : undefined;
    } while (startingAfter);
    ctx.setCursor(new Date().toISOString());
  });
}

export async function syncStripeBalanceTransactions() {
  return withSyncRun("stripe", "balance_transaction", async (ctx) => {
    const sql = osSql();
    const s = client();
    const created = financeCreatedFilter();
    let startingAfter: string | undefined;
    do {
      const page = await s.balanceTransactions.list({ limit: 100, created, ...(startingAfter ? { starting_after: startingAfter } : {}) });
      ctx.read(page.data.length);
      for (const batch of chunk(page.data, 300)) {
        await landRaw(sql, "stripe", "balance_transaction", ctx.runId, batch.map((b) => ({ sourceId: b.id, payload: b })));
        await sql`
          INSERT INTO core.stripe_balance_transaction
            (id, source_id, type, reporting_category, currency, amount, fee, net, status, available_on, created_at, raw)
          SELECT u.id, u.source_id, u.type, u.reporting_category, u.currency,
                 u.amount::bigint, u.fee::bigint, u.net::bigint, u.status,
                 u.available_on::timestamptz, u.created_at::timestamptz, u.raw::jsonb
          FROM unnest(
            ${batch.map((b) => b.id)}::text[], ${batch.map((b) => idOf(b.source))}::text[],
            ${batch.map((b) => b.type)}::text[], ${batch.map((b) => b.reporting_category)}::text[],
            ${batch.map((b) => b.currency)}::text[], ${batch.map((b) => b.amount ?? 0)}::bigint[],
            ${batch.map((b) => b.fee ?? 0)}::bigint[], ${batch.map((b) => b.net ?? 0)}::bigint[],
            ${batch.map((b) => b.status)}::text[], ${batch.map((b) => iso(b.available_on))}::text[],
            ${batch.map((b) => iso(b.created))}::text[], ${batch.map((b) => JSON.stringify(b))}::text[]
          ) AS u(id, source_id, type, reporting_category, currency, amount, fee, net, status, available_on, created_at, raw)
          ON CONFLICT (id) DO UPDATE SET
            source_id=EXCLUDED.source_id, type=EXCLUDED.type, reporting_category=EXCLUDED.reporting_category,
            currency=EXCLUDED.currency, amount=EXCLUDED.amount, fee=EXCLUDED.fee, net=EXCLUDED.net,
            status=EXCLUDED.status, available_on=EXCLUDED.available_on, created_at=EXCLUDED.created_at,
            raw=EXCLUDED.raw, synced_at=now()
        `;
        ctx.wrote(batch.length);
      }
      startingAfter = page.has_more ? page.data[page.data.length - 1]?.id : undefined;
    } while (startingAfter);
    ctx.setCursor(new Date().toISOString());
  });
}

export async function syncStripeSourceDepth() {
  await syncStripeProducts();
  await syncStripePrices();
  await syncStripeCoupons();
  await syncStripeInvoices();
  await syncStripeCharges();
  await syncStripeRefunds();
  await syncStripeBalanceTransactions();
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
  await syncStripeCustomers();
  await syncStripeSubscriptions();
  await syncStripeRevenue();
  await syncStripeSourceDepth();
  await refreshStripeDaily();
}
