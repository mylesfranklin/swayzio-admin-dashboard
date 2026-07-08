import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { coerceNumbers, int } from "../lib/format.js";

export default defineTool({
  description: "Top or recent Facebook posts with visible engagement counts and post links.",
  inputSchema: z.object({
    order: z.enum(["top", "recent"]).default("top"),
    limit: z.number().int().min(1).max(100).default(25),
  }),
  async execute({ order, limit }) {
    const rows =
      order === "recent"
        ? ((await osSql()`
            SELECT id, page_id, page_name, created_time, permalink_url,
                   left(coalesce(message, story, ''), 240) AS preview,
                   reactions_count AS reactions, comments_count AS comments, shares_count AS shares,
                   (coalesce(reactions_count,0)+coalesce(comments_count,0)+coalesce(shares_count,0)) AS engagement
            FROM api.facebook_posts
            ORDER BY created_time DESC NULLS LAST
            LIMIT ${limit ?? 25}`) as Record<string, unknown>[])
        : ((await osSql()`SELECT * FROM api.facebook_top_posts LIMIT ${limit ?? 25}`) as Record<string, unknown>[]);
    const top = rows[0];
    return {
      summary: top
        ? `Top Facebook post in this result has ${int(top.engagement)} visible engagement(s).`
        : "No Facebook posts are available yet.",
      rows: rows.map(coerceNumbers),
    };
  },
});
