import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { coerceNumbers } from "../lib/format.js";

export default defineTool({
  description:
    "How fresh the company data is: the most recent sync per feed (source, entity, status, finished_at, " +
    "rows_written, age). Returns a plain-English `summary` plus the rows. Check before reporting numbers " +
    "if recency matters.",
  inputSchema: z.object({}),
  async execute() {
    const rows = (await osSql()`SELECT * FROM api.freshness`) as Record<string, unknown>[];
    const summary = rows.length
      ? rows.map((r) => `${r.source}/${r.entity}: ${r.status} (${String(r.age).split(".")[0]} ago)`).join(" · ")
      : "No sync runs yet.";
    return { summary, feeds: rows.map(coerceNumbers) };
  },
});
