import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { coerceNumbers, int } from "../lib/format.js";

export default defineTool({
  description:
    "Stripe product and price catalog from api.stripe_product_catalog, including active flags, currency, amount, interval, and best-effort active subscription count.",
  inputSchema: z.object({
    active_only: z.boolean().default(false),
    limit: z.number().int().min(1).max(100).default(50),
  }),
  async execute({ active_only, limit }) {
    const rows = (await osSql().query(
      `SELECT * FROM api.stripe_product_catalog
       WHERE ($1::boolean = false OR product_active = true OR price_active = true)
       LIMIT $2`,
      [active_only ?? false, limit ?? 50],
    )) as Record<string, unknown>[];
    return { summary: `Returned ${int(rows.length)} Stripe catalog row(s).`, catalog: rows.map(coerceNumbers) };
  },
});
