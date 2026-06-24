import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";

export default defineTool({
  description:
    "Latest Stripe headline metrics: MRR (USD booked run-rate), active vs paying subscriptions, " +
    "void-invoice and past-due counts, MRR at risk, collected-last-full-month, collection rate %, " +
    "12-month revenue, and churn. One row (today's snapshot).",
  inputSchema: z.object({}),
  async execute() {
    const [row] = (await osSql()`SELECT * FROM api.stripe_snapshot`) as Record<string, unknown>[];
    return row ?? { note: "No Stripe snapshot yet — the Stripe feed has not run." };
  },
});
