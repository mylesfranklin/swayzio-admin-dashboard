import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { int, coerceNumbers } from "../lib/format.js";

export default defineTool({
  description:
    "Latest Swayzio-Core product metrics: billing customers, track owners, and live vs deleted track counts. " +
    "Returns a plain-English `summary` plus the numbers.",
  inputSchema: z.object({}),
  async execute() {
    const [row] = (await osSql()`SELECT * FROM api.app_snapshot`) as Record<string, unknown>[];
    if (!row) return { summary: "No app snapshot yet — the app feed has not run." };
    const summary =
      `${int(row.billing_customers)} billing customers · ${int(row.owners_with_tracks)} track owners · ` +
      `${int(row.live_tracks)} live tracks (${int(row.deleted_tracks)} deleted).`;
    return { summary, ...coerceNumbers(row) };
  },
});
