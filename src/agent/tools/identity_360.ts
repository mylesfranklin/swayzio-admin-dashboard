import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";

export default defineTool({
  description:
    "Look up people unified across Stripe + HubSpot + app (the identity spine). Filter by email " +
    "(partial match), company domain, minimum MRR, and/or whether they have tagged tracks. Returns " +
    "one row per person: email, display_name, mrr, active_subs, tagged_tracks, pro, hubspot_subscribed, " +
    "signed_to_deal, and in_stripe/in_hubspot/in_app. Use this for 'who is X' and cohort questions.",
  inputSchema: z.object({
    email: z.string().optional().describe("partial email match (case-insensitive)"),
    domain: z.string().optional().describe("exact company email domain, e.g. 'dayonemusic.com'"),
    min_mrr: z.number().optional().describe("only people with at least this MRR ($/mo)"),
    has_tracks: z.boolean().optional().describe("true = only people with tagged tracks"),
    limit: z.number().int().min(1).max(100).default(25),
  }),
  async execute({ email, domain, min_mrr, has_tracks, limit }) {
    const rows = (await osSql()`
      SELECT * FROM api.identity_360
      WHERE (${email ?? null}::text     IS NULL OR email ILIKE '%' || ${email ?? null} || '%')
        AND (${domain ?? null}::text    IS NULL OR primary_domain = ${domain ?? null})
        AND (${min_mrr ?? null}::numeric IS NULL OR coalesce(mrr, 0) >= ${min_mrr ?? null})
        AND (${has_tracks ?? null}::boolean IS NULL OR (coalesce(tagged_tracks, 0) > 0) = ${has_tracks ?? null})
      ORDER BY coalesce(mrr, 0) DESC, coalesce(tagged_tracks, 0) DESC
      LIMIT ${limit}
    `) as Record<string, unknown>[];
    return { people: rows, count: rows.length, truncated: rows.length === limit };
  },
});
