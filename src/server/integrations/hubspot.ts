import { Client } from "@hubspot/api-client";

/**
 * HubSpot metrics — music-catalog / artist CRM. De-Replit'd: authenticates with a
 * private-app token (HUBSPOT_ACCESS_TOKEN), not the old Replit connector.
 * Verified against the live account 2026-06-21 (25,445 contacts).
 *
 * Counts come from the Search API (cheap — returns `total` without fetching rows).
 * Catalog sums + company grouping need one pagination pass over track-havers (~30s,
 * cached). All values are real properties; product-interaction fields (page views)
 * are ~all empty in HubSpot, so "power users" rank by tagged_tracks + recency.
 */

function client(): Client {
  const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!accessToken) throw new Error("HUBSPOT_ACCESS_TOKEN is not set");
  // The Search API is rate-limited (~5 req/s); retries back off on the occasional 429.
  return new Client({ accessToken, numberOfApiCallRetries: 6 });
}

// Global limiter so concurrent callers never exceed HubSpot's search rate limit.
let active = 0;
const queue: Array<() => void> = [];
const MAX_CONCURRENT_SEARCHES = 2;
async function search<T>(fn: () => Promise<T>): Promise<T> {
  if (active >= MAX_CONCURRENT_SEARCHES) await new Promise<void>((r) => queue.push(r));
  active++;
  try {
    return await fn();
  } finally {
    active--;
    queue.shift()?.();
  }
}

type Filter = { propertyName: string; operator: string; value?: string; highValue?: string };

async function searchCount(c: Client, filters: Filter[]): Promise<number> {
  const res = await search(() =>
    c.crm.contacts.searchApi.doSearch({
      filterGroups: filters.length ? [{ filters: filters as never }] : [],
      limit: 1,
    })
  );
  return res.total ?? 0;
}

const monthLabel = (d: Date) => d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

// ── Counts (cheap) ──────────────────────────────────────────────────────────
export interface ContactCounts {
  totalContacts: number;
  artists: number;
  subscribed: number;
  signedToDeal: number;
  hasPro: number;
}

export async function getContactCounts(): Promise<ContactCounts> {
  const c = client();
  const [totalContacts, artists, subscribed, signedToDeal, hasPro] = await Promise.all([
    searchCount(c, []),
    searchCount(c, [{ propertyName: "artist_name", operator: "HAS_PROPERTY" }]),
    searchCount(c, [{ propertyName: "subscribed", operator: "EQ", value: "true" }]),
    searchCount(c, [{ propertyName: "signed_to_deal", operator: "EQ", value: "true" }]),
    searchCount(c, [{ propertyName: "pro", operator: "HAS_PROPERTY" }]),
  ]);
  return { totalContacts, artists, subscribed, signedToDeal, hasPro };
}

// ── PRO distribution (cheap) ─────────────────────────────────────────────────
const PRO_VALUES = ["BMI", "ASCAP", "PRS", "SOCAN", "SESAC", "Other"] as const;

export async function getProDistribution(): Promise<Array<{ label: string; value: number }>> {
  const c = client();
  const counts = await Promise.all(
    PRO_VALUES.map((p) => searchCount(c, [{ propertyName: "pro", operator: "EQ", value: p }]))
  );
  return PRO_VALUES.map((label, i) => ({ label, value: counts[i] })).filter((d) => d.value > 0);
}

// ── Contact growth: new contacts per month (cheap — 12 searches) ─────────────
export async function getContactGrowth(): Promise<Array<{ month: string; contacts: number }>> {
  const c = client();
  const now = new Date();
  const ranges: Array<{ label: string; gte: number; lt: number }> = [];
  for (let i = 11; i >= 0; i--) {
    const a = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const b = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    ranges.push({ label: monthLabel(a), gte: a.getTime(), lt: b.getTime() });
  }
  const counts = await Promise.all(
    ranges.map((r) =>
      searchCount(c, [{ propertyName: "createdate", operator: "BETWEEN", value: String(r.gte), highValue: String(r.lt) }])
    )
  );
  return ranges.map((r, i) => ({ month: r.label, contacts: counts[i] }));
}

// ── Power users: top artists by catalog size ─────────────────────────────────
export interface PowerUser {
  id: string;
  name: string;
  email: string;
  tracks: number;
  pro: string | null;
  subscribed: boolean;
  lastActivity: string | null;
}

export async function getPowerUsers(limit = 50): Promise<PowerUser[]> {
  const c = client();
  const res = await search(() =>
    c.crm.contacts.searchApi.doSearch({
      filterGroups: [{ filters: [{ propertyName: "tagged_tracks", operator: "GT", value: "0" } as never] }],
      sorts: ["-tagged_tracks" as never],
      properties: ["artist_name", "email", "tagged_tracks", "pro", "subscribed", "lastmodifieddate"],
      limit,
    })
  );
  return res.results.map((r) => {
    const p = r.properties;
    return {
      id: r.id,
      name: p.artist_name || (p.email ? p.email.split("@")[0] : "Unknown"),
      email: p.email || "",
      tracks: Number(p.tagged_tracks || 0),
      pro: p.pro || null,
      subscribed: p.subscribed === "true",
      lastActivity: p.lastmodifieddate || null,
    };
  });
}

// ── Catalog scan: tagged-tracks total + company (business-domain) breakdown ──
const FREE_PROVIDER =
  /^(gmail|googlemail|gmal|gmial|gmai|yahoo|ymail|rocketmail|hotmail|outlook|live|msn|icloud|me|mac|aol|proton|protonmail|gmx|web|mail|freenet|t-online|orange|free|laposte|libero|wanadoo|sky|btinternet|comcast|verizon|att|sbcglobal|cox|qq|163|126|naver)\./;
const isPersonalOrInternal = (domain: string) => FREE_PROVIDER.test(domain) || domain === "swayzio.com";

export interface Company {
  domain: string;
  email: string;               // representative contact (the domain's highest-catalog user)
  tracks: number;
  users: number;
  subscribed: number;          // count of subscribed users (rendered as Yes/No in UI)
  lastActivity: string | null; // most recent lastmodifieddate across the domain's contacts
}
export interface CatalogScan {
  taggedTracksTotal: number;
  artistsWithTracks: number;
  companies: Company[];
}

export async function getCatalogScan(topCompanies = 40): Promise<CatalogScan> {
  const c = client();
  let taggedTracksTotal = 0;
  let artistsWithTracks = 0;
  const dom = new Map<string, Company>();
  const topTracks = new Map<string, number>(); // per-domain max, to pick the representative email
  let after: string | undefined;
  do {
    const page = await search(() =>
      c.crm.contacts.searchApi.doSearch({
        filterGroups: [{ filters: [{ propertyName: "tagged_tracks", operator: "GT", value: "0" } as never] }],
        properties: ["email", "tagged_tracks", "subscribed", "lastmodifieddate"],
        limit: 100,
        ...(after ? { after } : {}),
      })
    );
    for (const r of page.results) {
      const tracks = Number(r.properties.tagged_tracks || 0);
      taggedTracksTotal += tracks;
      artistsWithTracks++;
      const email = (r.properties.email || "").toLowerCase();
      const domain = email.split("@")[1];
      if (!domain || isPersonalOrInternal(domain)) continue;
      const e = dom.get(domain) ?? { domain, email, tracks: 0, users: 0, subscribed: 0, lastActivity: null };
      e.tracks += tracks;
      e.users++;
      if (r.properties.subscribed === "true") e.subscribed++;
      if (tracks >= (topTracks.get(domain) ?? -1)) { topTracks.set(domain, tracks); e.email = email; } // representative = top-catalog contact
      const lm = r.properties.lastmodifieddate;
      if (lm && (!e.lastActivity || lm > e.lastActivity)) e.lastActivity = lm; // ISO strings sort chronologically
      dom.set(domain, e);
    }
    after = page.paging?.next?.after;
  } while (after);

  const companies = [...dom.values()].sort((a, b) => b.tracks - a.tracks).slice(0, topCompanies);
  return { taggedTracksTotal, artistsWithTracks, companies };
}
