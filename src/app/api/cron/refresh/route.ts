import { NextResponse } from "next/server";
import { refresh } from "@/server/cache";
import {
  getSubscriptionMetrics,
  getRevenueMetrics,
  getCustomerCount,
  getCanceledLast30Days,
} from "@/server/integrations/stripe";

// Warms the Stripe caches so user requests always hit warm data (see ARCHITECTURE §9).
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

  const results = await Promise.allSettled([
    refresh("stripe:subscriptions", getSubscriptionMetrics, 15 * MIN),
    refresh("stripe:revenue", getRevenueMetrics, 60 * MIN),
    refresh("stripe:customers", getCustomerCount, 24 * 60 * MIN),
    refresh("stripe:churn", getCanceledLast30Days, 60 * MIN),
  ]);

  return NextResponse.json({
    refreshed: results.map((r, i) => ({
      key: ["subscriptions", "revenue", "customers", "churn"][i],
      ok: r.status === "fulfilled",
    })),
  });
}
