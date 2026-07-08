import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { coerceNumbers } from "../lib/format.js";

const Entity = z.enum([
  "pages",
  "page_insights",
  "posts",
  "post_insights",
  "ad_accounts",
  "campaigns",
  "ad_insights",
]);

async function readEntity(entity: z.infer<typeof Entity>, limit: number, includeRaw: boolean): Promise<Record<string, unknown>[]> {
  const sql = osSql();
  switch (entity) {
    case "pages":
      return includeRaw
        ? ((await sql`SELECT * FROM api.facebook_pages LIMIT ${limit}`) as Record<string, unknown>[])
        : ((await sql`
            SELECT id, name, username, category, fan_count, followers_count, link,
                   website, verification_status, is_published, is_verified,
                   instagram_business_account_id, connected_instagram_account_id
            FROM api.facebook_pages LIMIT ${limit}`) as Record<string, unknown>[]);
    case "page_insights":
      return (await sql`
        SELECT page_id, metric_name, title, period, end_time, value, numeric_value
        FROM api.facebook_page_insights LIMIT ${limit}`) as Record<string, unknown>[];
    case "posts":
      return includeRaw
        ? ((await sql`SELECT * FROM api.facebook_posts LIMIT ${limit}`) as Record<string, unknown>[])
        : ((await sql`
            SELECT id, page_id, page_name, created_time, updated_time, permalink_url,
                   message, story, status_type, type, shares_count, comments_count,
                   likes_count, reactions_count
            FROM api.facebook_posts LIMIT ${limit}`) as Record<string, unknown>[]);
    case "post_insights":
      return (await sql`
        SELECT post_id, page_id, metric_name, title, period, end_time, value, numeric_value,
               post_created_time, permalink_url, message
        FROM api.facebook_post_insights LIMIT ${limit}`) as Record<string, unknown>[];
    case "ad_accounts":
      return includeRaw
        ? ((await sql`SELECT * FROM api.facebook_ad_accounts LIMIT ${limit}`) as Record<string, unknown>[])
        : ((await sql`
            SELECT id, account_id, name, account_status, currency, timezone_name,
                   amount_spent, balance
            FROM api.facebook_ad_accounts LIMIT ${limit}`) as Record<string, unknown>[]);
    case "campaigns":
      return includeRaw
        ? ((await sql`SELECT * FROM api.facebook_campaigns LIMIT ${limit}`) as Record<string, unknown>[])
        : ((await sql`
            SELECT id, ad_account_id, ad_account_name, name, status, effective_status,
                   objective, buying_type, created_time, updated_time, start_time, stop_time
            FROM api.facebook_campaigns LIMIT ${limit}`) as Record<string, unknown>[]);
    case "ad_insights":
      return includeRaw
        ? ((await sql`SELECT * FROM api.facebook_ad_insights LIMIT ${limit}`) as Record<string, unknown>[])
        : ((await sql`
            SELECT ad_account_id, ad_account_name, campaign_id, campaign_name, date_start,
                   date_stop, impressions, reach, clicks, spend, cpc, cpm, ctr
            FROM api.facebook_ad_insights LIMIT ${limit}`) as Record<string, unknown>[]);
  }
}

export default defineTool({
  description:
    "Read normalized Facebook OS entities: pages, page insights, posts, post insights, ad accounts, campaigns, or ad insights. Use includeRaw for sanitized source payloads.",
  inputSchema: z.object({
    entity: Entity,
    limit: z.number().int().min(1).max(200).default(50),
    includeRaw: z.boolean().default(false),
  }),
  async execute({ entity, limit, includeRaw }) {
    const rows = await readEntity(entity, limit ?? 50, includeRaw ?? false);
    return {
      summary: `${rows.length} Facebook ${entity} row(s).${includeRaw ? " Sanitized raw source payloads included." : ""}`,
      entity,
      rows: rows.map(coerceNumbers),
    };
  },
});
