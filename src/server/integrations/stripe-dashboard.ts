import { getOrCompute } from "@/server/cache";
import { getOsStripeDashboard } from "@/server/os/dashboard";
import {
  getSubscriptionMetrics,
  getRevenueMetrics,
  getCustomerCount,
  getCanceledLast30Days,
  type SubscriptionMetrics,
  type RevenueMetrics,
} from "./stripe";

const MIN = 60 * 1000;

export interface StripeDashboard {
  // headline
  mrr: number;                   // $/mo BOOKED (list-price) run-rate
  mrrAnnualizedRunRate: number;  // $/yr
  activeSubscriptions: number;   // status active (nominal)
  customers: number;
  // the real story
  payingSubscriptions: number;   // active AND latest invoice paid
  payingMrr: number;             // booked $/mo for paying subs only
  payingRatePct: number;         // payingSubscriptions / activeSubscriptions * 100
  voidInvoiceSubscriptions: number; // active w/ VOID latest invoice (broken billing)
  collectibleMrr: number | null; // payingMrr + past-due-in-dunning ≈ Stripe's own MRR tile
                                 // (null until the metrics cache refreshes with the new fields)
  collectedLastFullMonth: number;
  collectionRatePct: number;     // collectedLastFullMonth / mrr * 100
  revenue12mo: number;
  pastDueSubscriptions: number;
  pastDueMrrAtRisk: number;
  churnRatePct: number;
  canceledLast30Days: number;
  // breakdowns + series
  byStatus: Record<string, number>;
  byInterval: SubscriptionMetrics["byInterval"];
  revenueByMonth: RevenueMetrics["byMonth"];   // REAL collected, 12mo
  topSubscriptions: SubscriptionMetrics["topSubscriptions"];
  nonUsdActive: number;
  // freshness
  updatedAt: string | null;
  stale: boolean;
}

export async function getStripeDashboard(): Promise<StripeDashboard> {
  try {
    const os = await getOrCompute(
      "os:stripe-dashboard",
      async () => {
        const data = await getOsStripeDashboard();
        if (!data) throw new Error("Swayzio OS Stripe dashboard is unavailable");
        return data;
      },
      15 * MIN,
    );
    return { ...os.data, stale: os.data.stale || os.meta.stale };
  } catch (err) {
    console.error("[stripe-dashboard] OS cache read failed, falling back:", (err as Error).message);
  }

  const [subs, rev, customers, canceled30] = await Promise.all([
    getOrCompute("stripe:subscriptions", getSubscriptionMetrics, 15 * MIN),
    getOrCompute("stripe:revenue", getRevenueMetrics, 60 * MIN),
    getOrCompute("stripe:customers", getCustomerCount, 24 * 60 * MIN),
    getOrCompute("stripe:churn", getCanceledLast30Days, 60 * MIN),
  ]);

  const s = subs.data;
  const r = rev.data;

  const collectionRatePct = s.mrr > 0 ? Math.round((r.lastFullMonth / s.mrr) * 1000) / 10 : 0;
  // monthly churn: canceled in window ÷ subs active at window start (active now + those who left)
  const activeAtStart = s.activeSubscriptions + canceled30.data;
  const churnRatePct = activeAtStart > 0 ? Math.round((canceled30.data / activeAtStart) * 1000) / 10 : 0;

  // freshest-of staleness signal
  const updatedAt = [subs, rev, customers, canceled30]
    .map((c) => c.meta.updatedAt)
    .filter(Boolean)
    .sort()
    .slice(-1)[0] ?? null;
  const stale = [subs, rev, customers, canceled30].some((c) => c.meta.stale);

  const payingRatePct = s.activeSubscriptions > 0
    ? Math.round((s.payingSubscriptions / s.activeSubscriptions) * 1000) / 10
    : 0;

  return {
    mrr: s.mrr,
    mrrAnnualizedRunRate: s.mrrAnnualizedRunRate,
    activeSubscriptions: s.activeSubscriptions,
    customers: customers.data,
    payingSubscriptions: s.payingSubscriptions,
    payingMrr: s.payingMrr,
    payingRatePct,
    voidInvoiceSubscriptions: s.voidInvoiceSubscriptions,
    // Guard: a cached metrics blob written before this field existed lacks pastDueOpenMrr.
    collectibleMrr: typeof s.pastDueOpenMrr === "number" ? s.payingMrr + s.pastDueOpenMrr : null,
    collectedLastFullMonth: r.lastFullMonth,
    collectionRatePct,
    revenue12mo: r.total12mo,
    pastDueSubscriptions: s.pastDueSubscriptions,
    pastDueMrrAtRisk: s.pastDueMrrAtRisk,
    churnRatePct,
    canceledLast30Days: canceled30.data,
    byStatus: s.byStatus,
    byInterval: s.byInterval,
    revenueByMonth: r.byMonth,
    topSubscriptions: s.topSubscriptions,
    nonUsdActive: s.nonUsdActive,
    updatedAt,
    stale,
  };
}
