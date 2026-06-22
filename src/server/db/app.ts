import { neon } from "@neondatabase/serverless";

/**
 * Read-only client for the Swayzio-Core app database (Neon project crimson-heart).
 * Connects with the `dashboard_ro` role (SELECT-only). Used for analytics the app
 * owns but HubSpot/Stripe don't (e.g. real per-track upload timing). Read-only;
 * never write through this client.
 */
export function appDb() {
  const url = process.env.SWAYZIO_APP_DATABASE_URL;
  if (!url) throw new Error("SWAYZIO_APP_DATABASE_URL is not set");
  return neon(url);
}
