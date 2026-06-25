import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";

export default defineTool({
  description:
    "The Swayzio OS data dictionary: plain-English descriptions of every schema/table/view. " +
    "Call this first if you're unsure what data exists or what a field means. Optionally filter by schema.",
  inputSchema: z.object({
    schema: z.string().optional().describe("filter to one schema: api | core | metrics | memory | ops | raw"),
  }),
  async execute({ schema }) {
    const rows = (await osSql()`
      SELECT * FROM api.data_dictionary
      WHERE (${schema ?? null}::text IS NULL OR schema_name = ${schema ?? null})
    `) as Record<string, unknown>[];
    return { entries: rows };
  },
});
