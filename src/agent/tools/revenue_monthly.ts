import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";

export default defineTool({
  description:
    "Real collected revenue per month (succeeded charges minus refunds, USD net), trailing 12 months, " +
    "oldest first. Use for revenue trend questions — this is COLLECTED revenue, not booked MRR.",
  inputSchema: z.object({}),
  async execute() {
    const rows = (await osSql()`SELECT * FROM api.revenue_monthly`) as Record<string, unknown>[];
    return { months: rows };
  },
});
