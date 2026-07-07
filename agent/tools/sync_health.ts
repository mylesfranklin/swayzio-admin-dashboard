import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { coerceNumbers } from "../lib/format.js";

export default defineTool({
  description:
    "Detailed sync health for each OS feed: source, entity, status, timestamps, row counts, stale_8h, " +
    "and error flags. Use before answering freshness-sensitive questions.",
  inputSchema: z.object({}),
  async execute() {
    const rows = (await osSql()`
      SELECT source, entity, status, started_at::text AS started_at, finished_at::text AS finished_at,
             duration_ms, rows_read, rows_written, age::text AS age, has_error, stale_8h
      FROM api.sync_health`) as Record<string, unknown>[];
    const bad = rows.filter((r) => r.has_error || r.stale_8h || r.status !== "ok");
    return {
      summary: bad.length ? `${bad.length} feed(s) need attention: ${bad.map((r) => `${r.source}/${r.entity}`).join(", ")}.` : "All feeds are ok and fresh within 8h.",
      feeds: rows.map(coerceNumbers),
    };
  },
});
