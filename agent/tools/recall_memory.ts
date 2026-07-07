import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql, embed, hasEmbedKey, toVectorLiteral } from "../lib/os.js";

export default defineTool({
  description:
    "Search the agent's memory (company facts, lessons, and ingested docs like the architecture/decisions) " +
    "by meaning + keywords. Use for definitions ('how is MRR calculated?', 'what is collection rate?'), " +
    "architecture/context, and remembered lessons. Returns ranked snippets.",
  inputSchema: z.object({
    query: z.string().describe("what to recall"),
    scope: z.string().optional().describe("optional scope filter, e.g. 'company' or a doc source path"),
    k: z.number().int().min(1).max(20).default(8),
  }),
  async execute({ query, scope, k }) {
    // Hybrid recall: embed the query server-side (AI Gateway via OIDC, or an explicit key);
    // falls back to lexical+recency (NULL embedding) when no credential is available —
    // or when embedding fails (e.g. expired local OIDC token): degrade, don't fail recall.
    let vec: number[] | null = null;
    if (hasEmbedKey()) {
      try {
        vec = (await embed([query]))[0] ?? null;
      } catch {
        vec = null;
      }
    }
    const rows = (await osSql()`
      SELECT kind, content, round(score::numeric, 3) AS score
      FROM memory.recall(${query}, ${vec ? toVectorLiteral(vec) : null}::halfvec(1536), ${scope ?? null}, ${k})
    `) as Record<string, unknown>[];
    return { results: rows, semantic: vec !== null };
  },
});
