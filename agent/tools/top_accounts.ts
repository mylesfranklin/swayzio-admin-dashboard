import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { num, usd, int, coerceNumbers } from "../lib/format.js";

export default defineTool({
  description:
    "Highest-value people (payers and/or catalog builders), unified across Stripe + HubSpot + app, " +
    "ranked by MRR then tagged tracks. Each row: email, display_name, mrr, active_subs, tagged_tracks, " +
    "pro, and in_stripe/in_hubspot/in_app flags. Returns a plain-English `summary` plus the rows.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(100).default(25).describe("how many accounts to return"),
  }),
  async execute({ limit }) {
    const rows = (await osSql()`SELECT * FROM api.top_accounts LIMIT ${limit ?? 25}`) as Record<string, unknown>[];
    const top = rows[0];
    const summary = top
      ? `Top account: ${top.display_name ?? top.email} — ${usd(num(top.mrr))}/mo, ${int(top.tagged_tracks)} tracks` +
        `${top.pro ? `, ${top.pro}` : ""}. Showing the top ${rows.length} by value.`
      : "No high-value accounts found.";
    return { summary, accounts: rows.map(coerceNumbers), count: rows.length };
  },
});
