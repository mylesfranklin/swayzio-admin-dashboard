import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { num, usd, pct, int } from "../lib/format.js";

export default defineTool({
  description:
    "The real revenue-health picture: booked MRR vs cash actually collected, collection rate, MRR at risk " +
    "(past-due), and the void-invoice gap. Use this for any 'how's revenue / are we healthy / cash vs MRR' " +
    "question — it surfaces the booked-vs-collected gap the founders care about most.",
  inputSchema: z.object({}),
  async execute() {
    const [s] = (await osSql()`SELECT * FROM api.stripe_snapshot`) as Record<string, unknown>[];
    if (!s) return { summary: "No Stripe data yet — the feed hasn't run." };

    const mrr = num(s.mrr);
    const collected = num(s.collected_last_full_month);
    const rate = num(s.collection_rate_pct);
    const active = num(s.active_subs);
    const paying = num(s.paying_subs);
    const voidSubs = num(s.void_invoice_subs);
    const pastDue = num(s.past_due_subs);
    const atRisk = num(s.past_due_mrr_at_risk);
    const rev12 = num(s.revenue_12mo);

    const summary =
      `Booked MRR is ${usd(mrr)}/mo, but only ${usd(collected)} was collected last full month — ` +
      `collection rate ${pct(rate)}. Of ${int(active)} active subscriptions, ${int(paying)} actually pay; ` +
      `${int(voidSubs)} carry void invoices (broken billing). ${int(pastDue)} are past-due (${usd(atRisk)}/mo at risk). ` +
      `Trailing 12-month collected revenue: ${usd(rev12)}.`;

    return {
      summary,
      booked_mrr_usd: mrr,
      collected_last_full_month_usd: collected,
      collection_rate_pct: rate,
      active_subs: active,
      paying_subs: paying,
      void_invoice_subs: voidSubs,
      past_due_subs: pastDue,
      mrr_at_risk_usd: atRisk,
      revenue_12mo_usd: rev12,
    };
  },
});
