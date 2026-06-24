/**
 * HubSpot ELT feed → Swayzio OS.  Paginates catalog artists (tagged_tracks > 0) →
 * raw.records → core.contact (identity-resolved by email) → metrics.hubspot_daily.
 *
 * Counts for the daily snapshot reuse the verified getContactCounts/getActiveSubscribers from
 * src/server/integrations/hubspot.ts; catalog totals are derived from core.contact we just loaded.
 */
import { Client } from "@hubspot/api-client";
import { osSql } from "../db";
import { withSyncRun } from "../sync";
import { chunk, resolveIdentities, landRaw } from "../load";
import { getContactCounts, getActiveSubscribers } from "@/server/integrations/hubspot";

function client(): Client {
  const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!accessToken) throw new Error("HUBSPOT_ACCESS_TOKEN is not set");
  return new Client({ accessToken, numberOfApiCallRetries: 6 });
}

interface ContactRow {
  id: string;
  email: string | null;
  artistName: string | null;
  tagged: number;
  untagged: number;
  pro: string | null;
  subscribed: boolean | null;
  signed: boolean | null;
  lastModified: string | null;
}

const PROPS = ["email", "artist_name", "tagged_tracks", "untagged_tracks", "pro", "subscribed", "signed_to_deal", "lastmodifieddate"];
const bool = (v: string | null | undefined) => (v == null || v === "" ? null : v === "true");

async function upsertContacts(sql: ReturnType<typeof osSql>, runId: number, rows: ContactRow[]) {
  await landRaw(sql, "hubspot", "contact", runId, rows.map((r) => ({ sourceId: r.id, payload: r })));
  await resolveIdentities(sql, "hubspot", rows.map((r) => ({ sourceId: r.id, email: r.email, name: r.artistName })));
  await sql`
    INSERT INTO core.contact
      (id, email, artist_name, tagged_tracks, untagged_tracks, pro, subscribed, signed_to_deal, last_modified, identity_id)
    SELECT u.id, NULLIF(u.email,'')::citext, u.artist_name, u.tagged::int, u.untagged::int,
           NULLIF(u.pro,''), u.subscribed::boolean, u.signed::boolean, NULLIF(u.last_modified,'')::timestamptz, i.id
    FROM unnest(
      ${rows.map((r) => r.id)}::text[], ${rows.map((r) => r.email)}::text[], ${rows.map((r) => r.artistName)}::text[],
      ${rows.map((r) => r.tagged)}::int[], ${rows.map((r) => r.untagged)}::int[], ${rows.map((r) => r.pro)}::text[],
      ${rows.map((r) => (r.subscribed === null ? null : String(r.subscribed)))}::text[],
      ${rows.map((r) => (r.signed === null ? null : String(r.signed)))}::text[],
      ${rows.map((r) => r.lastModified)}::text[]
    ) AS u(id, email, artist_name, tagged, untagged, pro, subscribed, signed, last_modified)
    LEFT JOIN core.identity i ON i.email = NULLIF(u.email,'')::citext
    ON CONFLICT (id) DO UPDATE SET
      email=EXCLUDED.email, artist_name=EXCLUDED.artist_name, tagged_tracks=EXCLUDED.tagged_tracks,
      untagged_tracks=EXCLUDED.untagged_tracks, pro=EXCLUDED.pro, subscribed=EXCLUDED.subscribed,
      signed_to_deal=EXCLUDED.signed_to_deal, last_modified=EXCLUDED.last_modified,
      identity_id=EXCLUDED.identity_id, synced_at=now()
  `;
}

export async function syncHubspotContacts() {
  return withSyncRun("hubspot", "contact", async (ctx) => {
    const sql = osSql();
    const c = client();
    let after: string | undefined;
    let buffer: ContactRow[] = [];
    do {
      const page = await c.crm.contacts.searchApi.doSearch({
        filterGroups: [{ filters: [{ propertyName: "tagged_tracks", operator: "GT", value: "0" } as never] }],
        sorts: ["-tagged_tracks" as never],
        properties: PROPS,
        limit: 100,
        ...(after ? { after } : {}),
      });
      ctx.read(page.results.length);
      for (const r of page.results) {
        const p = r.properties;
        buffer.push({
          id: r.id,
          email: p.email || null,
          artistName: p.artist_name || null,
          tagged: Number(p.tagged_tracks || 0),
          untagged: Number(p.untagged_tracks || 0),
          pro: p.pro || null,
          subscribed: bool(p.subscribed),
          signed: bool(p.signed_to_deal),
          lastModified: p.lastmodifieddate || null,
        });
      }
      after = page.paging?.next?.after;
      // flush in batches to keep statements lean
      if (buffer.length >= 300 || !after) {
        for (const batch of chunk(buffer, 300)) {
          await upsertContacts(sql, ctx.runId, batch);
          ctx.wrote(batch.length);
        }
        buffer = [];
      }
    } while (after);
  });
}

/** metrics.hubspot_daily — verified counts + catalog totals derived from core.contact. */
export async function refreshHubspotDaily() {
  const sql = osSql();
  const counts = await getContactCounts();
  const subs = await getActiveSubscribers();
  const [cat] = (await sql`
    SELECT coalesce(sum(tagged_tracks),0)::bigint   AS tagged_total,
           coalesce(sum(untagged_tracks),0)::bigint AS untagged_total,
           count(*) filter (where tagged_tracks > 0)::int AS artists_with_tracks
    FROM core.contact
  `) as Array<{ tagged_total: number; untagged_total: number; artists_with_tracks: number }>;

  await sql`
    INSERT INTO metrics.hubspot_daily (
      day, total_contacts, artists, subscribed, signed_to_deal, has_pro,
      active_subs_30d, active_subs_60d, tagged_tracks_total, untagged_tracks_total, artists_with_tracks
    ) VALUES (
      current_date, ${counts.totalContacts}, ${counts.artists}, ${counts.subscribed}, ${counts.signedToDeal}, ${counts.hasPro},
      ${subs.last30}, ${subs.last60}, ${Number(cat.tagged_total)}, ${Number(cat.untagged_total)}, ${Number(cat.artists_with_tracks)}
    )
    ON CONFLICT (day) DO UPDATE SET
      total_contacts=EXCLUDED.total_contacts, artists=EXCLUDED.artists, subscribed=EXCLUDED.subscribed,
      signed_to_deal=EXCLUDED.signed_to_deal, has_pro=EXCLUDED.has_pro, active_subs_30d=EXCLUDED.active_subs_30d,
      active_subs_60d=EXCLUDED.active_subs_60d, tagged_tracks_total=EXCLUDED.tagged_tracks_total,
      untagged_tracks_total=EXCLUDED.untagged_tracks_total, artists_with_tracks=EXCLUDED.artists_with_tracks,
      computed_at=now()
  `;
}

export async function syncHubspot() {
  await syncHubspotContacts();
  await refreshHubspotDaily();
}
