/** Force-refresh HubSpot caches after a shape change. Run: npx tsx scripts/refresh-hubspot.ts */
import { readFileSync } from "node:fs";
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
}
const { getCatalogScan, getPowerUsers } = await import("../src/server/integrations/hubspot.ts");
const { refresh } = await import("../src/server/cache.ts");
const MIN = 60_000;
console.log("refreshing hubspot:catalog (new Company shape) + power-users…");
const cat = await refresh("hubspot:catalog", () => getCatalogScan(40), 60 * MIN);
await refresh("hubspot:power-users", () => getPowerUsers(50), 30 * MIN);
console.log("done. sample companies (with lastActivity):");
for (const co of cat.companies.slice(0, 6))
  console.log(`  ${co.domain.padEnd(26)} tracks=${String(co.tracks).padStart(5)} users=${co.users} subs=${co.subscribed} last=${(co.lastActivity || "").slice(0, 10) || "—"}`);
process.exit(0);
