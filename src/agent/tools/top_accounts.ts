import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";

export default defineTool({
  description:
    "Highest-value people (payers and/or catalog builders), unified across Stripe + HubSpot + app, " +
    "ranked by MRR then tagged tracks. Each row: email, display_name, mrr, active_subs, tagged_tracks, " +
    "pro, and in_stripe/in_hubspot/in_app flags.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(100).default(25).describe("how many accounts to return"),
  }),
  async execute({ limit }) {
    const rows = (await osSql()`SELECT * FROM api.top_accounts LIMIT ${limit}`) as Record<string, unknown>[];
    return { accounts: rows, count: rows.length };
  },
});
