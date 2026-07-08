-- 0020_instagram_source_depth.sql - Instagram business account, media, and insights surfaces.

CREATE TABLE IF NOT EXISTS core.instagram_account (
  id                  text PRIMARY KEY,
  facebook_page_id    text REFERENCES core.facebook_page(id) ON DELETE SET NULL,
  username            text,
  name                text,
  biography           text,
  website             text,
  profile_picture_url text,
  followers_count     bigint,
  follows_count       bigint,
  media_count         bigint,
  ig_id               text,
  raw                 jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at           timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.instagram_account IS 'Instagram professional accounts connected to Facebook Pages visible to the Meta token.';

CREATE TABLE IF NOT EXISTS core.instagram_media (
  id                    text PRIMARY KEY,
  instagram_account_id  text NOT NULL REFERENCES core.instagram_account(id) ON DELETE CASCADE,
  caption               text,
  media_type            text,
  media_product_type    text,
  media_url             text,
  permalink             text,
  thumbnail_url         text,
  timestamp             timestamptz,
  username              text,
  like_count            bigint,
  comments_count        bigint,
  raw                   jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at             timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS instagram_media_account_timestamp_idx ON core.instagram_media(instagram_account_id, timestamp DESC);
COMMENT ON TABLE core.instagram_media IS 'Instagram media objects for connected professional accounts.';

CREATE TABLE IF NOT EXISTS core.instagram_account_insight (
  id                    text PRIMARY KEY,
  instagram_account_id  text NOT NULL REFERENCES core.instagram_account(id) ON DELETE CASCADE,
  metric_name           text NOT NULL,
  title                 text,
  description           text,
  period                text,
  end_time              timestamptz,
  value                 jsonb NOT NULL DEFAULT 'null'::jsonb,
  numeric_value         numeric,
  raw                   jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at             timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS instagram_account_insight_metric_idx ON core.instagram_account_insight(instagram_account_id, metric_name, end_time DESC);
COMMENT ON TABLE core.instagram_account_insight IS 'Instagram account-level Insights metric values when instagram_manage_insights is granted.';

CREATE TABLE IF NOT EXISTS core.instagram_media_insight (
  id                    text PRIMARY KEY,
  media_id              text NOT NULL REFERENCES core.instagram_media(id) ON DELETE CASCADE,
  instagram_account_id  text NOT NULL REFERENCES core.instagram_account(id) ON DELETE CASCADE,
  metric_name           text NOT NULL,
  title                 text,
  description           text,
  period                text,
  end_time              timestamptz,
  value                 jsonb NOT NULL DEFAULT 'null'::jsonb,
  numeric_value         numeric,
  raw                   jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at             timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS instagram_media_insight_metric_idx ON core.instagram_media_insight(media_id, metric_name, end_time DESC);
COMMENT ON TABLE core.instagram_media_insight IS 'Instagram media-level Insights metric values when instagram_manage_insights is granted.';

CREATE OR REPLACE VIEW api.instagram_accounts AS
SELECT
  ia.*,
  fp.name AS facebook_page_name
FROM core.instagram_account ia
LEFT JOIN core.facebook_page fp ON fp.id = ia.facebook_page_id
ORDER BY ia.username;
COMMENT ON VIEW api.instagram_accounts IS 'Instagram professional accounts connected to Facebook Pages, with profile counts and sanitized raw payloads.';

CREATE OR REPLACE VIEW api.instagram_media AS
SELECT
  m.*,
  a.username AS account_username,
  a.name AS account_name
FROM core.instagram_media m
JOIN core.instagram_account a ON a.id = m.instagram_account_id
ORDER BY m.timestamp DESC NULLS LAST;
COMMENT ON VIEW api.instagram_media IS 'Instagram media with caption, media type, links, and visible engagement counts.';

CREATE OR REPLACE VIEW api.instagram_account_insights AS
SELECT * FROM core.instagram_account_insight ORDER BY end_time DESC NULLS LAST, metric_name;
COMMENT ON VIEW api.instagram_account_insights IS 'Instagram account-level Insights metric values.';

CREATE OR REPLACE VIEW api.instagram_media_insights AS
SELECT
  i.*,
  m.timestamp AS media_timestamp,
  m.permalink,
  m.caption,
  m.media_type
FROM core.instagram_media_insight i
JOIN core.instagram_media m ON m.id = i.media_id
ORDER BY i.end_time DESC NULLS LAST, i.metric_name;
COMMENT ON VIEW api.instagram_media_insights IS 'Instagram media-level Insights metric values with media context.';

CREATE OR REPLACE VIEW api.instagram_snapshot AS
SELECT
  (SELECT count(*) FROM core.instagram_account)::int AS accounts,
  (SELECT coalesce(sum(followers_count), 0) FROM core.instagram_account)::bigint AS followers,
  (SELECT coalesce(sum(follows_count), 0) FROM core.instagram_account)::bigint AS follows,
  (SELECT coalesce(sum(media_count), 0) FROM core.instagram_account)::bigint AS total_media_on_profile,
  (SELECT count(*) FROM core.instagram_media)::int AS synced_media,
  (SELECT max(timestamp) FROM core.instagram_media)::timestamptz AS latest_media_at,
  (SELECT coalesce(sum(like_count), 0) FROM core.instagram_media)::bigint AS synced_likes,
  (SELECT coalesce(sum(comments_count), 0) FROM core.instagram_media)::bigint AS synced_comments;
COMMENT ON VIEW api.instagram_snapshot IS 'Instagram account and synced media snapshot for Eve and dashboard summaries.';

CREATE OR REPLACE VIEW api.instagram_top_media AS
SELECT
  id,
  instagram_account_id,
  account_username,
  media_type,
  media_product_type,
  timestamp,
  permalink,
  left(coalesce(caption, ''), 240) AS preview,
  coalesce(like_count, 0) AS likes,
  coalesce(comments_count, 0) AS comments,
  (coalesce(like_count, 0) + coalesce(comments_count, 0)) AS engagement
FROM api.instagram_media
ORDER BY (coalesce(like_count, 0) + coalesce(comments_count, 0)) DESC, timestamp DESC NULLS LAST
LIMIT 500;
COMMENT ON VIEW api.instagram_top_media IS 'Instagram media ranked by visible likes plus comments.';

ALTER VIEW api.data_quality RENAME TO data_quality_before_instagram;

CREATE OR REPLACE VIEW api.data_quality AS
SELECT * FROM api.data_quality_before_instagram
UNION ALL
SELECT
  'instagram'::text AS source,
  'account'::text AS entity,
  (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='instagram' AND entity='account') r)::bigint AS source_rows,
  (SELECT count(*) FROM core.instagram_account)::bigint AS neon_rows,
  ((SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='instagram' AND entity='account') r)::bigint - (SELECT count(*) FROM core.instagram_account)::bigint) AS row_delta,
  0::bigint AS null_identity_rows,
  0::numeric AS null_identity_pct,
  0::bigint AS null_email_rows,
  0::numeric AS null_email_pct
UNION ALL
SELECT
  'instagram', 'media',
  (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='instagram' AND entity='media') r)::bigint,
  (SELECT count(*) FROM core.instagram_media)::bigint,
  ((SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='instagram' AND entity='media') r)::bigint - (SELECT count(*) FROM core.instagram_media)::bigint),
  0::bigint, 0::numeric, 0::bigint, 0::numeric
UNION ALL
SELECT
  'instagram', 'account_insight',
  (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='instagram' AND entity='account_insight') r)::bigint,
  (SELECT count(*) FROM core.instagram_account_insight)::bigint,
  ((SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='instagram' AND entity='account_insight') r)::bigint - (SELECT count(*) FROM core.instagram_account_insight)::bigint),
  0::bigint, 0::numeric, 0::bigint, 0::numeric
UNION ALL
SELECT
  'instagram', 'media_insight',
  (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='instagram' AND entity='media_insight') r)::bigint,
  (SELECT count(*) FROM core.instagram_media_insight)::bigint,
  ((SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='instagram' AND entity='media_insight') r)::bigint - (SELECT count(*) FROM core.instagram_media_insight)::bigint),
  0::bigint, 0::numeric, 0::bigint, 0::numeric
ORDER BY source, entity;
COMMENT ON VIEW api.data_quality IS 'Source-vs-Neon row coverage, identity/email gaps, and data dictionary coverage.';

INSERT INTO ops.data_dictionary (schema_name, table_name, column_name, description) VALUES
  ('core','instagram_account','*','Instagram professional accounts connected to Facebook Pages visible to the Meta token.'),
  ('core','instagram_media','*','Instagram media objects for connected professional accounts.'),
  ('core','instagram_account_insight','*','Instagram account-level Insights metric values when instagram_manage_insights is granted.'),
  ('core','instagram_media_insight','*','Instagram media-level Insights metric values when instagram_manage_insights is granted.'),
  ('api','instagram_accounts','*','Instagram professional accounts connected to Facebook Pages, with profile counts and sanitized raw payloads.'),
  ('api','instagram_media','*','Instagram media with caption, media type, links, and visible engagement counts.'),
  ('api','instagram_account_insights','*','Instagram account-level Insights metric values.'),
  ('api','instagram_media_insights','*','Instagram media-level Insights metric values with media context.'),
  ('api','instagram_snapshot','*','Instagram account and synced media snapshot for Eve and dashboard summaries.'),
  ('api','instagram_top_media','*','Instagram media ranked by visible likes plus comments.'),
  ('api','data_quality_before_instagram','*','Previous data-quality view retained for Instagram wrapper migration.')
ON CONFLICT (schema_name, table_name, column_name) DO UPDATE
  SET description = EXCLUDED.description, updated_at = now();

GRANT SELECT ON ALL TABLES IN SCHEMA api TO authenticated;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'os_agent_ro') THEN
    EXECUTE 'GRANT USAGE ON SCHEMA api TO os_agent_ro';
    EXECUTE 'GRANT SELECT ON ALL TABLES IN SCHEMA api TO os_agent_ro';
  END IF;
END $$;
