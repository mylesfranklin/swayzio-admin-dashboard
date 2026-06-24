-- 0006_core_hubspot.sql — Phase C: HubSpot contacts + daily metrics
-- Fed by src/server/os/feeds/hubspot.ts. Contacts are music-catalog artists.
-- Idempotent.

CREATE TABLE IF NOT EXISTS core.contact (
  id              text PRIMARY KEY,                               -- hubspot contact id
  identity_id     uuid REFERENCES core.identity(id) ON DELETE SET NULL,
  email           citext,
  artist_name     text,
  tagged_tracks   int NOT NULL DEFAULT 0,
  untagged_tracks int NOT NULL DEFAULT 0,
  pro             text,                                           -- BMI/ASCAP/PRS/SOCAN/SESAC/Other
  subscribed      boolean,
  signed_to_deal  boolean,
  last_modified   timestamptz,
  synced_at       timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.contact IS 'HubSpot contacts (catalog artists), linked to core.identity by email.';
CREATE INDEX IF NOT EXISTS contact_identity_idx ON core.contact(identity_id);
CREATE INDEX IF NOT EXISTS contact_tracks_idx ON core.contact(tagged_tracks DESC);

CREATE TABLE IF NOT EXISTS metrics.hubspot_daily (
  day                  date PRIMARY KEY,
  total_contacts       int,
  artists              int,
  subscribed           int,
  signed_to_deal       int,
  has_pro              int,
  active_subs_30d      int,
  active_subs_60d      int,
  tagged_tracks_total  bigint,
  untagged_tracks_total bigint,
  artists_with_tracks  int,
  computed_at          timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE metrics.hubspot_daily IS 'Daily HubSpot headline snapshot — contacts/artists/subscribed/catalog totals. One row/day.';

INSERT INTO ops.data_dictionary (schema_name, table_name, column_name, description) VALUES
  ('core',   'contact',       '*', 'HubSpot contacts (catalog artists), linked to core.identity by email.'),
  ('metrics','hubspot_daily', '*', 'Daily HubSpot snapshot — contacts, artists, subscribed, signed, catalog track totals.')
ON CONFLICT (schema_name, table_name, column_name) DO UPDATE SET description = EXCLUDED.description, updated_at = now();
