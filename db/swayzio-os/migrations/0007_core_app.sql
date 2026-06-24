-- 0007_core_app.sql — Phase C: Swayzio-Core app entities + daily metrics
-- Fed by src/server/os/feeds/app.ts (reads the app DB read-only via SWAYZIO_APP_DATABASE_URL).
-- billing_customers is the authoritative app↔Stripe link (owner_id ↔ stripe_customer_id ↔ email).
-- Idempotent.

CREATE TABLE IF NOT EXISTS core.app_customer (
  owner_id           text PRIMARY KEY,                            -- app internal owner/user id
  identity_id        uuid REFERENCES core.identity(id) ON DELETE SET NULL,
  email              citext,
  stripe_customer_id text,                                        -- authoritative link to core.customer.id
  created_at         timestamptz,
  synced_at          timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.app_customer IS 'Swayzio-Core billing_customers: app user ↔ Stripe customer ↔ email. The authoritative cross-source link.';
CREATE INDEX IF NOT EXISTS app_customer_identity_idx ON core.app_customer(identity_id);
CREATE INDEX IF NOT EXISTS app_customer_stripe_idx ON core.app_customer(stripe_customer_id);

CREATE TABLE IF NOT EXISTS metrics.app_daily (
  day                date PRIMARY KEY,
  billing_customers  int,
  owners_with_tracks int,
  live_tracks        bigint,
  deleted_tracks     bigint,
  computed_at        timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE metrics.app_daily IS 'Daily Swayzio-Core snapshot — billing customers, track owners, live/deleted track counts.';

INSERT INTO ops.data_dictionary (schema_name, table_name, column_name, description) VALUES
  ('core',   'app_customer', '*', 'App billing_customers: owner_id ↔ stripe_customer_id ↔ email; authoritative cross-source link.'),
  ('metrics','app_daily',    '*', 'Daily Swayzio-Core snapshot — billing customers, track owners, live/deleted tracks.')
ON CONFLICT (schema_name, table_name, column_name) DO UPDATE SET description = EXCLUDED.description, updated_at = now();
