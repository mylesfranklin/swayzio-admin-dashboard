-- 0023_super_followers_reach_weighting.sql - Keep super-follower ranking reach-led while still rewarding recent engagement.

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
),
scored AS (
  SELECT
    a.*,
    r.total_engagements,
    r.comment_count,
    r.dm_count,
    r.mention_count,
    r.engagement_likes,
    r.first_engagement_at,
    r.latest_engagement_at,
    coalesce(m.recent_engagements, '[]'::jsonb) AS recent_engagements,
    CASE
      WHEN coalesce(a.follower_count, 0) >= 100000 THEN 'major'
      WHEN coalesce(a.follower_count, 0) >= 25000 THEN 'high'
      WHEN coalesce(a.follower_count, 0) >= 5000 THEN 'emerging'
      WHEN coalesce(a.follower_count, 0) > 0 THEN 'niche'
      ELSE 'unknown'
    END AS follower_tier,
    CASE
      WHEN coalesce(r.dm_count, 0) > 0 THEN 'DM follow-up'
      WHEN coalesce(a.follower_count, 0) >= 25000 AND coalesce(r.comment_count, 0) > 0 THEN 'Partnership lead'
      WHEN coalesce(r.total_engagements, 0) >= 3 THEN 'Warm engager'
      WHEN r.latest_engagement_at >= now() - interval '14 days' THEN 'Recent touch'
      ELSE 'Monitor'
    END AS suggested_action,
    (
      CASE WHEN coalesce(a.follower_count, 0) > 0 THEN ln(a.follower_count + 1) * 25 ELSE 0 END +
      least(coalesce(r.total_engagements, 0), 10) * 8 +
      least(coalesce(r.comment_count, 0), 15) * 4 +
      least(coalesce(r.dm_count, 0), 5) * 20 +
      least(coalesce(r.mention_count, 0), 5) * 16 +
      least(coalesce(r.engagement_likes, 0), 250) * 0.20 +
      CASE
        WHEN r.latest_engagement_at >= now() - interval '7 days' THEN 25
        WHEN r.latest_engagement_at >= now() - interval '30 days' THEN 12
        WHEN r.latest_engagement_at >= now() - interval '90 days' THEN 4
        ELSE 0
      END +
      CASE
        WHEN coalesce(a.follower_count, 0) >= 100000 THEN 60
        WHEN coalesce(a.follower_count, 0) >= 25000 THEN 40
        WHEN coalesce(a.follower_count, 0) >= 5000 THEN 24
        WHEN coalesce(a.follower_count, 0) > 0 THEN 8
        ELSE 0
      END
    ) AS raw_impact_score
  FROM core.social_actor a
  JOIN engagement_rollup r ON r.actor_id = a.id
  LEFT JOIN recent_messages m ON m.actor_id = a.id
)
SELECT
  id,
  platform,
  platform_actor_id,
  username,
  display_name,
  biography,
  website,
  profile_url,
  profile_picture_url,
  follower_count,
  follows_count,
  media_count,
  is_verified,
  is_business_discovery_enriched,
  total_engagements,
  comment_count,
  dm_count,
  mention_count,
  engagement_likes,
  first_engagement_at,
  latest_engagement_at,
  follower_tier,
  round(raw_impact_score::numeric, 2) AS impact_score,
  suggested_action,
  recent_engagements,
  synced_at
FROM scored
ORDER BY raw_impact_score DESC, follower_count DESC NULLS LAST, latest_engagement_at DESC NULLS LAST;
COMMENT ON VIEW api.super_followers IS 'Reach-led ranking of high-impact social accounts known through comments, messages, mentions, and public enrichment.';

INSERT INTO ops.data_dictionary (schema_name, table_name, column_name, description) VALUES
  ('api','super_followers','*','Reach-led ranking of high-impact social accounts known through comments, messages, mentions, and public enrichment.')
ON CONFLICT (schema_name, table_name, column_name) DO UPDATE
  SET description = EXCLUDED.description, updated_at = now();
