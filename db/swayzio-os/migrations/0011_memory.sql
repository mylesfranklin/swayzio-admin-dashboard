-- 0011_memory.sql — Phase E: agent-native memory (pgvector + hybrid recall)
-- Two stores: memory.document (chunked source text for RAG) and memory.fact (provenance-gated
-- agent lessons). Both are lexically searchable IMMEDIATELY (content_tsv) and gain semantic recall
-- once embeddings are backfilled (scripts/os-embed.ts). Embedding model pinned to OpenAI
-- text-embedding-3-small → halfvec(1536); switching providers/dims requires a migration. Idempotent.

-- ── Documents: chunked source text (docs, notes, transcripts) for retrieval ───
CREATE TABLE IF NOT EXISTS memory.document (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source      text NOT NULL,                                    -- logical doc id, e.g. 'docs/COMPANY-OS.md'
  uri         text,                                             -- optional origin
  chunk_index int  NOT NULL DEFAULT 0,
  content     text NOT NULL,
  content_tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
  embedding   halfvec(1536),                                    -- null until embedded
  model       text,                                             -- embedding model used
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source, chunk_index)
);
COMMENT ON TABLE memory.document IS 'Chunked source text for RAG. Lexically searchable now; semantic once embedded.';
CREATE INDEX IF NOT EXISTS document_tsv_idx ON memory.document USING gin (content_tsv);
CREATE INDEX IF NOT EXISTS document_hnsw_idx ON memory.document USING hnsw (embedding halfvec_cosine_ops);

-- ── Facts: provenance-gated agent memory (lessons/facts about entities) ───────
CREATE TABLE IF NOT EXISTS memory.fact (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope        text NOT NULL DEFAULT 'company',                 -- 'company' | 'identity:<uuid>' | 'project:x' ...
  content      text NOT NULL,
  category     text NOT NULL DEFAULT 'fact'                     -- fact | preference | rule | lesson | event
                 CHECK (category IN ('fact','preference','rule','lesson','event')),
  importance   int  NOT NULL DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),
  content_tsv  tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
  embedding    halfvec(1536),
  model        text,
  -- write-time provenance gate: a fact MUST cite where it came from (no silent hallucinations).
  provenance   jsonb NOT NULL CHECK (provenance ? 'source' AND length(provenance->>'source') > 0),
  superseded_by uuid REFERENCES memory.fact(id),               -- soft-supersede (keep history)
  created_at   timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE memory.fact IS 'Provenance-gated agent memory. Every row must cite provenance.source. Supersede, never overwrite.';
CREATE INDEX IF NOT EXISTS fact_tsv_idx ON memory.fact USING gin (content_tsv);
CREATE INDEX IF NOT EXISTS fact_hnsw_idx ON memory.fact USING hnsw (embedding halfvec_cosine_ops);
CREATE INDEX IF NOT EXISTS fact_scope_idx ON memory.fact (scope) WHERE superseded_by IS NULL;

-- ── Hybrid recall: vector + lexical + recency, in one call ────────────────────
-- query_embedding NULL → lexical+recency only (works before any embeddings exist).
CREATE OR REPLACE FUNCTION memory.recall(
  query_text      text,
  query_embedding halfvec(1536) DEFAULT NULL,
  p_scope         text DEFAULT NULL,
  k               int  DEFAULT 10
) RETURNS TABLE (kind text, id uuid, content text, score real, created_at timestamptz)
LANGUAGE sql STABLE AS $$
  WITH base AS (
    SELECT 'fact'::text AS kind, f.id, f.content, f.content_tsv, f.embedding, f.created_at, f.scope AS scope
    FROM memory.fact f
    WHERE f.superseded_by IS NULL AND (p_scope IS NULL OR f.scope = p_scope)
    UNION ALL
    SELECT 'document', d.id, d.content, d.content_tsv, d.embedding, d.created_at, d.source
    FROM memory.document d
    WHERE (p_scope IS NULL OR d.source = p_scope)
  )
  SELECT
    base.kind, base.id, base.content,
    ( 0.55 * (CASE WHEN query_embedding IS NOT NULL AND base.embedding IS NOT NULL
                   THEN 1 - (base.embedding <=> query_embedding) ELSE 0 END)
    + 0.30 * ts_rank(base.content_tsv, plainto_tsquery('english', coalesce(query_text, '')))
    + 0.15 * (1.0 / (1.0 + extract(epoch FROM (now() - base.created_at)) / 86400.0 / 30.0))
    )::real AS score,
    base.created_at
  FROM base
  WHERE coalesce(query_text, '') = ''
     OR base.content_tsv @@ plainto_tsquery('english', query_text)
     OR (query_embedding IS NOT NULL AND base.embedding IS NOT NULL)
  ORDER BY score DESC
  LIMIT k;
$$;
COMMENT ON FUNCTION memory.recall IS 'Hybrid recall over facts+documents: 0.55 vector + 0.30 lexical + 0.15 recency. query_embedding optional.';

INSERT INTO ops.data_dictionary (schema_name, table_name, column_name, description) VALUES
  ('memory','document','*', 'Chunked source text for RAG (halfvec 1536 + tsvector). Lexical now, semantic once embedded.'),
  ('memory','fact','*',     'Provenance-gated agent memory; every row cites provenance.source. Supersede, never overwrite.'),
  ('memory','recall','*',   'FUNCTION recall(query_text, query_embedding, scope, k): hybrid vector+lexical+recency search.')
ON CONFLICT (schema_name, table_name, column_name) DO UPDATE SET description = EXCLUDED.description, updated_at = now();
