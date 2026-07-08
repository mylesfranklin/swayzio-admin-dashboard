import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { coerceNumbers, int } from "../lib/format.js";

export default defineTool({
  description: "Instagram professional account snapshot: accounts, followers, media counts, and visible likes/comments.",
  inputSchema: z.object({}),
  async execute() {
    const rows = (await osSql()`SELECT * FROM api.instagram_snapshot`) as Record<string, unknown>[];
    const row = rows[0] ? coerceNumbers(rows[0]) : null;
    return {
      summary: row
        ? `Instagram has ${int(row.followers)} follower(s), ${int(row.synced_media)} synced media item(s), and latest media at ${row.latest_media_at ?? "unknown"}.`
        : "No Instagram snapshot is available yet.",
      snapshot: row,
    };
  },
});
