/** End-to-end HubSpot verification: live API → Neon cache → metrics. Run: npx tsx scripts/verify-hubspot.ts */
import { readFileSync } from "node:fs";
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
}
const { getContactCounts, getProDistribution, getContactGrowth, getPowerUsers, getCatalogScan, getUpsellTargets, getEnumDistribution } =
  await import("../src/server/integrations/hubspot.ts");
const { getOrCompute } = await import("../src/server/cache.ts");
const MIN = 60_000;
const t0 = Date.now();
const [counts, pro, growth, power, catalog, upsell, acq, roles, ctypes] = await Promise.all([
  getOrCompute("hubspot:counts", getContactCounts, 15 * MIN),
  getOrCompute("hubspot:pro", getProDistribution, 30 * MIN),
  getOrCompute("hubspot:growth", getContactGrowth, 6 * 60 * MIN),
  getOrCompute("hubspot:power-users", () => getPowerUsers(50), 30 * MIN),
  getOrCompute("hubspot:catalog", () => getCatalogScan(40), 60 * MIN),
  getOrCompute("hubspot:upsell", () => getUpsellTargets(200), 30 * MIN),
  getOrCompute("hubspot:acquisition", () => getEnumDistribution("acquisition_channel"), 60 * MIN),
  getOrCompute("hubspot:roles", () => getEnumDistribution("role"), 60 * MIN),
  getOrCompute("hubspot:company-types", () => getEnumDistribution("company_type"), 60 * MIN),
]);
const fmtDist = (d: Array<{ label: string; value: number }>) => d.map((x) => `${x.label} ${x.value}`).join(" · ");
console.log("\nUpsell targets:", upsell.data.totalTargets.toLocaleString(), "| buckets:", fmtDist(upsell.data.buckets), "| emails:", upsell.data.emails.length);
console.log("Acquisition:", fmtDist(acq.data));
console.log("Roles:", fmtDist(roles.data));
console.log("Company types:", fmtDist(ctypes.data));
const c = counts.data;
console.log(`\nfetched in ${((Date.now() - t0) / 1000).toFixed(1)}s (fromCache: counts=${counts.meta.fromCache} catalog=${catalog.meta.fromCache})\n`);
console.log("Total contacts:", c.totalContacts.toLocaleString(), "| artists:", c.artists.toLocaleString());
console.log("Subscribed:", c.subscribed.toLocaleString(), `(${((c.subscribed / c.artists) * 100).toFixed(1)}%)`, "| Signed:", c.signedToDeal.toLocaleString(), "| has PRO:", c.hasPro.toLocaleString());
console.log("Tagged tracks:", catalog.data.taggedTracksTotal.toLocaleString(), "across", catalog.data.artistsWithTracks.toLocaleString(), "artists");
console.log("PRO:", pro.data.map((d: { label: string; value: number }) => `${d.label} ${d.value}`).join(" · "));
console.log("Growth (new/mo):", growth.data.map((m: { month: string; contacts: number }) => `${m.month}:${m.contacts}`).join("  "));
console.log("\nTop 5 power users:");
for (const u of power.data.slice(0, 5)) console.log(`  ${u.name.padEnd(22)} ${String(u.tracks).padStart(5)} tracks  ${u.email}`);
console.log("\nTop 5 companies (by tracks):");
for (const co of catalog.data.companies.slice(0, 5)) console.log(`  ${co.domain.padEnd(26)} ${String(co.tracks).padStart(5)} tracks  users=${co.users}`);
process.exit(0);
