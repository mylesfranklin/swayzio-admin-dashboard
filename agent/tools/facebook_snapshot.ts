import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { coerceNumbers, int } from "../lib/format.js";

export default defineTool({
  description:
    "Facebook organic snapshot: page count, followers/fans, recent post freshness, and visible engagement totals.",
  inputSchema: z.object({}),
  async execute() {
    const rows = (await osSql()`SELECT * FROM api.facebook_organic_snapshot`) as Record<string, unknown>[];
    const row = rows[0] ? coerceNumbers(rows[0]) : null;
    return {
      summary: row
        ? `Facebook has ${int(row.followers)} follower(s), ${int(row.posts)} synced post(s), and latest post at ${row.latest_post_at ?? "unknown"}.`
        : "No Facebook organic snapshot is available yet.",
      snapshot: row,
    };
  },
});
