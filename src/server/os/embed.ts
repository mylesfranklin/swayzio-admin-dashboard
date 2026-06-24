/**
 * Provider-agnostic text embeddings for memory.* (Phase E).
 *
 * Uses an OpenAI-compatible /embeddings endpoint so it works with OpenAI, the Vercel AI Gateway,
 * Together, etc. — point it via env. Pinned schema dim is halfvec(1536); keep EMBED_DIM in sync.
 *
 *   EMBED_API_KEY   (or OPENAI_API_KEY)   — required to actually embed
 *   EMBED_BASE_URL  default https://api.openai.com/v1
 *   EMBED_MODEL     default text-embedding-3-small
 *   EMBED_DIM       default 1536  (must match the halfvec(N) column)
 */
export const EMBED_MODEL = process.env.EMBED_MODEL ?? "text-embedding-3-small";
export const EMBED_DIM = Number(process.env.EMBED_DIM ?? 1536);
const BASE = process.env.EMBED_BASE_URL ?? "https://api.openai.com/v1";
const KEY = process.env.EMBED_API_KEY ?? process.env.OPENAI_API_KEY;

export function hasEmbedKey(): boolean {
  return Boolean(KEY);
}

/** Embed a batch of texts → array of vectors (length EMBED_DIM each). */
export async function embed(texts: string[]): Promise<number[][]> {
  if (!KEY) throw new Error("No embedding key — set EMBED_API_KEY (or OPENAI_API_KEY). See src/server/os/embed.ts.");
  if (texts.length === 0) return [];
  const res = await fetch(`${BASE}/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: EMBED_MODEL, input: texts, dimensions: EMBED_DIM }),
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
