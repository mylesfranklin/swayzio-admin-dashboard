/**
 * Provider-agnostic text embeddings for memory.* (Phase E).
 *
 * Uses an OpenAI-compatible /embeddings endpoint so it works with OpenAI, the Vercel AI Gateway,
 * Together, etc. — point it via env. Pinned schema dim is halfvec(1536); keep EMBED_DIM in sync.
 *
 *   EMBED_API_KEY   (or OPENAI_API_KEY)   — explicit key; absent → Vercel AI Gateway via OIDC
 *   EMBED_BASE_URL  default https://api.openai.com/v1 with a key, else the AI Gateway
 *   EMBED_MODEL     default text-embedding-3-small ("openai/"-prefixed on the gateway)
 *   EMBED_DIM       default 1536  (must match the halfvec(N) column)
 */
const GATEWAY = "https://ai-gateway.vercel.sh/v1";

// Resolved lazily, not at module scope: callers like scripts/os-embed.ts run
// process.loadEnvFile() in their module body, which executes AFTER hoisted imports —
// module-level env reads here would always miss .env.local.
function embedConfig() {
  const explicit = process.env.EMBED_API_KEY ?? process.env.OPENAI_API_KEY;
  // No explicit key → route through the Vercel AI Gateway, authed by the deployment's OIDC
  // token (auto-provided on Vercel; locally via `vercel env pull`). The OIDC fallback is
  // gateway-only — it is never sent to any other base URL.
  const base = process.env.EMBED_BASE_URL ?? (explicit ? "https://api.openai.com/v1" : GATEWAY);
  const key = explicit ?? (base === GATEWAY ? process.env.VERCEL_OIDC_TOKEN : undefined);
  const model =
    process.env.EMBED_MODEL ?? (base === GATEWAY ? "openai/text-embedding-3-small" : "text-embedding-3-small");
  return { base, key, model };
}

export function embedModel(): string {
  return embedConfig().model;
}
export const EMBED_DIM = Number(process.env.EMBED_DIM ?? 1536);

export function hasEmbedKey(): boolean {
  return Boolean(embedConfig().key);
}

/** Embed a batch of texts → array of vectors (length EMBED_DIM each). */
export async function embed(texts: string[]): Promise<number[][]> {
  const { base, key, model } = embedConfig();
  if (!key) throw new Error("No embedding credential — set EMBED_API_KEY/OPENAI_API_KEY, or provide VERCEL_OIDC_TOKEN (vercel env pull) for the AI Gateway path. See src/server/os/embed.ts.");
  if (texts.length === 0) return [];
  const res = await fetch(`${base}/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, input: texts, dimensions: EMBED_DIM }),
  });
  if (!res.ok) throw new Error(`embeddings ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = (await res.json()) as { data: { embedding: number[]; index: number }[] };
  // preserve input order
  return json.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

/** pgvector/halfvec literal for a SQL parameter: '[0.1,0.2,...]'. */
export function toVectorLiteral(v: number[]): string {
  return `[${v.join(",")}]`;
}
