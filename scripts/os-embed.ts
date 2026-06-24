/**
 * Swayzio OS memory ingest + embedding backfill (Phase E).
 *
 *   npx tsx scripts/os-embed.ts            # ingest docs (text) + embed null rows (if key set)
 *   npx tsx scripts/os-embed.ts --no-docs  # only backfill embeddings
 *
 * Step 1 (no key needed): chunk the OS docs into memory.document — immediately lexically searchable.
 * Step 2 (needs EMBED_API_KEY): backfill embeddings for memory.document + memory.fact rows where
 *   embedding IS NULL, activating semantic + hybrid recall. Idempotent; safe to re-run.
 */
try { process.loadEnvFile(".env.local"); } catch { /* ambient env */ }

import { readFile } from "node:fs/promises";
import { osSql } from "@/server/os/db";
import { embed, hasEmbedKey, toVectorLiteral, EMBED_MODEL, EMBED_DIM } from "@/server/os/embed";

const DOCS = ["docs/COMPANY-OS.md", "docs/DECISIONS.md", "docs/ARCHITECTURE.md", "db/swayzio-os/README.md"];
const ingestDocs = !process.argv.includes("--no-docs");
const sql = osSql();

/** Split markdown into ~1200-char chunks on blank lines (keeps paragraphs/headings intact). */
function chunk(text: string, target = 1200): string[] {
  const out: string[] = [];
  let buf = "";
  for (const para of text.split(/\n\s*\n/)) {
    if (buf && buf.length + para.length > target) { out.push(buf.trim()); buf = ""; }
    buf += (buf ? "\n\n" : "") + para;
  }
  if (buf.trim()) out.push(buf.trim());
  return out.filter((c) => c.length > 20);
}

if (ingestDocs) {
  let total = 0;
  for (const path of DOCS) {
    let text: string;
    try { text = await readFile(path, "utf8"); } catch { console.log(`  skip ${path} (not found)`); continue; }
    const chunks = chunk(text);
    for (let i = 0; i < chunks.length; i++) {
      await sql`
        INSERT INTO memory.document (source, uri, chunk_index, content, metadata)
        VALUES (${path}, ${path}, ${i}, ${chunks[i]}, ${JSON.stringify({ kind: "doc" })}::jsonb)
        ON CONFLICT (source, chunk_index) DO UPDATE SET content = EXCLUDED.content, embedding = NULL, model = NULL
      `;
    }
    total += chunks.length;
    console.log(`  ingested ${path}: ${chunks.length} chunks`);
  }
  console.log(`docs ingested: ${total} chunks total`);
}

// Backfill embeddings
const docNull = (await sql`SELECT count(*)::int c FROM memory.document WHERE embedding IS NULL`) as { c: number }[];
const factNull = (await sql`SELECT count(*)::int c FROM memory.fact WHERE embedding IS NULL`) as { c: number }[];
const pending = docNull[0].c + factNull[0].c;

if (!hasEmbedKey()) {
  console.log(`\n${pending} rows awaiting embeddings (${docNull[0].c} docs, ${factNull[0].c} facts).`);
  console.log("Set EMBED_API_KEY (or OPENAI_API_KEY) to backfill — lexical recall works meanwhile.");
  process.exit(0);
}

console.log(`\nEmbedding ${pending} rows with ${EMBED_MODEL} (dim ${EMBED_DIM})…`);

async function embedRows(rows: { id: string; content: string }[], label: string,
  update: (id: string, lit: string) => Promise<unknown>) {
  for (let i = 0; i < rows.length; i += 64) {
    const batch = rows.slice(i, i + 64);
    const vecs = await embed(batch.map((r) => r.content));
    for (let j = 0; j < batch.length; j++) await update(batch[j].id, toVectorLiteral(vecs[j]));
    console.log(`  ${label}: ${Math.min(i + 64, rows.length)}/${rows.length}`);
  }
}

await embedRows(
  (await sql`SELECT id, content FROM memory.document WHERE embedding IS NULL`) as { id: string; content: string }[],
  "document",
  (id, lit) => sql`UPDATE memory.document SET embedding = ${lit}::halfvec(1536), model = ${EMBED_MODEL} WHERE id = ${id}`,
);
await embedRows(
  (await sql`SELECT id, content FROM memory.fact WHERE embedding IS NULL`) as { id: string; content: string }[],
  "fact",
  (id, lit) => sql`UPDATE memory.fact SET embedding = ${lit}::halfvec(1536), model = ${EMBED_MODEL} WHERE id = ${id}`,
);
console.log("✓ embeddings backfilled — semantic recall active.");
