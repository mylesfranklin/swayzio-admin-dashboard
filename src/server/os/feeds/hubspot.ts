/**
 * HubSpot ELT feed → Swayzio OS. Paginates full CRM contacts + companies (no deals) →
 * raw.records → core.contact/core.hubspot_company (identity-resolved by email) → metrics.hubspot_daily.
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
  createdAt: string | null;
  companyId: string | null;
  companyName: string | null;
  jobtitle: string | null;
  role: string | null;
  companyType: string | null;
  acquisitionChannel: string | null;
  tagged: number;
  untagged: number;
  pro: string | null;
  subscribed: boolean | null;
  signed: boolean | null;
  lastLogin: string | null;
  lastModified: string | null;
  rawProperties: Record<string, string | null | undefined>;
}

interface CompanyRow {
  id: string;
  domain: string | null;
  name: string | null;
  website: string | null;
  industry: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  rawProperties: Record<string, string | null | undefined>;
}

const CONTACT_PROPS = [
  "email",
  "artist_name",
  "createdate",
  "associatedcompanyid",
  "company",
  "jobtitle",
  "role",
  "company_type",
  "acquisition_channel",
  "tagged_tracks",
  "untagged_tracks",
  "pro",
  "subscribed",
  "signed_to_deal",
  "last_login",
  "lastmodifieddate",
];
const COMPANY_PROPS = ["domain", "name", "website", "industry", "city", "state", "country", "createdate", "hs_lastmodifieddate"];
const bool = (v: string | null | undefined) => (v == null || v === "" ? null : v === "true");

function contactCompanyId(contact: unknown, props: Record<string, string | null | undefined>): string | null {
  if (props.associatedcompanyid) return props.associatedcompanyid;
  const associations = (contact as { associations?: { companies?: { results?: Array<{ id?: string }> } } }).associations;
  return associations?.companies?.results?.[0]?.id ?? null;
}

async function upsertContacts(sql: ReturnType<typeof osSql>, runId: number, rows: ContactRow[]) {
  await landRaw(sql, "hubspot", "contact", runId, rows.map((r) => ({ sourceId: r.id, payload: r })));
  await resolveIdentities(sql, "hubspot", rows.map((r) => ({ sourceId: r.id, email: r.email, name: r.artistName })));
  await sql`
    INSERT INTO core.contact
      (id, email, artist_name, created_at, company_id, company_name, jobtitle, role, company_type,
       acquisition_channel, tagged_tracks, untagged_tracks, pro, subscribed, signed_to_deal,
       last_login, last_modified, raw_properties, identity_id)
    SELECT u.id, NULLIF(u.email,'')::citext, u.artist_name, NULLIF(u.created_at,'')::timestamptz,
           NULLIF(u.company_id,''), NULLIF(u.company_name,''), NULLIF(u.jobtitle,''), NULLIF(u.role,''),
           NULLIF(u.company_type,''), NULLIF(u.acquisition_channel,''),
           u.tagged::int, u.untagged::int, NULLIF(u.pro,''), u.subscribed::boolean, u.signed::boolean,
           NULLIF(u.last_login,'')::timestamptz, NULLIF(u.last_modified,'')::timestamptz,
           u.raw_properties::jsonb, i.id
    FROM unnest(
      ${rows.map((r) => r.id)}::text[], ${rows.map((r) => r.email)}::text[], ${rows.map((r) => r.artistName)}::text[],
      ${rows.map((r) => r.createdAt)}::text[], ${rows.map((r) => r.companyId)}::text[],
      ${rows.map((r) => r.companyName)}::text[], ${rows.map((r) => r.jobtitle)}::text[],
      ${rows.map((r) => r.role)}::text[], ${rows.map((r) => r.companyType)}::text[],
      ${rows.map((r) => r.acquisitionChannel)}::text[],
      ${rows.map((r) => r.tagged)}::int[], ${rows.map((r) => r.untagged)}::int[], ${rows.map((r) => r.pro)}::text[],
      ${rows.map((r) => (r.subscribed === null ? null : String(r.subscribed)))}::text[],
      ${rows.map((r) => (r.signed === null ? null : String(r.signed)))}::text[],
      ${rows.map((r) => r.lastLogin)}::text[], ${rows.map((r) => r.lastModified)}::text[],
      ${rows.map((r) => JSON.stringify(r.rawProperties))}::text[]
    ) AS u(id, email, artist_name, created_at, company_id, company_name, jobtitle, role, company_type,
           acquisition_channel, tagged, untagged, pro, subscribed, signed, last_login, last_modified, raw_properties)
    LEFT JOIN core.identity i ON i.email = NULLIF(u.email,'')::citext
    ON CONFLICT (id) DO UPDATE SET
      email=EXCLUDED.email, artist_name=EXCLUDED.artist_name, created_at=EXCLUDED.created_at,
      company_id=EXCLUDED.company_id, company_name=EXCLUDED.company_name, jobtitle=EXCLUDED.jobtitle,
      role=EXCLUDED.role, company_type=EXCLUDED.company_type, acquisition_channel=EXCLUDED.acquisition_channel,
      tagged_tracks=EXCLUDED.tagged_tracks,
      untagged_tracks=EXCLUDED.untagged_tracks, pro=EXCLUDED.pro, subscribed=EXCLUDED.subscribed,
      signed_to_deal=EXCLUDED.signed_to_deal, last_login=EXCLUDED.last_login, last_modified=EXCLUDED.last_modified,
      raw_properties=EXCLUDED.raw_properties,
      identity_id=EXCLUDED.identity_id, synced_at=now()
  `;
  const linked = rows.filter((r) => r.companyId);
  if (linked.length) {
    await sql`
      INSERT INTO core.hubspot_contact_company (contact_id, company_id, association_type, is_primary)
      SELECT u.contact_id, u.company_id, 'company', true
      FROM unnest(${linked.map((r) => r.id)}::text[], ${linked.map((r) => r.companyId!)}::text[]) AS u(contact_id, company_id)
      JOIN core.hubspot_company hc ON hc.id = u.company_id
      ON CONFLICT (contact_id, company_id, association_type) DO UPDATE
        SET is_primary = EXCLUDED.is_primary, synced_at = now()
    `;
  }
}

export async function syncHubspotContacts() {
  return withSyncRun("hubspot", "contact", async (ctx) => {
    const sql = osSql();
    const c = client();
    let after: string | undefined;
    let buffer: ContactRow[] = [];
    do {
      const page = await c.crm.contacts.basicApi.getPage(100, after, CONTACT_PROPS, undefined, ["companies"], false);
      ctx.read(page.results.length);
      for (const r of page.results) {
        const p = r.properties;
        const companyId = contactCompanyId(r, p);
        buffer.push({
          id: r.id,
          email: p.email || null,
          artistName: p.artist_name || null,
          createdAt: p.createdate || null,
          companyId,
          companyName: p.company || null,
          jobtitle: p.jobtitle || null,
          role: p.role || null,
          companyType: p.company_type || null,
          acquisitionChannel: p.acquisition_channel || null,
          tagged: Number(p.tagged_tracks || 0),
          untagged: Number(p.untagged_tracks || 0),
          pro: p.pro || null,
          subscribed: bool(p.subscribed),
          signed: bool(p.signed_to_deal),
          lastLogin: p.last_login || null,
          lastModified: p.lastmodifieddate || null,
          rawProperties: p,
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

async function upsertCompanies(sql: ReturnType<typeof osSql>, runId: number, rows: CompanyRow[]) {
  await landRaw(sql, "hubspot", "company", runId, rows.map((r) => ({ sourceId: r.id, payload: r })));
  await sql`
    INSERT INTO core.hubspot_company
      (id, domain, name, website, industry, city, state, country, created_at, updated_at, raw_properties)
    SELECT u.id, NULLIF(lower(u.domain),''), NULLIF(u.name,''), NULLIF(u.website,''), NULLIF(u.industry,''),
           NULLIF(u.city,''), NULLIF(u.state,''), NULLIF(u.country,''),
           NULLIF(u.created_at,'')::timestamptz, NULLIF(u.updated_at,'')::timestamptz, u.raw_properties::jsonb
    FROM unnest(
      ${rows.map((r) => r.id)}::text[], ${rows.map((r) => r.domain)}::text[],
      ${rows.map((r) => r.name)}::text[], ${rows.map((r) => r.website)}::text[],
      ${rows.map((r) => r.industry)}::text[], ${rows.map((r) => r.city)}::text[],
      ${rows.map((r) => r.state)}::text[], ${rows.map((r) => r.country)}::text[],
      ${rows.map((r) => r.createdAt)}::text[], ${rows.map((r) => r.updatedAt)}::text[],
      ${rows.map((r) => JSON.stringify(r.rawProperties))}::text[]
    ) AS u(id, domain, name, website, industry, city, state, country, created_at, updated_at, raw_properties)
    ON CONFLICT (id) DO UPDATE SET
      domain=EXCLUDED.domain, name=EXCLUDED.name, website=EXCLUDED.website, industry=EXCLUDED.industry,
      city=EXCLUDED.city, state=EXCLUDED.state, country=EXCLUDED.country,
      created_at=EXCLUDED.created_at, updated_at=EXCLUDED.updated_at,
      raw_properties=EXCLUDED.raw_properties, synced_at=now()
  `;
  await sql`
    INSERT INTO core.company (domain, display_name, traits)
    SELECT DISTINCT domain, name, jsonb_build_object('hubspot_company_id', id, 'source', 'hubspot')
    FROM core.hubspot_company
    WHERE domain IS NOT NULL AND domain <> 'swayzio.com' AND NOT core.is_personal_domain(domain)
    ON CONFLICT (domain) DO UPDATE
      SET display_name = COALESCE(core.company.display_name, EXCLUDED.display_name),
          traits = core.company.traits || EXCLUDED.traits,
          last_seen_at = now()
  `;
}

export async function syncHubspotCompanies() {
  return withSyncRun("hubspot", "company", async (ctx) => {
    const sql = osSql();
    const c = client();
    let after: string | undefined;
    let buffer: CompanyRow[] = [];
    do {
      const page = await c.crm.companies.basicApi.getPage(100, after, COMPANY_PROPS, undefined, undefined, false);
      ctx.read(page.results.length);
      for (const r of page.results) {
        const p = r.properties;
        buffer.push({
          id: r.id,
          domain: p.domain || null,
          name: p.name || null,
          website: p.website || null,
          industry: p.industry || null,
          city: p.city || null,
          state: p.state || null,
          country: p.country || null,
          createdAt: p.createdate || null,
          updatedAt: p.hs_lastmodifieddate || null,
          rawProperties: p,
        });
      }
      after = page.paging?.next?.after;
      if (buffer.length >= 300 || !after) {
        for (const batch of chunk(buffer, 300)) {
          await upsertCompanies(sql, ctx.runId, batch);
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
           count(*) filter (where tagged_tracks > 0)::int AS artists_with_tracks,
           count(*) filter (where email IS NULL)::int AS contacts_missing_email
    FROM core.contact
  `) as Array<{ tagged_total: number; untagged_total: number; artists_with_tracks: number; contacts_missing_email: number }>;
  const [companies] = (await sql`SELECT count(*)::int AS n FROM core.hubspot_company`) as Array<{ n: number }>;

  await sql`
    INSERT INTO metrics.hubspot_daily (
      day, total_contacts, artists, subscribed, signed_to_deal, has_pro,
      active_subs_30d, active_subs_60d, tagged_tracks_total, untagged_tracks_total, artists_with_tracks,
      companies, contacts_missing_email
    ) VALUES (
      current_date, ${counts.totalContacts}, ${counts.artists}, ${counts.subscribed}, ${counts.signedToDeal}, ${counts.hasPro},
      ${subs.last30}, ${subs.last60}, ${Number(cat.tagged_total)}, ${Number(cat.untagged_total)}, ${Number(cat.artists_with_tracks)},
      ${companies.n}, ${Number(cat.contacts_missing_email)}
    )
    ON CONFLICT (day) DO UPDATE SET
      total_contacts=EXCLUDED.total_contacts, artists=EXCLUDED.artists, subscribed=EXCLUDED.subscribed,
      signed_to_deal=EXCLUDED.signed_to_deal, has_pro=EXCLUDED.has_pro, active_subs_30d=EXCLUDED.active_subs_30d,
      active_subs_60d=EXCLUDED.active_subs_60d, tagged_tracks_total=EXCLUDED.tagged_tracks_total,
      untagged_tracks_total=EXCLUDED.untagged_tracks_total, artists_with_tracks=EXCLUDED.artists_with_tracks,
      companies=EXCLUDED.companies, contacts_missing_email=EXCLUDED.contacts_missing_email,
      computed_at=now()
  `;
}

export async function syncHubspot() {
  await syncHubspotCompanies();
  await syncHubspotContacts();
  await refreshHubspotDaily();
}
