import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { num, usd, coerceNumbers } from "../lib/format.js";

export default defineTool({
  description:
    "MRR and subscription trend over time: a daily metrics series plus collected-revenue by month (12mo). " +
    "Use for 'how is MRR / revenue trending' questions. Note: the daily series begins 2026-06-23 and grows " +
    "one point per day, so the monthly collected-revenue series is the longer history for now.",
  inputSchema: z.object({}),
  async execute() {
    const daily = (await osSql()`SELECT * FROM api.stripe_trend`) as Record<string, unknown>[];
    const monthly = (await osSql()`SELECT * FROM api.revenue_monthly`) as Record<string, unknown>[];

    let mrrLine: string;
    if (daily.length >= 2) {
      const first = num(daily[0].mrr);
      const last = num(daily[daily.length - 1].mrr);
      const delta = (last ?? 0) - (first ?? 0);
      mrrLine = `MRR is ${usd(last)}/mo (${delta >= 0 ? "+" : "−"}${usd(Math.abs(delta))} over ${daily.length} days of daily snapshots).`;
    } else if (daily.length === 1) {
      mrrLine = `MRR is ${usd(num(daily[0].mrr))}/mo — only 1 day of daily history so far.`;
    } else {
      mrrLine = "No daily MRR history yet.";
    }

    let revLine = "";
    if (monthly.length >= 2) {
      const lastFull = num(monthly[monthly.length - 2].revenue);
      const prior = num(monthly[monthly.length - 3]?.revenue);
      revLine =
        prior != null
          ? ` Collected revenue last full month ${usd(lastFull)} vs ${usd(prior)} the month before.`
          : ` Collected revenue last full month: ${usd(lastFull)}.`;
    }

    return {
      summary: mrrLine + revLine,
      daily_series: daily.map(coerceNumbers),
      collected_by_month: monthly.map(coerceNumbers),
    };
  },
});
