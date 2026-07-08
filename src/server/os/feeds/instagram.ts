/**
 * Instagram ELT feed -> Swayzio OS.
 *
 * Uses the Instagram API with Facebook Login via the existing Meta token. Lands sanitized source
 * payloads in raw.records and normalizes connected professional accounts, media, and insights.
 */
import { osSql } from "../db";
import { withSyncRun } from "../sync";
import { chunk, landRaw } from "../load";

type JsonRecord = Record<string, unknown>;
type Sql = ReturnType<typeof osSql>;

const GRAPH_BASE_URL = process.env.FACEBOOK_GRAPH_API_BASE_URL ?? "https://graph.facebook.com";
const GRAPH_VERSION = process.env.FACEBOOK_GRAPH_API_VERSION ?? "v25.0";
const DEFAULT_MEDIA_LOOKBACK_DAYS = 180;
const DEFAULT_MEDIA_LIMIT = 500;
const ACCOUNT_FIELDS = [
  "id",
  "username",
  "name",
  "biography",
  "website",
  "profile_picture_url",
  "followers_count",
  "follows_count",
  "media_count",
  "ig_id",
].join(",");
const MEDIA_FIELDS = [
  "id",
  "caption",
  "media_type",
  "media_product_type",
  "media_url",
  "permalink",
  "thumbnail_url",
  "timestamp",
  "username",
  "like_count",
  "comments_count",
].join(",");
const DEFAULT_ACCOUNT_INSIGHT_METRICS = [
  "reach",
  "follower_count",
  "profile_views",
  "website_clicks",
  "online_followers",
  "accounts_engaged",
  "total_interactions",
  "likes",
  "comments",
  "shares",
  "saves",
  "views",
];
const DEFAULT_MEDIA_INSIGHT_METRICS = [
  "impressions",
  "reach",
  "engagement",
  "saved",
  "likes",
  "comments",
  "shares",
  "plays",
  "total_interactions",
  "profile_visits",
  "follows",
  "video_views",
];

class GraphApiError extends Error {
  readonly status: number;
  readonly code: number | null;

  constructor(path: string, status: number, body: string) {
    let code: number | null = null;
    let message = body.slice(0, 500);
    try {
      const parsed = JSON.parse(body) as { error?: { message?: string; code?: number } };
      message = parsed.error?.message ?? message;
      code = parsed.error?.code ?? null;
    } catch {
      /* preserve text body */
    }
    super(`Instagram ${path} failed ${status}${code ? ` code ${code}` : ""}: ${message}`);
    this.status = status;
    this.code = code;
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
    const next = text(child<JsonRecord>(body, "paging")?.next);
    if (!next || seen.has(next)) break;
    seen.add(next);
    nextPath = next;
    nextParams = {};
  }
  return rows;
}

function isOptionalPermissionError(err: unknown): boolean {
  return err instanceof GraphApiError && (err.code === 10 || err.code === 200);
}

function sinceUnix(): number {
  const days = int(process.env.INSTAGRAM_MEDIA_LOOKBACK_DAYS) ?? DEFAULT_MEDIA_LOOKBACK_DAYS;
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
    await landRaw(sql, "instagram", sourceEntity, runId, batch.map((row, i) => ({
      sourceId: sourceId(row, written + i),
      payload: row.raw && typeof row.raw === "object" ? sanitize(row.raw) : sanitize(row),
    })));
    await upsert(batch);
    written += batch.length;
  }
  return written;
}

async function readConnectedInstagramAccounts(): Promise<Array<JsonRecord & { facebook_page_id: string; page_access_token: string }>> {
  const pages = await graphList<JsonRecord>("/me/accounts", {
    fields: "id,name,access_token,instagram_business_account,connected_instagram_account",
    limit: 100,
  });
  const byId = new Map<string, JsonRecord & { facebook_page_id: string; page_access_token: string }>();
  for (const page of pages) {
    const pageId = text(page.id);
    const pageToken = text(page.access_token);
    const instagramId = text(child(page, "instagram_business_account")?.id) ?? text(child(page, "connected_instagram_account")?.id);
    if (!pageId || !pageToken || !instagramId) continue;
    const details = await graphGet<JsonRecord>(`/${instagramId}`, { fields: ACCOUNT_FIELDS }, pageToken);
    byId.set(instagramId, { ...details, facebook_page_id: pageId, page_access_token: pageToken });
  }
  return [...byId.values()];
}

export async function syncInstagramAccounts() {
  return withSyncRun("instagram", "account", async (ctx) => {
    const sql = osSql();
    const rows = await readConnectedInstagramAccounts();
    ctx.read(rows.length);
    const normalized = rows.map((r) => ({
      id: text(r.id),
      facebook_page_id: text(r.facebook_page_id),
      username: text(r.username),
      name: text(r.name),
      biography: text(r.biography),
      website: text(r.website),
      profile_picture_url: text(r.profile_picture_url),
      followers_count: int(r.followers_count),
      follows_count: int(r.follows_count),
      media_count: int(r.media_count),
      ig_id: text(r.ig_id),
      raw: sanitize(r),
    })).filter((r) => r.id);
    const wrote = await syncRows(sql, "account", ctx.runId, normalized, (r) => String(r.id), async (batch) => {
      await upsertJson(sql, sql`
        INSERT INTO core.instagram_account
          (id, facebook_page_id, username, name, biography, website, profile_picture_url,
           followers_count, follows_count, media_count, ig_id, raw)
        SELECT id, facebook_page_id, username, name, biography, website, profile_picture_url,
               followers_count, follows_count, media_count, ig_id, raw
        FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS u(id text, facebook_page_id text, username text, name text, biography text, website text,
               profile_picture_url text, followers_count bigint, follows_count bigint, media_count bigint,
               ig_id text, raw jsonb)
        ON CONFLICT (id) DO UPDATE SET
          facebook_page_id=EXCLUDED.facebook_page_id, username=EXCLUDED.username, name=EXCLUDED.name,
          biography=EXCLUDED.biography, website=EXCLUDED.website, profile_picture_url=EXCLUDED.profile_picture_url,
          followers_count=EXCLUDED.followers_count, follows_count=EXCLUDED.follows_count,
          media_count=EXCLUDED.media_count, ig_id=EXCLUDED.ig_id, raw=EXCLUDED.raw, synced_at=now()
      `, batch);
    });
    ctx.wrote(wrote);
    ctx.setCursor(new Date().toISOString());
  });
}

async function accountTokens(sql: Sql): Promise<Array<{ id: string; token: string }>> {
  const connected = await readConnectedInstagramAccounts();
  if (connected.length) return connected.map((a) => ({ id: String(a.id), token: String(a.page_access_token) }));
  const accounts = (await sql`SELECT id FROM core.instagram_account ORDER BY id`) as Array<{ id: string }>;
  return accounts.map((a) => ({ id: a.id, token: token() }));
}

export async function syncInstagramMedia() {
  return withSyncRun("instagram", "media", async (ctx) => {
    const sql = osSql();
    const rows: JsonRecord[] = [];
    const limit = int(process.env.INSTAGRAM_MEDIA_LIMIT) ?? DEFAULT_MEDIA_LIMIT;
    for (const account of await accountTokens(sql)) {
      const media = await graphList<JsonRecord>(`/${account.id}/media`, {
        fields: MEDIA_FIELDS,
        since: sinceUnix(),
        limit: Math.min(limit, 100),
      }, account.token);
      rows.push(...media.slice(0, limit).map((r) => ({
        id: text(r.id),
        instagram_account_id: account.id,
        caption: text(r.caption),
        media_type: text(r.media_type),
        media_product_type: text(r.media_product_type),
        media_url: text(r.media_url),
        permalink: text(r.permalink),
        thumbnail_url: text(r.thumbnail_url),
        timestamp: text(r.timestamp),
        username: text(r.username),
        like_count: int(r.like_count),
        comments_count: int(r.comments_count),
        raw: sanitize(r),
      })));
    }
    const normalized = rows.filter((r) => r.id && r.instagram_account_id);
    ctx.read(normalized.length);
    const wrote = await syncRows(sql, "media", ctx.runId, normalized, (r) => String(r.id), async (batch) => {
      await upsertJson(sql, sql`
        INSERT INTO core.instagram_media
          (id, instagram_account_id, caption, media_type, media_product_type, media_url, permalink,
           thumbnail_url, timestamp, username, like_count, comments_count, raw)
        SELECT id, instagram_account_id, caption, media_type, media_product_type, media_url, permalink,
               thumbnail_url, timestamp, username, like_count, comments_count, raw
        FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS u(id text, instagram_account_id text, caption text, media_type text, media_product_type text,
               media_url text, permalink text, thumbnail_url text, timestamp timestamptz, username text,
               like_count bigint, comments_count bigint, raw jsonb)
        ON CONFLICT (id) DO UPDATE SET
          instagram_account_id=EXCLUDED.instagram_account_id, caption=EXCLUDED.caption,
          media_type=EXCLUDED.media_type, media_product_type=EXCLUDED.media_product_type,
          media_url=EXCLUDED.media_url, permalink=EXCLUDED.permalink, thumbnail_url=EXCLUDED.thumbnail_url,
          timestamp=EXCLUDED.timestamp, username=EXCLUDED.username, like_count=EXCLUDED.like_count,
          comments_count=EXCLUDED.comments_count, raw=EXCLUDED.raw, synced_at=now()
      `, batch);
    });
    ctx.wrote(wrote);
    ctx.setCursor(new Date().toISOString());
  });
}

function insightRows(ownerKey: "instagram_account_id" | "media_id", ownerId: string, rawRows: JsonRecord[], accountId?: string): JsonRecord[] {
  const out: JsonRecord[] = [];
  for (const metric of rawRows) {
    const values = Array.isArray(metric.values) ? metric.values : [{ value: metric.values ?? metric.value }];
    values.forEach((valueRow, index) => {
      const row = valueRow as JsonRecord;
      const value = row.value ?? null;
      const endTime = text(row.end_time);
      out.push({
        id: `${ownerId}:${text(metric.name) ?? "metric"}:${text(metric.period) ?? "period"}:${endTime ?? index}`,
        [ownerKey]: ownerId,
        ...(accountId ? { instagram_account_id: accountId } : {}),
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

export async function syncInstagramAccountInsights() {
  return withSyncRun("instagram", "account_insight", async (ctx) => {
    const sql = osSql();
    const rows: JsonRecord[] = [];
    const metrics = metricList("INSTAGRAM_ACCOUNT_INSIGHT_METRICS", DEFAULT_ACCOUNT_INSIGHT_METRICS);
    for (const account of await accountTokens(sql)) {
      for (const metric of metrics) {
        try {
          const metricRows = await graphList<JsonRecord>(`/${account.id}/insights`, {
            metric,
            period: "day",
            since: sinceUnix(),
            limit: 100,
          }, account.token);
          rows.push(...insightRows("instagram_account_id", account.id, metricRows));
        } catch (err) {
          if (isOptionalPermissionError(err)) {
            console.warn(`[instagram] account insights skipped; token likely lacks instagram_business_manage_insights: ${err instanceof Error ? err.message : String(err)}`);
            ctx.read(0);
            ctx.wrote(0);
            ctx.setCursor(new Date().toISOString());
            return;
          }
          throw err;
        }
      }
    }
    ctx.read(rows.length);
    const wrote = await syncRows(sql, "account_insight", ctx.runId, rows, (r) => String(r.id), async (batch) => {
      await upsertJson(sql, sql`
        INSERT INTO core.instagram_account_insight
          (id, instagram_account_id, metric_name, title, description, period, end_time, value, numeric_value, raw)
        SELECT id, instagram_account_id, metric_name, title, description, period, end_time, value, numeric_value, raw
        FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS u(id text, instagram_account_id text, metric_name text, title text, description text,
               period text, end_time timestamptz, value jsonb, numeric_value numeric, raw jsonb)
        ON CONFLICT (id) DO UPDATE SET
          instagram_account_id=EXCLUDED.instagram_account_id, metric_name=EXCLUDED.metric_name,
          title=EXCLUDED.title, description=EXCLUDED.description, period=EXCLUDED.period,
          end_time=EXCLUDED.end_time, value=EXCLUDED.value, numeric_value=EXCLUDED.numeric_value,
          raw=EXCLUDED.raw, synced_at=now()
      `, batch);
    });
    ctx.wrote(wrote);
    ctx.setCursor(new Date().toISOString());
  });
}

export async function syncInstagramMediaInsights() {
  return withSyncRun("instagram", "media_insight", async (ctx) => {
    const sql = osSql();
    const metrics = metricList("INSTAGRAM_MEDIA_INSIGHT_METRICS", DEFAULT_MEDIA_INSIGHT_METRICS);
    const limit = int(process.env.INSTAGRAM_MEDIA_INSIGHT_LIMIT) ?? 100;
    const media = (await sql`
      SELECT id, instagram_account_id
      FROM core.instagram_media
      ORDER BY timestamp DESC NULLS LAST
      LIMIT ${limit}
    `) as Array<{ id: string; instagram_account_id: string }>;
    const tokens = new Map((await accountTokens(sql)).map((a) => [a.id, a.token]));
    const rows: JsonRecord[] = [];
    for (const item of media) {
      const accessToken = tokens.get(item.instagram_account_id) ?? token();
      for (const metric of metrics) {
        try {
          const metricRows = await graphList<JsonRecord>(`/${item.id}/insights`, { metric }, accessToken);
          rows.push(...insightRows("media_id", item.id, metricRows, item.instagram_account_id));
        } catch (err) {
          if (isOptionalPermissionError(err)) {
            console.warn(`[instagram] media insights skipped; token likely lacks instagram_business_manage_insights: ${err instanceof Error ? err.message : String(err)}`);
            ctx.read(0);
            ctx.wrote(0);
            ctx.setCursor(new Date().toISOString());
            return;
          }
          throw err;
        }
      }
    }
    ctx.read(rows.length);
    const wrote = await syncRows(sql, "media_insight", ctx.runId, rows, (r) => String(r.id), async (batch) => {
      await upsertJson(sql, sql`
        INSERT INTO core.instagram_media_insight
          (id, media_id, instagram_account_id, metric_name, title, description, period, end_time, value, numeric_value, raw)
        SELECT id, media_id, instagram_account_id, metric_name, title, description, period, end_time, value, numeric_value, raw
        FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS u(id text, media_id text, instagram_account_id text, metric_name text, title text,
               description text, period text, end_time timestamptz, value jsonb, numeric_value numeric, raw jsonb)
        ON CONFLICT (id) DO UPDATE SET
          media_id=EXCLUDED.media_id, instagram_account_id=EXCLUDED.instagram_account_id,
          metric_name=EXCLUDED.metric_name, title=EXCLUDED.title, description=EXCLUDED.description,
          period=EXCLUDED.period, end_time=EXCLUDED.end_time, value=EXCLUDED.value,
          numeric_value=EXCLUDED.numeric_value, raw=EXCLUDED.raw, synced_at=now()
      `, batch);
    });
    ctx.wrote(wrote);
    ctx.setCursor(new Date().toISOString());
  });
}

export async function syncInstagram() {
  if (!configuredToken()) {
    console.warn("[instagram] FACEBOOK_ACCESS_TOKEN is not set; skipping Instagram sync.");
    return;
  }
  const feeds: Array<[string, () => Promise<unknown>]> = [
    ["account", syncInstagramAccounts],
    ["media", syncInstagramMedia],
    ["account_insight", syncInstagramAccountInsights],
    ["media_insight", syncInstagramMediaInsights],
  ];
  const failures: string[] = [];
  for (const [name, fn] of feeds) {
    try {
      await fn();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failures.push(`${name}: ${message}`);
      console.error(`[instagram] ${name} sync failed; continuing with remaining Instagram feeds: ${message}`);
    }
  }
  if (failures.length) {
    throw new Error(`Instagram sync completed with ${failures.length} failed sub-feed(s): ${failures.join("; ")}`);
  }
}
