/**
 * Self-contained Swayzio OS read client for the eve agent.
 *
 * Deliberately NOT importing from src/server/os/* — eve's `lib/` is import-only and bundled with the
 * agent service, and a cross-agent-root import is an unverified bundling risk (PHASE-F-EVE.md §1).
 * Read-only by convention AND by role (F3): prefers SWAYZIO_OS_AGENT_RO_URL — the os_agent_ro
 * Postgres role with SELECT on api.* and EXECUTE on memory.recall only — so even a buggy or
 * compromised tool physically cannot write or read core/raw/ops. Falls back to the owner URL
 * only where the RO var isn't set (e.g. an env not yet migrated).
 */
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

export function osSql(): NeonQueryFunction<false, false> {
  if (_sql) return _sql;
  const url = process.env.SWAYZIO_OS_AGENT_RO_URL ?? process.env.SWAYZIO_OS_DATABASE_URL;
  if (!url) throw new Error("SWAYZIO_OS_AGENT_RO_URL / SWAYZIO_OS_DATABASE_URL is not set — the agent cannot reach Swayzio OS.");
  _sql = neon(url);
  return _sql;
}

/**
 * Query embeddings for semantic recall — mirrors src/server/os/embed.ts (keep in sync).
 * Explicit key → OpenAI-compatible EMBED_BASE_URL; no key → Vercel AI Gateway authed by
 * the deployment's OIDC token (gateway-only — the OIDC token never leaves the gateway).
 */
const EXPLICIT_KEY = process.env.EMBED_API_KEY ?? process.env.OPENAI_API_KEY;
const GATEWAY = "https://ai-gateway.vercel.sh/v1";
const EMBED_BASE = process.env.EMBED_BASE_URL ?? (EXPLICIT_KEY ? "https://api.openai.com/v1" : GATEWAY);
const EMBED_KEY = EXPLICIT_KEY ?? (EMBED_BASE === GATEWAY ? process.env.VERCEL_OIDC_TOKEN : undefined);
const EMBED_MODEL =
  process.env.EMBED_MODEL ?? (EMBED_BASE === GATEWAY ? "openai/text-embedding-3-small" : "text-embedding-3-small");
export const EMBED_DIM = Number(process.env.EMBED_DIM ?? 1536);

export function hasEmbedKey(): boolean {
  return Boolean(EMBED_KEY);
}

export async function embed(texts: string[]): Promise<number[][]> {
  if (!EMBED_KEY) throw new Error("No embedding credential — see agent/lib/os.ts.");
  if (texts.length === 0) return [];
  const res = await fetch(`${EMBED_BASE}/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${EMBED_KEY}` },
    body: JSON.stringify({ model: EMBED_MODEL, input: texts, dimensions: EMBED_DIM }),
  });
  if (!res.ok) throw new Error(`embeddings ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = (await res.json()) as { data: { embedding: number[]; index: number }[] };
  return json.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

/** pgvector/halfvec literal for a SQL parameter: '[0.1,0.2,...]'. */
export function toVectorLiteral(v: number[]): string {
  return `[${v.join(",")}]`;
}
