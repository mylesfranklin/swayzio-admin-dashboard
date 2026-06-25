import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { num, usd, pct, int, coerceNumbers } from "../lib/format.js";

export default defineTool({
  description:
    "Latest Stripe headline metrics: MRR (USD booked run-rate), active vs paying subscriptions, " +
    "void-invoice and past-due counts, MRR at risk, collected-last-full-month, collection rate %, " +
    "12-month revenue, and churn. Returns a plain-English `summary` plus the numbers.",
  inputSchema: z.object({}),
  async execute() {
    const [row] = (await osSql()`SELECT * FROM api.stripe_snapshot`) as Record<string, unknown>[];
    if (!row) return { summary: "No Stripe snapshot yet — the Stripe feed has not run." };
    const summary =
      `MRR ${usd(num(row.mrr))}/mo · ${int(row.active_subs)} active subs (${int(row.paying_subs)} paying) · ` +
      `collection rate ${pct(row.collection_rate_pct)} · ${int(row.past_due_subs)} past-due (${usd(row.past_due_mrr_at_risk)}/mo at risk) · ` +
      `churn ${pct(row.churn_rate_pct)} · ${int(row.customers)} customers.`;
    return { summary, ...coerceNumbers(row) };
  },
});
