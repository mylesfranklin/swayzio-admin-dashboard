import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";

export default defineTool({
  description:
    "How fresh the company data is: the most recent sync per feed (source, entity, status, finished_at, " +
    "rows_written, age). Check this before reporting numbers if recency matters.",
  inputSchema: z.object({}),
  async execute() {
    const rows = (await osSql()`SELECT * FROM api.freshness`) as Record<string, unknown>[];
    return { feeds: rows };
  },
});
