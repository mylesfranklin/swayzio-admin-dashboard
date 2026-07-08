import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { coerceNumbers, usd } from "../lib/format.js";

export default defineTool({
  description: "Mercury spend rollups by category or counterparty, useful for burn, vendor, and anomaly analysis.",
  inputSchema: z.object({
    by: z.enum(["category", "counterparty"]).default("category"),
    limit: z.number().int().min(1).max(100).default(25),
  }),
  async execute({ by, limit }) {
    const rows =
      by === "counterparty"
        ? ((await osSql()`SELECT * FROM api.mercury_counterparties LIMIT ${limit ?? 25}`) as Record<string, unknown>[])
        : ((await osSql()`SELECT * FROM api.mercury_spend_by_category LIMIT ${limit ?? 25}`) as Record<string, unknown>[]);
    const top = rows[0];
    const label = by === "counterparty" ? top?.counterparty : top?.category;
    const spend = by === "counterparty" ? top?.outflow : top?.spend;
    return {
      summary: top ? `Top Mercury ${by} is ${label} at ${usd(spend)}.` : `No Mercury ${by} spend rows yet.`,
      rows: rows.map(coerceNumbers),
    };
  },
});
