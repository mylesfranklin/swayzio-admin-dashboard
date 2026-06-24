import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";

export default defineTool({
  description:
    "Latest HubSpot headline metrics: total contacts, artists, subscribed, signed-to-deal, PRO-registered, " +
    "active subscribers (30/60d), and catalog totals (tagged/untagged tracks, artists with tracks). One row.",
  inputSchema: z.object({}),
  async execute() {
    const [row] = (await osSql()`SELECT * FROM api.hubspot_snapshot`) as Record<string, unknown>[];
    return row ?? { note: "No HubSpot snapshot yet — the HubSpot feed has not run." };
  },
});
