import { NextResponse } from "next/server";
import { refresh } from "@/server/cache";
import {
  getSubscriptionMetrics,
  getRevenueMetrics,
  getCustomerCount,
  getCanceledLast30Days,
} from "@/server/integrations/stripe";
import {
  getContactCounts,
  getProDistribution,
  getContactGrowth,
  getPowerUsers,
  getCatalogScan,
  getReacquireCandidates,
  getEnumDistribution,
} from "@/server/integrations/hubspot";

// Warms the integration caches so user requests always hit warm data (ARCHITECTURE §9).
// Public route (excluded from Clerk in proxy.ts), secured by CRON_SECRET instead.
export const maxDuration = 300;
export const dynamic = "force-dynamic";

const MIN = 60 * 1000;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const jobs: Array<[string, () => Promise<unknown>, number]> = [
    ["stripe:subscriptions", getSubscriptionMetrics, 15 * MIN],
    ["stripe:revenue", getRevenueMetrics, 60 * MIN],
    ["stripe:customers", getCustomerCount, 24 * 60 * MIN],
    ["stripe:churn", getCanceledLast30Days, 60 * MIN],
    ["hubspot:counts", getContactCounts, 15 * MIN],
    ["hubspot:pro", getProDistribution, 30 * MIN],
    ["hubspot:growth", getContactGrowth, 6 * 60 * MIN],
    ["hubspot:power-users", () => getPowerUsers(50), 30 * MIN],
    ["hubspot:catalog", () => getCatalogScan(40), 60 * MIN],
    ["hubspot:reacquire", () => getReacquireCandidates(200), 30 * MIN],
    ["hubspot:acquisition", () => getEnumDistribution("acquisition_channel"), 60 * MIN],
    ["hubspot:roles", () => getEnumDistribution("role"), 60 * MIN],
    ["hubspot:company-types", () => getEnumDistribution("company_type"), 60 * MIN],
  ];

  const results = await Promise.allSettled(jobs.map(([key, fn, ttl]) => refresh(key, fn, ttl)));

  return NextResponse.json({
    refreshed: results.map((r, i) => ({ key: jobs[i][0], ok: r.status === "fulfilled" })),
  });
}
