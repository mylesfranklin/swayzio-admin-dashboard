import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isClerkConfigured, isProd, assertAuthConfiguredInProd } from "@/lib/auth";

// Fail closed: never boot the brain unprotected in production.
assertAuthConfiguredInProd();

// Public surfaces: the sign-in flow and signature-verified webhooks.
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/api/webhooks(.*)"]);

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
    // Skip Next internals and static files, but always run on routes + API.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
