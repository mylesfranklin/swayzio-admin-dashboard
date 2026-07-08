/**
 * Facebook/Meta ELT feed -> Swayzio OS.
 *
 * Read-only Graph API access only. Lands sanitized source payloads in raw.records and normalizes
 * Facebook Pages, posts, organic insights, ad accounts, campaigns, and Ads Insights for Eve.
 */
import { osSql } from "../db";
import { withSyncRun } from "../sync";
import { chunk, landRaw } from "../load";

type JsonRecord = Record<string, unknown>;
type Sql = ReturnType<typeof osSql>;

const GRAPH_BASE_URL = process.env.FACEBOOK_GRAPH_API_BASE_URL ?? "https://graph.facebook.com";
const GRAPH_VERSION = process.env.FACEBOOK_GRAPH_API_VERSION ?? "v25.0";
const DEFAULT_LOOKBACK_DAYS = 90;
const PAGE_FIELDS = [
  "id",
  "name",
  "username",
  "category",
  "category_list",
  "fan_count",
  "followers_count",
  "link",
  "website",
  "phone",
  "emails",
  "location",
  "verification_status",
  "rating_count",
  "overall_star_rating",
  "is_published",
  "is_verified",
  "instagram_business_account",
  "connected_instagram_account",
].join(",");
const PAGE_ACCOUNT_FIELDS = `${PAGE_FIELDS},access_token,tasks`;
const POST_FIELDS = [
  "id",
  "message",
  "story",
  "created_time",
  "updated_time",
  "permalink_url",
  "full_picture",
  "status_type",
  "is_published",
  "shares",
].join(",");
const AD_ACCOUNT_FIELDS = [
  "id",
  "account_id",
  "name",
  "account_status",
  "currency",
  "timezone_name",
  "business",
  "amount_spent",
  "balance",
].join(",");
const CAMPAIGN_FIELDS = [
  "id",
  "name",
  "status",
  "effective_status",
  "objective",
  "buying_type",
  "created_time",
  "updated_time",
  "start_time",
  "stop_time",
  "daily_budget",
  "lifetime_budget",
].join(",");
const DEFAULT_PAGE_INSIGHT_METRICS = [
  "page_post_engagements",
  "page_follows",
  "page_views_total",
];
const DEFAULT_POST_INSIGHT_METRICS = [
  "post_clicks",
  "post_reactions_like_total",
  "post_video_views",
];
const DEFAULT_AD_INSIGHT_FIELDS = [
  "campaign_id",
  "campaign_name",
  "date_start",
  "date_stop",
  "impressions",
  "reach",
  "clicks",
  "spend",
  "cpc",
  "cpm",
  "ctr",
  "actions",
  "action_values",
];

class GraphApiError extends Error {
  readonly status: number;
  readonly code: number | null;
  readonly type: string | null;

  constructor(path: string, status: number, body: string) {
    let code: number | null = null;
    let type: string | null = null;
    let message = body.slice(0, 500);
    try {
      const parsed = JSON.parse(body) as { error?: { message?: string; code?: number; type?: string } };
      message = parsed.error?.message ?? message;
      code = parsed.error?.code ?? null;
      type = parsed.error?.type ?? null;
    } catch {
      /* preserve text body */
    }
    super(`Facebook ${path} failed ${status}${code ? ` code ${code}` : ""}: ${message}`);
    this.status = status;
    this.code = code;
    this.type = type;
  }
}

function configuredToken(): string | null {
  return process.env.FACEBOOK_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN || null;
}

function token(): string {
  const value = configuredToken();
  if (!value) throw new Error("FACEBOOK_ACCESS_TOKEN is not set");
  return value;
}

function splitEnv(name: string): string[] {
  return (process.env[name] ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function metricList(name: string, fallback: string[]): string[] {
  const configured = splitEnv(name);
  return configured.length ? configured : fallback;
}

function text(value: unknown): string | null {
  if (value == null || value === "") return null;
  return String(value);
}

function num(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function int(value: unknown): number | null {
  const n = num(value);
  return n == null ? null : Math.trunc(n);
}

function bool(value: unknown): boolean | null {
  if (value == null || value === "") return null;
  if (typeof value === "boolean") return value;
  return String(value) === "true";
}

function child<T = JsonRecord>(value: unknown, key: string): T | null {
  if (!value || typeof value !== "object") return null;
  const next = (value as JsonRecord)[key];
  return next && typeof next === "object" ? (next as T) : null;
}

function list<T = JsonRecord>(value: unknown, key: string): T[] {
  if (!value || typeof value !== "object") return [];
  const next = (value as JsonRecord)[key];
  return Array.isArray(next) ? (next as T[]) : [];
}

function nestedId(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && typeof (value as { id?: unknown }).id === "string") {
    return (value as { id: string }).id;
  }
  return null;
}

function json(value: unknown, fallback: unknown = null): unknown {
  return value == null ? fallback : value;
}

function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as JsonRecord)
      .filter(([key]) => !key.toLowerCase().includes("token"))
      .map(([key, v]) => [key, sanitize(v)]),
  );
}

function endpoint(path: string): URL {
  if (/^https?:\/\//.test(path)) return new URL(path);
  const base = GRAPH_BASE_URL.endsWith("/") ? GRAPH_BASE_URL.slice(0, -1) : GRAPH_BASE_URL;
  const version = GRAPH_VERSION.replace(/^\/|\/$/g, "");
  return new URL(`${base}/${version}${path.startsWith("/") ? path : `/${path}`}`);
}

async function graphGet<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  accessToken = token(),
): Promise<T> {
  const url = endpoint(path);
  for (const [key, value] of Object.entries(params)) {
    if (value != null) url.searchParams.set(key, String(value));
  }
  url.searchParams.set("access_token", accessToken);
  const res = await fetch(url, { headers: { accept: "application/json" } });
  const body = await res.text();
  if (!res.ok) throw new GraphApiError(url.pathname, res.status, body);
  return (body ? JSON.parse(body) : null) as T;
}

async function graphList<T extends JsonRecord>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  accessToken = token(),
): Promise<T[]> {
  const rows: T[] = [];
  let nextPath: string | null = path;
  let nextParams = params;
  const seen = new Set<string>();
  while (nextPath) {
    const body: JsonRecord = await graphGet<JsonRecord>(nextPath, nextParams, accessToken);
    rows.push(...list<T>(body, "data"));
    const paging = child<JsonRecord>(body, "paging");
    const next: string | null = text(paging?.next);
    if (!next || seen.has(next)) break;
    seen.add(next);
    nextPath = next;
    nextParams = {};
  }
  return rows;
}

function isOptionalPermissionError(err: unknown): boolean {
  if (!(err instanceof GraphApiError)) return false;
  return err.code === 10 || err.code === 200;
}

async function optionalList<T extends JsonRecord>(
  label: string,
  path: string,
  params: Record<string, string | number | undefined> = {},
  accessToken = token(),
): Promise<T[]> {
  try {
    return await graphList<T>(path, params, accessToken);
  } catch (err) {
    if (isOptionalPermissionError(err)) {
      console.warn(`[facebook] ${label} skipped: ${err instanceof Error ? err.message : String(err)}`);
      return [];
    }
    throw err;
  }
}

async function optionalGet<T>(
  label: string,
  path: string,
  params: Record<string, string | number | undefined> = {},
  accessToken = token(),
): Promise<T | null> {
  try {
    return await graphGet<T>(path, params, accessToken);
  } catch (err) {
    if (isOptionalPermissionError(err)) {
      console.warn(`[facebook] ${label} skipped: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
    throw err;
  }
}

function sinceUnix(): number {
  const days = int(process.env.FACEBOOK_LOOKBACK_DAYS) ?? DEFAULT_LOOKBACK_DAYS;
  return Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000);
}

async function upsertJson(sql: Sql, query: ReturnType<Sql>, rows: JsonRecord[]): Promise<void> {
  if (rows.length === 0) return;
  await query;
}

async function syncRows(
  sql: Sql,
  sourceEntity: string,
  runId: number,
  rows: JsonRecord[],
  sourceId: (row: JsonRecord, index: number) => string,
  upsert: (batch: JsonRecord[]) => Promise<void>,
): Promise<number> {
  let written = 0;
  for (const batch of chunk(rows, 500)) {
    await landRaw(sql, "facebook", sourceEntity, runId, batch.map((row, i) => ({
      sourceId: sourceId(row, written + i),
      payload: row.raw && typeof row.raw === "object" ? sanitize(row.raw) : sanitize(row),
    })));
    await upsert(batch);
    written += batch.length;
  }
  return written;
}

async function readPages(): Promise<Array<JsonRecord & { page_access_token?: string }>> {
  const root = token();
  const byId = new Map<string, JsonRecord & { page_access_token?: string }>();
  const accountPages = await optionalList<JsonRecord>("page list", "/me/accounts", {
    fields: PAGE_ACCOUNT_FIELDS,
    limit: 100,
  }, root);

  for (const page of accountPages) {
    const id = text(page.id);
    if (!id) continue;
    byId.set(id, { ...page, page_access_token: text(page.access_token) ?? undefined });
  }

  for (const id of splitEnv("FACEBOOK_PAGE_IDS")) {
    if (!byId.has(id)) byId.set(id, { id, page_access_token: root });
  }

  const pages: Array<JsonRecord & { page_access_token?: string }> = [];
  for (const page of byId.values()) {
    const id = text(page.id);
    if (!id) continue;
    const pageToken = page.page_access_token ?? root;
    const details = await optionalGet<JsonRecord>("page detail", `/${id}`, { fields: PAGE_FIELDS }, pageToken);
    pages.push({ ...page, ...(details ?? {}), page_access_token: pageToken });
  }
  return pages;
}

export async function syncFacebookPages() {
  return withSyncRun("facebook", "page", async (ctx) => {
    const sql = osSql();
    const rows = await readPages();
    ctx.read(rows.length);
    const normalized = rows.map((r) => ({
      id: text(r.id),
      name: text(r.name),
      username: text(r.username),
      category: text(r.category),
      category_list: json(r.category_list, []),
      fan_count: int(r.fan_count),
      followers_count: int(r.followers_count),
      link: text(r.link),
      website: text(r.website),
      phone: text(r.phone),
      emails: json(r.emails, []),
      location: json(r.location, {}),
      verification_status: text(r.verification_status),
      rating_count: int(r.rating_count),
      overall_star_rating: num(r.overall_star_rating),
      is_published: bool(r.is_published),
      is_verified: bool(r.is_verified),
      instagram_business_account_id: nestedId(r.instagram_business_account),
      connected_instagram_account_id: nestedId(r.connected_instagram_account),
      raw: sanitize(r),
    })).filter((r) => r.id);
    const wrote = await syncRows(sql, "page", ctx.runId, normalized, (r) => String(r.id), async (batch) => {
      await upsertJson(sql, sql`
        INSERT INTO core.facebook_page
          (id, name, username, category, category_list, fan_count, followers_count, link, website, phone, emails,
           location, verification_status, rating_count, overall_star_rating, is_published, is_verified,
           instagram_business_account_id, connected_instagram_account_id, raw)
        SELECT id, name, username, category, coalesce(category_list, '[]'::jsonb), fan_count, followers_count,
               link, website, phone, coalesce(emails, '[]'::jsonb), coalesce(location, '{}'::jsonb),
               verification_status, rating_count, overall_star_rating, is_published, is_verified,
               instagram_business_account_id, connected_instagram_account_id, raw
        FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS u(id text, name text, username text, category text, category_list jsonb, fan_count bigint,
               followers_count bigint, link text, website text, phone text, emails jsonb, location jsonb,
               verification_status text, rating_count bigint, overall_star_rating numeric,
               is_published boolean, is_verified boolean, instagram_business_account_id text,
               connected_instagram_account_id text, raw jsonb)
        ON CONFLICT (id) DO UPDATE SET
          name=EXCLUDED.name, username=EXCLUDED.username, category=EXCLUDED.category,
          category_list=EXCLUDED.category_list, fan_count=EXCLUDED.fan_count,
          followers_count=EXCLUDED.followers_count, link=EXCLUDED.link, website=EXCLUDED.website,
          phone=EXCLUDED.phone, emails=EXCLUDED.emails, location=EXCLUDED.location,
          verification_status=EXCLUDED.verification_status, rating_count=EXCLUDED.rating_count,
          overall_star_rating=EXCLUDED.overall_star_rating, is_published=EXCLUDED.is_published,
          is_verified=EXCLUDED.is_verified, instagram_business_account_id=EXCLUDED.instagram_business_account_id,
          connected_instagram_account_id=EXCLUDED.connected_instagram_account_id,
          raw=EXCLUDED.raw, synced_at=now()
      `, batch);
    });
    ctx.wrote(wrote);
    ctx.setCursor(new Date().toISOString());
  });
}

function insightRows(ownerKey: "page_id" | "post_id", ownerId: string, rawRows: JsonRecord[], pageId?: string): JsonRecord[] {
  const out: JsonRecord[] = [];
  for (const metric of rawRows) {
    const values = Array.isArray(metric.values) ? metric.values : [{ value: (metric as JsonRecord).value }];
    values.forEach((valueRow, index) => {
      const row = valueRow as JsonRecord;
      const value = row.value ?? null;
      const endTime = text(row.end_time);
      out.push({
        id: `${ownerId}:${text(metric.name) ?? "metric"}:${text(metric.period) ?? "period"}:${endTime ?? index}`,
        [ownerKey]: ownerId,
        ...(pageId ? { page_id: pageId } : {}),
        metric_name: text(metric.name),
        title: text(metric.title),
        description: text(metric.description),
        period: text(metric.period),
        end_time: endTime,
        value,
        numeric_value: typeof value === "number" || typeof value === "string" ? num(value) : null,
        raw: { ...metric, values: [valueRow] },
      });
    });
  }
  return out.filter((r) => r.metric_name);
}

async function readPageTokens(): Promise<Array<{ id: string; token: string }>> {
  return (await readPages()).map((p) => ({ id: String(p.id), token: p.page_access_token ?? token() })).filter((p) => p.id);
}

export async function syncFacebookPageInsights() {
  return withSyncRun("facebook", "page_insight", async (ctx) => {
    const sql = osSql();
    const metrics = metricList("FACEBOOK_PAGE_INSIGHT_METRICS", DEFAULT_PAGE_INSIGHT_METRICS);
    const rows: JsonRecord[] = [];
    for (const page of await readPageTokens()) {
      for (const metric of metrics) {
        const metricRows = await optionalList<JsonRecord>(`page insight ${metric}`, `/${page.id}/insights`, {
          metric,
          period: "day",
          since: sinceUnix(),
          limit: 100,
        }, page.token);
        rows.push(...insightRows("page_id", page.id, metricRows));
      }
    }
    ctx.read(rows.length);
    const wrote = await syncRows(sql, "page_insight", ctx.runId, rows, (r) => String(r.id), async (batch) => {
      await upsertJson(sql, sql`
        INSERT INTO core.facebook_page_insight
          (id, page_id, metric_name, title, description, period, end_time, value, numeric_value, raw)
        SELECT id, page_id, metric_name, title, description, period, end_time, value, numeric_value, raw
        FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS u(id text, page_id text, metric_name text, title text, description text, period text,
               end_time timestamptz, value jsonb, numeric_value numeric, raw jsonb)
        ON CONFLICT (id) DO UPDATE SET
          page_id=EXCLUDED.page_id, metric_name=EXCLUDED.metric_name, title=EXCLUDED.title,
          description=EXCLUDED.description, period=EXCLUDED.period, end_time=EXCLUDED.end_time,
          value=EXCLUDED.value, numeric_value=EXCLUDED.numeric_value, raw=EXCLUDED.raw, synced_at=now()
      `, batch);
    });
    ctx.wrote(wrote);
    ctx.setCursor(new Date().toISOString());
  });
}

function countSummary(value: unknown): number | null {
  return int(child(value, "summary")?.total_count);
}

function shareCount(value: unknown): number | null {
  if (!value || typeof value !== "object") return null;
  return int((value as JsonRecord).count);
}

export async function syncFacebookPosts() {
  return withSyncRun("facebook", "post", async (ctx) => {
    const sql = osSql();
    const rows: JsonRecord[] = [];
    for (const page of await readPageTokens()) {
      const posts = await optionalList<JsonRecord>(`page posts ${page.id}`, `/${page.id}/posts`, {
        fields: POST_FIELDS,
        since: sinceUnix(),
        limit: 100,
      }, page.token);
      rows.push(...posts.map((r) => ({
        id: text(r.id),
        page_id: page.id,
        message: text(r.message),
        story: text(r.story),
        created_time: text(r.created_time),
        updated_time: text(r.updated_time),
        permalink_url: text(r.permalink_url),
        full_picture: text(r.full_picture),
        status_type: text(r.status_type),
        type: text(r.type),
        is_published: bool(r.is_published),
        shares_count: shareCount(r.shares),
        comments_count: countSummary(r.comments),
        likes_count: countSummary(r.likes),
        reactions_count: countSummary(r.reactions),
        raw: sanitize(r),
      })));
    }
    const normalized = rows.filter((r) => r.id && r.page_id);
    ctx.read(normalized.length);
    const wrote = await syncRows(sql, "post", ctx.runId, normalized, (r) => String(r.id), async (batch) => {
      await upsertJson(sql, sql`
        INSERT INTO core.facebook_post
          (id, page_id, message, story, created_time, updated_time, permalink_url, full_picture,
           status_type, type, is_published, shares_count, comments_count, likes_count, reactions_count, raw)
        SELECT id, page_id, message, story, created_time, updated_time, permalink_url, full_picture,
               status_type, type, is_published, shares_count, comments_count, likes_count, reactions_count, raw
        FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS u(id text, page_id text, message text, story text, created_time timestamptz,
               updated_time timestamptz, permalink_url text, full_picture text, status_type text,
               type text, is_published boolean, shares_count bigint, comments_count bigint,
               likes_count bigint, reactions_count bigint, raw jsonb)
        ON CONFLICT (id) DO UPDATE SET
          page_id=EXCLUDED.page_id, message=EXCLUDED.message, story=EXCLUDED.story,
          created_time=EXCLUDED.created_time, updated_time=EXCLUDED.updated_time,
          permalink_url=EXCLUDED.permalink_url, full_picture=EXCLUDED.full_picture,
          status_type=EXCLUDED.status_type, type=EXCLUDED.type, is_published=EXCLUDED.is_published,
          shares_count=EXCLUDED.shares_count, comments_count=EXCLUDED.comments_count,
          likes_count=EXCLUDED.likes_count, reactions_count=EXCLUDED.reactions_count,
          raw=EXCLUDED.raw, synced_at=now()
      `, batch);
    });
    ctx.wrote(wrote);
    ctx.setCursor(new Date().toISOString());
  });
}

export async function syncFacebookPostInsights() {
  return withSyncRun("facebook", "post_insight", async (ctx) => {
    const sql = osSql();
    const metrics = metricList("FACEBOOK_POST_INSIGHT_METRICS", DEFAULT_POST_INSIGHT_METRICS);
    const posts = (await sql`SELECT id, page_id FROM core.facebook_post ORDER BY created_time DESC NULLS LAST LIMIT 500`) as Array<{ id: string; page_id: string }>;
    const pages = new Map((await readPageTokens()).map((p) => [p.id, p.token]));
    const rows: JsonRecord[] = [];
    for (const post of posts) {
      const pageToken = pages.get(post.page_id) ?? token();
      for (const metric of metrics) {
        const metricRows = await optionalList<JsonRecord>(`post insight ${metric}`, `/${post.id}/insights`, { metric }, pageToken);
        rows.push(...insightRows("post_id", post.id, metricRows, post.page_id));
      }
    }
    ctx.read(rows.length);
    const wrote = await syncRows(sql, "post_insight", ctx.runId, rows, (r) => String(r.id), async (batch) => {
      await upsertJson(sql, sql`
        INSERT INTO core.facebook_post_insight
          (id, post_id, page_id, metric_name, title, description, period, end_time, value, numeric_value, raw)
        SELECT id, post_id, page_id, metric_name, title, description, period, end_time, value, numeric_value, raw
        FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS u(id text, post_id text, page_id text, metric_name text, title text, description text,
               period text, end_time timestamptz, value jsonb, numeric_value numeric, raw jsonb)
        ON CONFLICT (id) DO UPDATE SET
          post_id=EXCLUDED.post_id, page_id=EXCLUDED.page_id, metric_name=EXCLUDED.metric_name,
          title=EXCLUDED.title, description=EXCLUDED.description, period=EXCLUDED.period,
          end_time=EXCLUDED.end_time, value=EXCLUDED.value, numeric_value=EXCLUDED.numeric_value,
          raw=EXCLUDED.raw, synced_at=now()
      `, batch);
    });
    ctx.wrote(wrote);
    ctx.setCursor(new Date().toISOString());
  });
}

async function readAdAccounts(): Promise<JsonRecord[]> {
  const root = token();
  const byId = new Map<string, JsonRecord>();
  const accounts = await optionalList<JsonRecord>("ad account list", "/me/adaccounts", {
    fields: AD_ACCOUNT_FIELDS,
    limit: 100,
  }, root);
  for (const account of accounts) {
    const id = text(account.id);
    if (id) byId.set(id, account);
  }
  for (const configured of splitEnv("FACEBOOK_AD_ACCOUNT_IDS")) {
    const id = configured.startsWith("act_") ? configured : `act_${configured}`;
    if (!byId.has(id)) {
      const detail = await optionalGet<JsonRecord>("ad account detail", `/${id}`, { fields: AD_ACCOUNT_FIELDS }, root);
      if (detail) byId.set(id, detail);
    }
  }
  return [...byId.values()];
}

export async function syncFacebookAdAccounts() {
  return withSyncRun("facebook", "ad_account", async (ctx) => {
    const sql = osSql();
    const rows = await readAdAccounts();
    ctx.read(rows.length);
    const normalized = rows.map((r) => ({
      id: text(r.id),
      account_id: text(r.account_id),
      name: text(r.name),
      account_status: int(r.account_status),
      currency: text(r.currency),
      timezone_name: text(r.timezone_name),
      business: json(r.business, {}),
      amount_spent: num(r.amount_spent),
      balance: num(r.balance),
      raw: sanitize(r),
    })).filter((r) => r.id);
    const wrote = await syncRows(sql, "ad_account", ctx.runId, normalized, (r) => String(r.id), async (batch) => {
      await upsertJson(sql, sql`
        INSERT INTO core.facebook_ad_account
          (id, account_id, name, account_status, currency, timezone_name, business, amount_spent, balance, raw)
        SELECT id, account_id, name, account_status, currency, timezone_name, coalesce(business, '{}'::jsonb),
               amount_spent, balance, raw
        FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS u(id text, account_id text, name text, account_status int, currency text,
               timezone_name text, business jsonb, amount_spent numeric, balance numeric, raw jsonb)
        ON CONFLICT (id) DO UPDATE SET
          account_id=EXCLUDED.account_id, name=EXCLUDED.name, account_status=EXCLUDED.account_status,
          currency=EXCLUDED.currency, timezone_name=EXCLUDED.timezone_name, business=EXCLUDED.business,
          amount_spent=EXCLUDED.amount_spent, balance=EXCLUDED.balance, raw=EXCLUDED.raw, synced_at=now()
      `, batch);
    });
    ctx.wrote(wrote);
    ctx.setCursor(new Date().toISOString());
  });
}

export async function syncFacebookCampaigns() {
  return withSyncRun("facebook", "campaign", async (ctx) => {
    const sql = osSql();
    const accounts = (await sql`SELECT id FROM core.facebook_ad_account ORDER BY id`) as Array<{ id: string }>;
    const rows: JsonRecord[] = [];
    for (const account of accounts) {
      const campaigns = await optionalList<JsonRecord>(`campaigns ${account.id}`, `/${account.id}/campaigns`, {
        fields: CAMPAIGN_FIELDS,
        limit: 100,
      });
      rows.push(...campaigns.map((r) => ({
        id: text(r.id),
        ad_account_id: account.id,
        name: text(r.name),
        status: text(r.status),
        effective_status: text(r.effective_status),
        objective: text(r.objective),
        buying_type: text(r.buying_type),
        created_time: text(r.created_time),
        updated_time: text(r.updated_time),
        start_time: text(r.start_time),
        stop_time: text(r.stop_time),
        daily_budget: num(r.daily_budget),
        lifetime_budget: num(r.lifetime_budget),
        raw: sanitize(r),
      })));
    }
    const normalized = rows.filter((r) => r.id && r.ad_account_id);
    ctx.read(normalized.length);
    const wrote = await syncRows(sql, "campaign", ctx.runId, normalized, (r) => String(r.id), async (batch) => {
      await upsertJson(sql, sql`
        INSERT INTO core.facebook_campaign
          (id, ad_account_id, name, status, effective_status, objective, buying_type, created_time,
           updated_time, start_time, stop_time, daily_budget, lifetime_budget, raw)
        SELECT id, ad_account_id, name, status, effective_status, objective, buying_type, created_time,
               updated_time, start_time, stop_time, daily_budget, lifetime_budget, raw
        FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS u(id text, ad_account_id text, name text, status text, effective_status text,
               objective text, buying_type text, created_time timestamptz, updated_time timestamptz,
               start_time timestamptz, stop_time timestamptz, daily_budget numeric, lifetime_budget numeric, raw jsonb)
        ON CONFLICT (id) DO UPDATE SET
          ad_account_id=EXCLUDED.ad_account_id, name=EXCLUDED.name, status=EXCLUDED.status,
          effective_status=EXCLUDED.effective_status, objective=EXCLUDED.objective,
          buying_type=EXCLUDED.buying_type, created_time=EXCLUDED.created_time,
          updated_time=EXCLUDED.updated_time, start_time=EXCLUDED.start_time, stop_time=EXCLUDED.stop_time,
          daily_budget=EXCLUDED.daily_budget, lifetime_budget=EXCLUDED.lifetime_budget,
          raw=EXCLUDED.raw, synced_at=now()
      `, batch);
    });
    ctx.wrote(wrote);
    ctx.setCursor(new Date().toISOString());
  });
}

export async function syncFacebookAdInsights() {
  return withSyncRun("facebook", "ad_insight", async (ctx) => {
    const sql = osSql();
    const accounts = (await sql`SELECT id FROM core.facebook_ad_account ORDER BY id`) as Array<{ id: string }>;
    const fields = metricList("FACEBOOK_AD_INSIGHT_FIELDS", DEFAULT_AD_INSIGHT_FIELDS).join(",");
    const rows: JsonRecord[] = [];
    for (const account of accounts) {
      const insights = await optionalList<JsonRecord>(`ad insights ${account.id}`, `/${account.id}/insights`, {
        fields,
        level: "campaign",
        time_increment: 1,
        date_preset: "last_90d",
        limit: 500,
      });
      rows.push(...insights.map((r, index) => ({
        id: `${account.id}:${text(r.campaign_id) ?? "account"}:${text(r.date_start) ?? index}:${text(r.date_stop) ?? index}`,
        ad_account_id: account.id,
        campaign_id: text(r.campaign_id),
        campaign_name: text(r.campaign_name),
        date_start: text(r.date_start),
        date_stop: text(r.date_stop),
        impressions: int(r.impressions),
        reach: int(r.reach),
        clicks: int(r.clicks),
        spend: num(r.spend),
        cpc: num(r.cpc),
        cpm: num(r.cpm),
        ctr: num(r.ctr),
        actions: json(r.actions, []),
        action_values: json(r.action_values, []),
        raw: sanitize(r),
      })));
    }
    ctx.read(rows.length);
    const wrote = await syncRows(sql, "ad_insight", ctx.runId, rows, (r) => String(r.id), async (batch) => {
      await upsertJson(sql, sql`
        INSERT INTO core.facebook_ad_insight
          (id, ad_account_id, campaign_id, campaign_name, date_start, date_stop, impressions, reach, clicks,
           spend, cpc, cpm, ctr, actions, action_values, raw)
        SELECT id, ad_account_id, campaign_id, campaign_name, date_start, date_stop, impressions, reach, clicks,
               spend, cpc, cpm, ctr, coalesce(actions, '[]'::jsonb), coalesce(action_values, '[]'::jsonb), raw
        FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS u(id text, ad_account_id text, campaign_id text, campaign_name text, date_start date,
               date_stop date, impressions bigint, reach bigint, clicks bigint, spend numeric,
               cpc numeric, cpm numeric, ctr numeric, actions jsonb, action_values jsonb, raw jsonb)
        ON CONFLICT (id) DO UPDATE SET
          ad_account_id=EXCLUDED.ad_account_id, campaign_id=EXCLUDED.campaign_id,
          campaign_name=EXCLUDED.campaign_name, date_start=EXCLUDED.date_start,
          date_stop=EXCLUDED.date_stop, impressions=EXCLUDED.impressions, reach=EXCLUDED.reach,
          clicks=EXCLUDED.clicks, spend=EXCLUDED.spend, cpc=EXCLUDED.cpc, cpm=EXCLUDED.cpm,
          ctr=EXCLUDED.ctr, actions=EXCLUDED.actions, action_values=EXCLUDED.action_values,
          raw=EXCLUDED.raw, synced_at=now()
      `, batch);
    });
    ctx.wrote(wrote);
    ctx.setCursor(new Date().toISOString());
  });
}

export async function syncFacebook() {
  if (!configuredToken()) {
    console.warn("[facebook] FACEBOOK_ACCESS_TOKEN is not set; skipping Facebook sync.");
    return;
  }
  const feeds: Array<[string, () => Promise<unknown>]> = [
    ["page", syncFacebookPages],
    ["post", syncFacebookPosts],
    ["page_insight", syncFacebookPageInsights],
    ["post_insight", syncFacebookPostInsights],
    ["ad_account", syncFacebookAdAccounts],
    ["campaign", syncFacebookCampaigns],
    ["ad_insight", syncFacebookAdInsights],
  ];
  const failures: string[] = [];
  for (const [name, fn] of feeds) {
    try {
      await fn();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failures.push(`${name}: ${message}`);
      console.error(`[facebook] ${name} sync failed; continuing with remaining Facebook feeds: ${message}`);
    }
  }
  if (failures.length) {
    throw new Error(`Facebook sync completed with ${failures.length} failed sub-feed(s): ${failures.join("; ")}`);
  }
}
