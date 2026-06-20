/**
 * Auth configuration — Clerk, founders-only.
 *
 * The dashboard is gated to Swayzio founders. Access is granted when the signed-in
 * user is either (a) listed in FOUNDER_EMAILS, or (b) has publicMetadata.role === "founder".
 *
 * Degradation rules (see docs/ARCHITECTURE.md §8):
 *   - Local dev WITHOUT Clerk keys → app runs open (so you can build before
 *     setting Clerk up). `isClerkConfigured` is false.
 *   - Production WITHOUT keys → FAIL CLOSED. `assertAuthConfiguredInProd()` throws
 *     at startup so the app can never ship unprotected.
 *   - Any environment WITH keys → full founders-only protection is active.
 */

// Drives rendering + gating decisions. Based on the publishable key so it
// resolves identically on the server and in the browser (the secret key is not
// exposed client-side).
export const isClerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);

export const isProd = process.env.NODE_ENV === "production";

/** Comma-separated allowlist, e.g. FOUNDER_EMAILS="myles@swayzio.com,co@swayzio.com" */
export const FOUNDER_EMAILS = (process.env.FOUNDER_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

/** Throw in production if Clerk isn't configured — never run the brain unprotected. */
export function assertAuthConfiguredInProd() {
  const fullyConfigured =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY;
  if (isProd && !fullyConfigured) {
    throw new Error(
      "Clerk is not configured in production. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY."
    );
  }
}

export function isFounder(
  email: string | null | undefined,
  role: unknown
): boolean {
  if (role === "founder") return true;
  if (email && FOUNDER_EMAILS.includes(email.toLowerCase())) return true;
  return false;
}
