import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { coerceNumbers, int } from "../lib/format.js";

export default defineTool({
  description:
    "Data-quality checks for Swayzio OS: source-vs-Neon row coverage, row deltas, null identity rate, " +
    "null email rate, and schema data-dictionary coverage.",
  inputSchema: z.object({}),
  async execute() {
    const rows = (await osSql()`SELECT * FROM api.data_quality`) as Record<string, unknown>[];
    const worst = rows
      .filter((r) => Number(r.null_identity_rows ?? 0) > 0 || Number(r.row_delta ?? 0) !== 0)
      .sort((a, b) => Number(b.null_identity_rows ?? 0) - Number(a.null_identity_rows ?? 0))[0];
    const summary = worst
      ? `Largest quality gap: ${worst.source}/${worst.entity} has ${int(worst.null_identity_rows)} null identity rows and row delta ${int(worst.row_delta)}.`
      : "No row-coverage or identity gaps reported by api.data_quality.";
    return { summary, checks: rows.map(coerceNumbers) };
  },
});
