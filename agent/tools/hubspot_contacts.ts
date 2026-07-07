import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { coerceNumbers, int } from "../lib/format.js";

export default defineTool({
  description:
    "Search full HubSpot CRM contacts from api.hubspot_contacts. Includes company context, subscribed/pro/catalog fields, " +
    "and Stripe/app identity overlap. Deals are intentionally excluded.",
  inputSchema: z.object({
    domain: z.string().optional().describe("email/company domain filter, e.g. label.com"),
    subscribed: z.boolean().optional(),
    has_tracks: z.boolean().optional().describe("true for tagged_tracks > 0"),
    limit: z.number().int().min(1).max(100).default(25),
  }),
  async execute({ domain, subscribed, has_tracks, limit }) {
    const rows = (await osSql().query(
      `SELECT * FROM api.hubspot_contacts
       WHERE ($1::text IS NULL OR company_domain = $1 OR split_part(lower(email::text), '@', 2) = $1)
         AND ($2::boolean IS NULL OR subscribed = $2)
         AND ($3::boolean IS NULL OR (($3 AND tagged_tracks > 0) OR (NOT $3 AND tagged_tracks = 0)))
       LIMIT $4`,
      [domain ?? null, subscribed ?? null, has_tracks ?? null, limit ?? 25],
    )) as Record<string, unknown>[];
    return { summary: `Found ${int(rows.length)} HubSpot contact(s).`, contacts: rows.map(coerceNumbers) };
  },
});
