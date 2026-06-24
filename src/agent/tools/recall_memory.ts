import { defineTool } from "eve/tools";
import { z } from "zod";
import { osSql } from "../lib/os.js";

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
    // Lexical + recency path (query_embedding = NULL). Semantic recall activates once the
    // query is embedded server-side — a follow-up once EMBED_API_KEY is wired into the agent.
    const rows = (await osSql()`
      SELECT kind, content, round(score::numeric, 3) AS score
      FROM memory.recall(${query}, NULL, ${scope ?? null}, ${k})
    `) as Record<string, unknown>[];
    return { results: rows };
  },
});
