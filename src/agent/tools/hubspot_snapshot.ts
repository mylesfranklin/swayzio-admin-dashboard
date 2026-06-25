import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";
import { int, coerceNumbers } from "../lib/format.js";

export default defineTool({
  description:
    "Latest HubSpot headline metrics: total contacts, artists, subscribed, signed-to-deal, PRO-registered, " +
    "active subscribers (30/60d), and catalog totals (tagged/untagged tracks, artists with tracks). " +
    "Returns a plain-English `summary` plus the numbers.",
  inputSchema: z.object({}),
  async execute() {
    const [row] = (await osSql()`SELECT * FROM api.hubspot_snapshot`) as Record<string, unknown>[];
    if (!row) return { summary: "No HubSpot snapshot yet — the HubSpot feed has not run." };
    const summary =
      `${int(row.total_contacts)} contacts · ${int(row.artists)} artists · ${int(row.subscribed)} subscribed · ` +
      `${int(row.signed_to_deal)} signed · catalog ${int(row.tagged_tracks_total)} tagged tracks across ` +
      `${int(row.artists_with_tracks)} artists.`;
    return { summary, ...coerceNumbers(row) };
  },
});
