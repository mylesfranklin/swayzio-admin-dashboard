import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";

export default defineTool({
  description:
    "Latest Swayzio-Core product metrics: billing customers, track owners, and live vs deleted track counts. One row.",
  inputSchema: z.object({}),
  async execute() {
    const [row] = (await osSql()`SELECT * FROM api.app_snapshot`) as Record<string, unknown>[];
    return row ?? { note: "No app snapshot yet — the app feed has not run." };
  },
});
