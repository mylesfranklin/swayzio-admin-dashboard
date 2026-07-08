import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { coerceNumbers, usd } from "../lib/format.js";

export default defineTool({
  description: "Monthly Mercury cashflow: inflow, outflow, net cashflow, and transaction count.",
  inputSchema: z.object({
    months: z.number().int().min(1).max(60).default(12),
  }),
  async execute({ months }) {
    const rows = (await osSql()`
      SELECT * FROM api.mercury_cashflow_monthly
      ORDER BY month_start DESC
      LIMIT ${months ?? 12}
    `) as Record<string, unknown>[];
    const latest = rows[0];
    return {
      summary: latest
        ? `Latest Mercury cashflow month ${latest.month_start}: inflow ${usd(latest.inflow)}, outflow ${usd(latest.outflow)}, net ${usd(latest.net_cashflow)}.`
        : "No Mercury monthly cashflow rows yet.",
      months: rows.map(coerceNumbers),
    };
  },
});
