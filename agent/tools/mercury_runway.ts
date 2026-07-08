import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { coerceNumbers, usd } from "../lib/format.js";

export default defineTool({
  description: "Simple Mercury runway inputs from available cash and last 90 days net cashflow.",
  inputSchema: z.object({}),
  async execute() {
    const rows = (await osSql()`SELECT * FROM api.mercury_runway_inputs`) as Record<string, unknown>[];
    const row = rows[0] ? coerceNumbers(rows[0]) : null;
    return {
      summary: row
        ? `Estimated monthly burn is ${usd(row.estimated_monthly_burn)} with ${row.runway_months ?? "unbounded"} month(s) of runway from Mercury cash.`
        : "No Mercury runway inputs are available yet.",
      runway: row,
    };
  },
});
