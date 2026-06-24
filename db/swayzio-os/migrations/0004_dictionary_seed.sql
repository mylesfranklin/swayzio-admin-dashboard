-- 0004_dictionary_seed.sql — seed ops.data_dictionary for the Phase A tables
-- So an agent that reads ops.data_dictionary is immediately oriented. Idempotent.

INSERT INTO ops.data_dictionary (schema_name, table_name, column_name, description) VALUES
  ('raw',  'records',        '*',           'Append-only landing zone: verbatim source payloads with provenance. Read latest per (source,entity,source_id).'),
  ('core', 'identity',       '*',           'One resolved person, keyed by email. The join point across Stripe/HubSpot/app DB.'),
  ('core', 'identity',       'email',       'Case-insensitive primary resolution key. NULL only for emailless records.'),
  ('core', 'identity',       'is_personal', 'True for gmail/yahoo/etc. Company rollups exclude these.'),
  ('core', 'identity_link',  '*',           'Maps each source record (source, source_id) to its core.identity.'),
  ('core', 'company',        '*',           'Domain-level entity (label/distributor). Personal & swayzio.com domains excluded.'),
  ('ops',  'sync_runs',      '*',           'One row per ELT run: status/counts/cursor/duration. The ingestion heartbeat ledger.'),
  ('ops',  'sync_state',     '*',           'Per-feed incremental cursor; each run only pulls new/changed data.'),
  ('ops',  'outbox',         '*',           'Side-effect intents committed with the data write; a relay publishes them later.'),
  ('ops',  'data_freshness', '*',           'View: most recent run per feed — staleness at a glance.'),
  ('ops',  'data_dictionary','*',           'This table. Plain-English description of every table/column for agent self-orientation.')
ON CONFLICT (schema_name, table_name, column_name) DO UPDATE
  SET description = EXCLUDED.description, updated_at = now();
