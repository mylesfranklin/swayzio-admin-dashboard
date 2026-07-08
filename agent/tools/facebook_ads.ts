import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { coerceNumbers, int, pct, usd } from "../lib/format.js";

export default defineTool({
  description: "Facebook/Meta ads performance by day or campaign: spend, impressions, reach, clicks, CTR, CPC, CPM.",
  inputSchema: z.object({
    by: z.enum(["campaign", "day"]).default("campaign"),
    limit: z.number().int().min(1).max(100).default(25),
  }),
  async execute({ by, limit }) {
    const rows =
      by === "day"
        ? ((await osSql()`SELECT * FROM api.facebook_ads_daily LIMIT ${limit ?? 25}`) as Record<string, unknown>[])
        : ((await osSql()`SELECT * FROM api.facebook_campaign_summary LIMIT ${limit ?? 25}`) as Record<string, unknown>[]);
    const top = rows[0];
    return {
      summary: top
        ? `Top Facebook ads ${by} row spent ${usd(top.spend)} for ${int(top.impressions)} impression(s), ${int(top.clicks)} click(s), ${pct(top.ctr)} CTR.`
        : `No Facebook ads ${by} rows are available yet.`,
      rows: rows.map(coerceNumbers),
    };
  },
});
