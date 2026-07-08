import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { coerceNumbers } from "../lib/format.js";

export default defineTool({
  description:
    "Top Engaged: every known high-signal social account discovered through comments, DMs, mentions, and public enrichment. Supports platform, follower, recency, source, and action filters.",
  inputSchema: z.object({
    platform: z.enum(["all", "instagram", "facebook"]).default("all"),
    minFollowers: z.number().int().min(0).default(0),
    recencyDays: z.number().int().min(1).max(3650).optional(),
    source: z.enum(["all", "comment", "dm", "mention"]).default("all"),
    action: z.enum(["all", "Partnership lead", "Warm engager", "Recent touch", "DM follow-up", "Monitor"]).default("all"),
    limit: z.number().int().min(1).max(200).default(50),
  }),
  async execute({ platform, minFollowers, recencyDays, source, action, limit }) {
    const rows = (await osSql()`
      SELECT id, platform, username, display_name, biography, website, profile_url, follower_count,
             media_count, follower_tier, is_business_discovery_enriched, total_engagements,
             comment_count, dm_count, mention_count, latest_engagement_at, impact_score,
             suggested_action, recent_engagements
      FROM api.super_followers
      WHERE (${platform} = 'all' OR platform = ${platform})
        AND coalesce(follower_count, 0) >= ${minFollowers ?? 0}
        AND (${recencyDays ?? null}::int IS NULL OR latest_engagement_at >= now() - make_interval(days => ${recencyDays ?? 0}))
        AND (${source} = 'all'
          OR (${source} = 'comment' AND comment_count > 0)
          OR (${source} = 'dm' AND dm_count > 0)
          OR (${source} = 'mention' AND mention_count > 0))
        AND (${action} = 'all' OR suggested_action = ${action})
      ORDER BY impact_score DESC, latest_engagement_at DESC NULLS LAST
      LIMIT ${limit ?? 50}
    `) as Record<string, unknown>[];
    const top = rows[0];
    return {
      summary: top
        ? `${rows.length} top engaged account(s). Top account @${top.username ?? "unknown"} scores ${top.impact_score}.`
        : "No top engaged accounts match those filters.",
      rows: rows.map(coerceNumbers),
    };
  },
});
