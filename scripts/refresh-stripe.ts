/** Force-refresh Stripe caches after a metric-shape change. Run: npx tsx scripts/refresh-stripe.ts */
import { readFileSync } from "node:fs";
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
}
const { refresh } = await import("../src/server/cache.ts");
const { getSubscriptionMetrics, getRevenueMetrics, getCanceledLast30Days } = await import("../src/server/integrations/stripe.ts");
const { getStripeDashboard } = await import("../src/server/integrations/stripe-dashboard.ts");
const MIN = 60_000;
console.log("refreshing subscriptions + revenue + churn (customers stays cached)…");
await Promise.all([
  refresh("stripe:subscriptions", getSubscriptionMetrics, 15 * MIN),
  refresh("stripe:revenue", getRevenueMetrics, 60 * MIN),
  refresh("stripe:churn", getCanceledLast30Days, 60 * MIN),
]);
const d = await getStripeDashboard();
const $ = (n: number) => "$" + n.toLocaleString();
console.log("\n=== honest reconciliation ===");
console.log("Booked MRR (list price):", $(d.mrr), "/mo");
console.log("Active (nominal):       ", d.activeSubscriptions.toLocaleString());
console.log("Paying subs:            ", d.payingSubscriptions.toLocaleString(), `(${d.payingRatePct}% of active) -> $${d.payingMrr.toLocaleString()}/mo booked`);
console.log("Void-invoice subs:      ", d.voidInvoiceSubscriptions.toLocaleString(), "(broken billing)");
console.log("Past-due subs:          ", d.pastDueSubscriptions.toLocaleString(), `($${d.pastDueMrrAtRisk.toLocaleString()}/mo at risk)`);
console.log("Collected last full mo: ", $(d.collectedLastFullMonth), `(${d.collectionRatePct}% of booked)`);
console.log("Customers:              ", d.customers.toLocaleString());
process.exit(0);
