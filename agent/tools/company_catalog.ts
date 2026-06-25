import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { int, coerceNumbers } from "../lib/format.js";

export default defineTool({
  description:
    "Top companies — labels, distributors, beat sellers — ranked by catalog size, derived from business " +
    "email domains (personal/internal domains excluded). Each: domain, contacts, tracks, subscribed, " +
    "signed_to_deal. Use for 'biggest labels / which companies / B2B accounts' questions.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(50).default(15).describe("how many companies to return"),
  }),
  async execute({ limit }) {
    const rows = (await osSql()`SELECT * FROM api.companies LIMIT ${limit ?? 15}`) as Record<string, unknown>[];
    const top = rows[0];
    const summary = top
      ? `Largest catalog by company: ${top.domain} (${int(top.tracks)} tracks, ${int(top.contacts)} contacts). Showing the top ${rows.length} by catalog size.`
      : "No company-level catalog found.";
    return { summary, companies: rows.map(coerceNumbers), count: rows.length };
  },
});
