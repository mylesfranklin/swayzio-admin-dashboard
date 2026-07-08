import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { coerceNumbers } from "../lib/format.js";

const Entity = z.enum(["accounts", "media", "account_insights", "media_insights"]);

async function readEntity(entity: z.infer<typeof Entity>, limit: number, includeRaw: boolean): Promise<Record<string, unknown>[]> {
  const sql = osSql();
  switch (entity) {
    case "accounts":
      return includeRaw
        ? ((await sql`SELECT * FROM api.instagram_accounts LIMIT ${limit}`) as Record<string, unknown>[])
        : ((await sql`
            SELECT id, facebook_page_id, facebook_page_name, username, name, biography, website,
                   followers_count, follows_count, media_count, ig_id
            FROM api.instagram_accounts LIMIT ${limit}`) as Record<string, unknown>[]);
    case "media":
      return includeRaw
        ? ((await sql`SELECT * FROM api.instagram_media LIMIT ${limit}`) as Record<string, unknown>[])
        : ((await sql`
            SELECT id, instagram_account_id, account_username, media_type, media_product_type,
                   timestamp, permalink, caption, like_count, comments_count
            FROM api.instagram_media LIMIT ${limit}`) as Record<string, unknown>[]);
    case "account_insights":
      return (await sql`
        SELECT instagram_account_id, metric_name, title, period, end_time, value, numeric_value
        FROM api.instagram_account_insights LIMIT ${limit}`) as Record<string, unknown>[];
    case "media_insights":
      return (await sql`
        SELECT media_id, instagram_account_id, metric_name, title, period, end_time, value,
               numeric_value, media_timestamp, permalink, caption, media_type
        FROM api.instagram_media_insights LIMIT ${limit}`) as Record<string, unknown>[];
  }
}

export default defineTool({
  description:
    "Read normalized Instagram OS entities: accounts, media, account insights, or media insights. Use includeRaw for sanitized source payloads.",
  inputSchema: z.object({
    entity: Entity,
    limit: z.number().int().min(1).max(200).default(50),
    includeRaw: z.boolean().default(false),
  }),
  async execute({ entity, limit, includeRaw }) {
    const rows = await readEntity(entity, limit ?? 50, includeRaw ?? false);
    return {
      summary: `${rows.length} Instagram ${entity} row(s).${includeRaw ? " Sanitized raw source payloads included." : ""}`,
      entity,
      rows: rows.map(coerceNumbers),
    };
  },
});
