import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { coerceNumbers, int } from "../lib/format.js";

export default defineTool({
  description:
    "HubSpot companies with contact/catalog rollups from api.hubspot_companies. Deals are intentionally excluded.",
  inputSchema: z.object({
    domain: z.string().optional(),
    min_contacts: z.number().int().min(0).optional(),
    min_tracks: z.number().int().min(0).optional(),
    limit: z.number().int().min(1).max(100).default(25),
  }),
  async execute({ domain, min_contacts, min_tracks, limit }) {
    const rows = (await osSql().query(
      `SELECT * FROM api.hubspot_companies
       WHERE ($1::text IS NULL OR domain = $1)
         AND contacts >= $2
         AND tagged_tracks >= $3
       LIMIT $4`,
      [domain ?? null, min_contacts ?? 0, min_tracks ?? 0, limit ?? 25],
    )) as Record<string, unknown>[];
    const top = rows[0];
    const summary = top
      ? `Top HubSpot company returned: ${top.name ?? top.domain} (${int(top.contacts)} contacts, ${int(top.tagged_tracks)} tracks).`
      : "No HubSpot companies matched.";
    return { summary, companies: rows.map(coerceNumbers) };
  },
});
