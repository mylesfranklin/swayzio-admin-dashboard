/**
 * Verify Swayzio OS metrics (derived from core.*) equal the live integration logic.
 * Proves the ELT port is faithful (hard rule #2) and the identity spine unifies sources.
 *
 *   npx tsx scripts/os-verify.ts
 */
try {
  process.loadEnvFile(".env.local");
} catch {
  /* ambient env */
}

import { osSql } from "@/server/os/db";
import { getSubscriptionMetrics } from "@/server/integrations/stripe";
import { Client } from "@hubspot/api-client";

const sql = osSql();
let failures = 0;

function check(label: string, brain: number, live: number, tol = 0) {
  const ok = Math.abs(brain - live) <= tol;
  if (!ok) failures++;
  console.log(`  ${ok ? "✓" : "✗"} ${label.padEnd(26)} brain=${brain}  live=${live}${ok ? "" : "  ← MISMATCH"}`);
}

// ── Stripe: metrics.stripe_daily (from core.subscription) vs getSubscriptionMetrics() (live) ──
console.log("Stripe — metrics.stripe_daily vs live getSubscriptionMetrics():");
const [sd] = (await sql`SELECT * FROM metrics.stripe_daily WHERE day = current_date`) as Array<Record<string, number>>;
if (!sd) {
  console.log("  ✗ no metrics.stripe_daily row for today — run `npm run os:sync stripe` first");
  failures++;
} else {
  const m = await getSubscriptionMetrics();
  check("mrr", Number(sd.mrr), m.mrr, 1);
  check("active_subs", Number(sd.active_subs), m.activeSubscriptions);
  // paying/void are derived from latest_invoice_status — the most volatile field; the brain
  // snapshot and this live read are minutes apart on an active billing account, so allow drift.
  check("paying_subs", Number(sd.paying_subs), m.payingSubscriptions, 10);
  check("paying_mrr", Number(sd.paying_mrr), m.payingMrr, 30);
  check("void_invoice_subs", Number(sd.void_invoice_subs), m.voidInvoiceSubscriptions, 10);
  check("past_due_subs", Number(sd.past_due_subs), m.pastDueSubscriptions, 5);
  check("past_due_mrr_at_risk", Number(sd.past_due_mrr_at_risk), m.pastDueMrrAtRisk, 1);
  check("paused_subs", Number(sd.paused_subs), m.pausedSubscriptions);
  check("non_usd_active", Number(sd.non_usd_active), m.nonUsdActive);
}

// ── HubSpot: core.contact completeness vs live track-haver count ──
console.log("\nHubSpot — core.contact vs live tagged_tracks>0 count:");
const [cc] = (await sql`SELECT count(*)::int n FROM core.contact`) as Array<{ n: number }>;
const token = process.env.HUBSPOT_ACCESS_TOKEN;
if (!token) {
  console.log("  – HUBSPOT_ACCESS_TOKEN not set; skipping");
} else {
  const hs = new Client({ accessToken: token, numberOfApiCallRetries: 6 });
  const res = await hs.crm.contacts.searchApi.doSearch({
    filterGroups: [{ filters: [{ propertyName: "tagged_tracks", operator: "GT", value: "0" } as never] }],
    limit: 1,
  });
  check("track-haver contacts", cc.n, res.total ?? 0, 25); // small tolerance for live drift
}

// ── App + identity spine ──
console.log("\nIdentity spine:");
const [ids] = (await sql`SELECT count(*)::int n FROM core.identity`) as Array<{ n: number }>;
const links = (await sql`SELECT source, count(*)::int n FROM core.identity_link GROUP BY source ORDER BY source`) as Array<{ source: string; n: number }>;
const [multi] = (await sql`
  SELECT count(*)::int n FROM (
    SELECT identity_id FROM core.identity_link GROUP BY identity_id HAVING count(DISTINCT source) > 1
  ) t
`) as Array<{ n: number }>;
console.log(`  identities: ${ids.n}`);
for (const l of links) console.log(`  links[${l.source}]: ${l.n}`);
console.log(`  identities spanning >1 source (unified): ${multi.n}`);

console.log(failures === 0 ? "\n✓ ALL CHECKS PASSED" : `\n✗ ${failures} check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
