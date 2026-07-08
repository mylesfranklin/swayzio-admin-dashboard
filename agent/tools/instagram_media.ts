import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { coerceNumbers, int } from "../lib/format.js";

export default defineTool({
  description: "Top or recent Instagram media with captions, media type, permalink, likes, comments, and visible engagement.",
  inputSchema: z.object({
    order: z.enum(["top", "recent"]).default("top"),
    limit: z.number().int().min(1).max(100).default(25),
  }),
  async execute({ order, limit }) {
    const rows =
      order === "recent"
        ? ((await osSql()`
            SELECT id, instagram_account_id, account_username, media_type, media_product_type,
                   timestamp, permalink, left(coalesce(caption, ''), 240) AS preview,
                   like_count AS likes, comments_count AS comments,
                   (coalesce(like_count,0)+coalesce(comments_count,0)) AS engagement
            FROM api.instagram_media
            ORDER BY timestamp DESC NULLS LAST
            LIMIT ${limit ?? 25}`) as Record<string, unknown>[])
        : ((await osSql()`SELECT * FROM api.instagram_top_media LIMIT ${limit ?? 25}`) as Record<string, unknown>[]);
    const top = rows[0];
    return {
      summary: top ? `Top Instagram media in this result has ${int(top.engagement)} visible engagement(s).` : "No Instagram media is available yet.",
      rows: rows.map(coerceNumbers),
    };
  },
});
