/**
 * One-off end-to-end verification: live Stripe → Neon cache → assembled metrics.
 * Run: npx tsx scripts/verify-stripe.ts   (loads .env.local itself)
 */
import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
}

const { getSubscriptionMetrics, getRevenueMetrics, getCustomerCount, getCanceledLast30Days } =
  await import("../src/server/integrations/stripe.ts");
const { getOrCompute } = await import("../src/server/cache.ts");

const MIN = 60_000;
const t0 = Date.now();
const [subs, rev, customers, canceled30] = await Promise.all([
  getOrCompute("stripe:subscriptions", getSubscriptionMetrics, 15 * MIN),
  getOrCompute("stripe:revenue", getRevenueMetrics, 60 * MIN),
  getOrCompute("stripe:customers", getCustomerCount, 24 * 60 * MIN),
  getOrCompute("stripe:churn", getCanceledLast30Days, 60 * MIN),
]);
const s = subs.data, r = rev.data;
const collectionRate = s.mrr > 0 ? ((r.lastFullMonth / s.mrr) * 100).toFixed(1) : "0";
const activeAtStart = s.activeSubscriptions + canceled30.data;
const churn = activeAtStart > 0 ? ((canceled30.data / activeAtStart) * 100).toFixed(1) : "0";

console.log(`\nfetched in ${((Date.now() - t0) / 1000).toFixed(1)}s (fromCache: subs=${subs.meta.fromCache} rev=${rev.meta.fromCache} cust=${customers.meta.fromCache})\n`);
console.log("MRR run-rate         $", s.mrr.toLocaleString(), `(=$${s.mrrAnnualizedRunRate.toLocaleString()}/yr)`);
console.log("Active subs            ", s.activeSubscriptions.toLocaleString());
console.log("Customers              ", customers.data.toLocaleString());
console.log("Collected last full mo $", r.lastFullMonth.toLocaleString());
console.log("Collection rate        ", collectionRate + "%   <-- collected ÷ MRR run-rate");
console.log("12-mo revenue        $", r.total12mo.toLocaleString());
console.log("Past-due subs          ", s.pastDueSubscriptions.toLocaleString(), `($${s.pastDueMrrAtRisk.toLocaleString()}/mo at risk)`);
console.log("Churn (30d)            ", churn + "%", `(${canceled30.data} canceled)`);
console.log("By status              ", JSON.stringify(s.byStatus));
console.log("By interval            ", JSON.stringify(s.byInterval));
console.log("Revenue by month       ", r.byMonth.map((m: { month: string; revenue: number }) => `${m.month}:$${m.revenue}`).join("  "));
console.log("\nVerifying Neon cache round-trip (2nd call should be fromCache=true)...");
const again = await getOrCompute("stripe:subscriptions", getSubscriptionMetrics, 15 * MIN);
console.log("  2nd subscriptions call fromCache:", again.meta.fromCache, "| updatedAt:", again.meta.updatedAt);
process.exit(0);
