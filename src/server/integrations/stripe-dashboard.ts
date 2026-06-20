import { getOrCompute } from "@/server/cache";
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
  mrr: number;                   // $/mo active run-rate
  mrrAnnualizedRunRate: number;  // $/yr
  activeSubscriptions: number;
  customers: number;
  // the real story
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

  return {
    mrr: s.mrr,
    mrrAnnualizedRunRate: s.mrrAnnualizedRunRate,
    activeSubscriptions: s.activeSubscriptions,
    customers: customers.data,
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
