import { eveChannel } from "eve/channels/eve";
import { localDev, verifyOidc, extractBearerToken, ForbiddenError, type AuthFn } from "eve/channels/auth";

/**
 * Route auth for the agent's HTTP channel — the security boundary (hard rule #5).
 *
 * Ordered walk: localDev() opens the routes on localhost for `eve dev`; in production only a caller
 * presenting a verified Clerk session JWT that maps to a founder passes. Mirrors
 * src/lib/require-founder.ts at the agent boundary. The browser attaches the token via
 * useEveAgent({ headers: () => ({ authorization: `Bearer ${await getToken()}` }) }).
 *
 * OPEN ITEM (F1→prod, fail-closed until configured): set CLERK_JWT_ISSUER (the Clerk frontend-API
 * origin) and CLERK_JWT_AUDIENCE, and ensure the Clerk session token carries `email`/`role` and the
 * expected `aud` — likely via a Clerk JWT template — or resolve the founder via the Clerk Backend API
 * from the verified `sub`. Until both envs are set this entry SKIPS (returns null), so prod browser
 * traffic stays fail-closed (401) rather than silently mis-authenticating.
 */
function clerkFounder(): AuthFn<Request> {
  const issuer = process.env.CLERK_JWT_ISSUER;
  const audience = process.env.CLERK_JWT_AUDIENCE;
  const founders = (process.env.FOUNDER_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  return async (request) => {
    const token = extractBearerToken(request.headers.get("authorization"));
    if (!token || !issuer || !audience) return null; // not configured → skip (stays fail-closed)

    const result = await verifyOidc(token, { issuer, audiences: [audience] });
    if (!result.ok) return null;

    const attrs = (result.sessionAuth?.attributes ?? {}) as Record<string, unknown>;
    const email = typeof attrs.email === "string" ? attrs.email.toLowerCase() : undefined;
    const role = typeof attrs.role === "string" ? attrs.role : undefined;
    const isFounder = role === "founder" || (email !== undefined && founders.includes(email));

    if (!isFounder) throw new ForbiddenError({ message: "The Swayzio OS agent is founders-only." });
    return result.sessionAuth;
  };
}

// Custom providers ahead of catch-all fallbacks (0.19 docs: localDev() is the final
// fallback, and must never ship alone — it trusts the advertised hostname).
export default eveChannel({
  auth: [clerkFounder(), localDev()],
});
