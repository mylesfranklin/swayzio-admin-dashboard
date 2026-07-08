-- 0022_social_engagement_super_followers.sql - Cross-platform social actors, engagements, and super-follower scoring.

CREATE TABLE IF NOT EXISTS core.social_actor (
  id                         text PRIMARY KEY,
  platform                   text NOT NULL,
  platform_actor_id          text,
  username                   text,
  display_name               text,
  biography                  text,
  website                    text,
  profile_url                text,
  profile_picture_url        text,
  follower_count             bigint,
  follows_count              bigint,
  media_count                bigint,
  is_verified                boolean,
  is_business_discovery_enriched boolean NOT NULL DEFAULT false,
  last_enriched_at           timestamptz,
  raw                        jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at                  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (platform, username)
);
CREATE INDEX IF NOT EXISTS social_actor_platform_followers_idx ON core.social_actor(platform, follower_count DESC NULLS LAST);
COMMENT ON TABLE core.social_actor IS 'Known external social accounts discovered through comments, messages, mentions, or enrichment APIs.';

CREATE TABLE IF NOT EXISTS core.social_engagement (
  id                  text PRIMARY KEY,
  actor_id            text REFERENCES core.social_actor(id) ON DELETE SET NULL,
  platform            text NOT NULL,
  engagement_type     text NOT NULL,
  source_id           text,
  parent_id           text,
  source_account_id   text,
  source_media_id     text,
  source_post_id      text,
  permalink           text,
  message             text,
  occurred_at         timestamptz,
  like_count          bigint,
  reply_count         bigint,
  score_weight        numeric NOT NULL DEFAULT 1,
  raw                 jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS social_engagement_actor_time_idx ON core.social_engagement(actor_id, occurred_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS social_engagement_platform_type_idx ON core.social_engagement(platform, engagement_type, occurred_at DESC NULLS LAST);
COMMENT ON TABLE core.social_engagement IS 'Atomic known social touches: comments, replies, DMs, mentions, and future engagement events.';

CREATE OR REPLACE VIEW api.social_actors AS
SELECT * FROM core.social_actor ORDER BY follower_count DESC NULLS LAST, synced_at DESC;
COMMENT ON VIEW api.social_actors IS 'External social accounts known to Swayzio, enriched with public profile metrics when available.';

CREATE OR REPLACE VIEW api.social_engagements AS
SELECT
  e.*,
  a.username,
  a.display_name,
  a.follower_count,
  a.media_count,
  a.profile_url,
  a.profile_picture_url
FROM core.social_engagement e
LEFT JOIN core.social_actor a ON a.id = e.actor_id
ORDER BY e.occurred_at DESC NULLS LAST;
COMMENT ON VIEW api.social_engagements IS 'Known social engagement events with actor enrichment.';

CREATE OR REPLACE VIEW api.super_followers AS
WITH engagement_rollup AS (
  SELECT
    actor_id,
    count(*)::int AS total_engagements,
    count(*) FILTER (WHERE engagement_type IN ('instagram_comment','instagram_reply','facebook_comment'))::int AS comment_count,
    count(*) FILTER (WHERE engagement_type IN ('instagram_dm','facebook_dm'))::int AS dm_count,
    count(*) FILTER (WHERE engagement_type IN ('instagram_mention','facebook_mention'))::int AS mention_count,
    sum(coalesce(like_count, 0))::bigint AS engagement_likes,
    min(occurred_at) AS first_engagement_at,
    max(occurred_at) AS latest_engagement_at
  FROM core.social_engagement
  GROUP BY actor_id
),
recent_messages AS (
  SELECT actor_id,
         jsonb_agg(jsonb_build_object(
           'type', engagement_type,
           'platform', platform,
           'message', left(coalesce(message, ''), 280),
           'occurred_at', occurred_at,
           'permalink', permalink
         ) ORDER BY occurred_at DESC NULLS LAST) FILTER (WHERE rn <= 3) AS recent_engagements
  FROM (
    SELECT e.*, row_number() OVER (PARTITION BY actor_id ORDER BY occurred_at DESC NULLS LAST) AS rn
    FROM core.social_engagement e
  ) ranked
  GROUP BY actor_id
)
SELECT
  a.id,
  a.platform,
  a.platform_actor_id,
  a.username,
  a.display_name,
  a.biography,
  a.website,
  a.profile_url,
  a.profile_picture_url,
  a.follower_count,
  a.follows_count,
  a.media_count,
  a.is_verified,
  a.is_business_discovery_enriched,
  r.total_engagements,
  r.comment_count,
  r.dm_count,
  r.mention_count,
  r.engagement_likes,
  r.first_engagement_at,
  r.latest_engagement_at,
  CASE
    WHEN coalesce(a.follower_count, 0) >= 100000 THEN 'major'
    WHEN coalesce(a.follower_count, 0) >= 25000 THEN 'high'
    WHEN coalesce(a.follower_count, 0) >= 5000 THEN 'emerging'
    WHEN coalesce(a.follower_count, 0) > 0 THEN 'niche'
    ELSE 'unknown'
  END AS follower_tier,
  round((
    coalesce(ln(greatest(a.follower_count, 0) + 1) * 12, 0) +
    coalesce(r.total_engagements, 0) * 5 +
    coalesce(r.comment_count, 0) * 6 +
    coalesce(r.dm_count, 0) * 22 +
    coalesce(r.mention_count, 0) * 14 +
    coalesce(least(r.engagement_likes, 250), 0) * 0.25 +
    CASE
      WHEN r.latest_engagement_at >= now() - interval '7 days' THEN 25
      WHEN r.latest_engagement_at >= now() - interval '30 days' THEN 12
      WHEN r.latest_engagement_at >= now() - interval '90 days' THEN 4
      ELSE 0
    END
  )::numeric, 2) AS impact_score,
  CASE
    WHEN coalesce(r.dm_count, 0) > 0 THEN 'DM follow-up'
    WHEN coalesce(a.follower_count, 0) >= 25000 AND coalesce(r.comment_count, 0) > 0 THEN 'Partnership lead'
    WHEN coalesce(r.total_engagements, 0) >= 3 THEN 'Warm engager'
    WHEN r.latest_engagement_at >= now() - interval '14 days' THEN 'Recent touch'
    ELSE 'Monitor'
  END AS suggested_action,
  coalesce(m.recent_engagements, '[]'::jsonb) AS recent_engagements,
  a.synced_at
FROM core.social_actor a
JOIN engagement_rollup r ON r.actor_id = a.id
LEFT JOIN recent_messages m ON m.actor_id = a.id
ORDER BY impact_score DESC, r.latest_engagement_at DESC NULLS LAST;
COMMENT ON VIEW api.super_followers IS 'Ranked high-impact social accounts known through comments, messages, mentions, and public enrichment.';

ALTER VIEW api.data_quality RENAME TO data_quality_before_social_engagement;

CREATE OR REPLACE VIEW api.data_quality AS
SELECT * FROM api.data_quality_before_social_engagement
UNION ALL
SELECT
  'social'::text AS source,
  'actor'::text AS entity,
  (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='social' AND entity='actor') r)::bigint AS source_rows,
  (SELECT count(*) FROM core.social_actor)::bigint AS neon_rows,
  ((SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='social' AND entity='actor') r)::bigint - (SELECT count(*) FROM core.social_actor)::bigint) AS row_delta,
  0::bigint AS null_identity_rows,
  0::numeric AS null_identity_pct,
  0::bigint AS null_email_rows,
  0::numeric AS null_email_pct
UNION ALL
SELECT
  'social', 'engagement',
  (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='social' AND entity='engagement') r)::bigint,
  (SELECT count(*) FROM core.social_engagement)::bigint,
  ((SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='social' AND entity='engagement') r)::bigint - (SELECT count(*) FROM core.social_engagement)::bigint),
  0::bigint, 0::numeric, 0::bigint, 0::numeric
ORDER BY source, entity;
COMMENT ON VIEW api.data_quality IS 'Source-vs-Neon row coverage, identity/email gaps, and data dictionary coverage.';

INSERT INTO ops.data_dictionary (schema_name, table_name, column_name, description) VALUES
  ('core','social_actor','*','Known external social accounts discovered through engagement and enriched with public profile metrics.'),
  ('core','social_engagement','*','Atomic known social touches: comments, replies, DMs, mentions, and future engagement events.'),
  ('api','social_actors','*','External social accounts known to Swayzio, enriched with public profile metrics when available.'),
  ('api','social_engagements','*','Known social engagement events with actor enrichment.'),
  ('api','super_followers','*','Ranked high-impact social accounts known through comments, messages, mentions, and public enrichment.'),
  ('api','data_quality_before_social_engagement','*','Previous data-quality view retained for social engagement wrapper migration.')
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
