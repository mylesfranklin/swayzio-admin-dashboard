import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { coerceNumbers, usd } from "../lib/format.js";

export default defineTool({
  description:
    "Monthly Stripe ledger from normalized charges/refunds/balance transactions: gross charged, refunds, net collected, fees, and net after fees.",
  inputSchema: z.object({
    months: z.number().int().min(1).max(24).default(12),
  }),
  async execute({ months }) {
    const rows = (await osSql()`SELECT * FROM api.stripe_billing_monthly ORDER BY month_start DESC LIMIT ${months ?? 12}`) as Record<string, unknown>[];
    const latest = rows[0];
    const summary = latest
      ? `Latest Stripe ledger month ${latest.month_start}: net collected ${usd(latest.net_collected)}, fees ${usd(latest.stripe_fees)}.`
      : "No Stripe billing ledger rows yet.";
    return { summary, months: rows.map(coerceNumbers) };
  },
});
