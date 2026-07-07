import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isClerkConfigured, isProd, assertAuthConfiguredInProd } from "@/lib/auth";

// Fail closed: never boot the brain unprotected in production.
assertAuthConfiguredInProd();

// Public surfaces: the auth flows and signature-verified webhooks.
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/cron(.*)", // secured by CRON_SECRET, not Clerk
  "/eve/v1(.*)", // the eve channel's own AuthFn (Clerk bearer, founders-only) is the boundary; health must stay probe-able
]);

// With keys → protect everything except public routes.
// Local dev without keys → pass through (open) so development isn't blocked.
const middleware =
  isClerkConfigured || isProd
    ? clerkMiddleware(async (auth, req) => {
        if (!isPublicRoute(req)) {
          await auth.protect();
        }
      })
    : () => NextResponse.next();

export default middleware;

export const config = {
  matcher: [
    // Skip Next internals, static files, and the eve agent routes (/eve/v1/*): the eve
    // channel's own AuthFn is that boundary, and clerkMiddleware 500s on non-Clerk bearer
    // tokens — it must not touch agent traffic at all.
    "/((?!_next|eve/v1|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|md)).*)",
    "/(api|trpc)(.*)",
    // Clerk handshake/auto-proxy path
    "/__clerk/(.*)",
  ],
};
