-- 0003_core_identity.sql — Swayzio OS identity spine
-- The connective tissue: one resolved person/company across Stripe, HubSpot, app DB.
-- This is what turns siloed tables into a company brain. See docs/COMPANY-OS.md §4.
-- Idempotent.

-- ── Resolved person (one row per real human) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS core.identity (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email          citext UNIQUE,                 -- the primary resolution key (case-insensitive)
  display_name   text,
  primary_domain text,                          -- email domain, for company rollups
  is_personal    boolean NOT NULL DEFAULT false,-- gmail/yahoo/etc. — company breakdowns exclude these
  first_seen_at  timestamptz NOT NULL DEFAULT now(),
  last_seen_at   timestamptz NOT NULL DEFAULT now(),
  traits         jsonb NOT NULL DEFAULT '{}'::jsonb  -- merged, source-agnostic attributes
);
COMMENT ON TABLE core.identity IS 'One resolved person, keyed by email; the join point for every source.';

-- ── Source links (each source record → one identity) ─────────────────────────
CREATE TABLE IF NOT EXISTS core.identity_link (
  source       text NOT NULL,                   -- 'stripe' | 'hubspot' | 'app_db'
  source_id    text NOT NULL,                   -- customer id / contact id / user id
  identity_id  uuid NOT NULL REFERENCES core.identity(id) ON DELETE CASCADE,
  source_email citext,
  linked_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (source, source_id)
);
COMMENT ON TABLE core.identity_link IS 'Maps a record in a source system to its resolved core.identity.';
CREATE INDEX IF NOT EXISTS identity_link_identity_idx ON core.identity_link (identity_id);

-- ── Companies (domain-level rollup; mirrors HubSpot catalog-scan logic) ───────
CREATE TABLE IF NOT EXISTS core.company (
  domain        text PRIMARY KEY,
  display_name  text,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at  timestamptz NOT NULL DEFAULT now(),
  traits        jsonb NOT NULL DEFAULT '{}'::jsonb
);
COMMENT ON TABLE core.company IS 'Domain-level entity (label/distributor/etc.). Personal & internal domains excluded.';

-- ── Personal-email detector (keep company rollups honest) ────────────────────
CREATE OR REPLACE FUNCTION core.is_personal_domain(p_domain text)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT lower(coalesce(p_domain,'')) IN (
    'gmail.com','googlemail.com','yahoo.com','ymail.com','hotmail.com','outlook.com',
    'live.com','icloud.com','me.com','aol.com','proton.me','protonmail.com','gmx.com','msn.com'
  );
$$;

-- ── The resolver: upsert identity by email + link the source record ──────────
-- Returns the resolved identity id. Idempotent: same (source, source_id) re-links;
-- same email merges onto the same identity. Call this from every feed's transform.
CREATE OR REPLACE FUNCTION core.resolve_identity(
  p_source    text,
  p_source_id text,
  p_email     citext,
  p_name      text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql AS $$
DECLARE
  v_domain   text := NULLIF(split_part(lower(coalesce(p_email,'')), '@', 2), '');
  v_personal boolean := core.is_personal_domain(v_domain);
  v_id       uuid;
BEGIN
  -- 1. Find-or-create the identity by email (the resolution key).
  IF p_email IS NOT NULL THEN
    INSERT INTO core.identity (email, display_name, primary_domain, is_personal)
    VALUES (p_email, p_name, v_domain, v_personal)
    ON CONFLICT (email) DO UPDATE
      SET last_seen_at  = now(),
          display_name  = COALESCE(core.identity.display_name, EXCLUDED.display_name),
          primary_domain = COALESCE(core.identity.primary_domain, EXCLUDED.primary_domain)
    RETURNING id INTO v_id;
  ELSE
    -- No email: mint a standalone identity (can be merged later by a backfill).
    INSERT INTO core.identity (display_name) VALUES (p_name) RETURNING id INTO v_id;
  END IF;

  -- 2. Link the source record to it (idempotent on re-sync).
  INSERT INTO core.identity_link (source, source_id, identity_id, source_email)
  VALUES (p_source, p_source_id, v_id, p_email)
  ON CONFLICT (source, source_id) DO UPDATE
    SET identity_id  = EXCLUDED.identity_id,
        source_email = EXCLUDED.source_email,
        linked_at    = now();

  -- 3. Maintain the company row for non-personal domains.
  IF v_domain IS NOT NULL AND NOT v_personal AND v_domain <> 'swayzio.com' THEN
    INSERT INTO core.company (domain) VALUES (v_domain)
    ON CONFLICT (domain) DO UPDATE SET last_seen_at = now();
  END IF;

  RETURN v_id;
END;
$$;
COMMENT ON FUNCTION core.resolve_identity IS 'Upsert+link a source record to a resolved core.identity by email. The identity spine entry point.';
