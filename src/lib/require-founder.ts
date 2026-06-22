import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { isClerkConfigured, isFounder } from "@/lib/auth";

/**
 * Server-side founder gate for API route handlers. The Clerk middleware only
 * guarantees a *signed-in* session — it does NOT check the founder allowlist, so
 * data routes must call this or they'd be readable by any authenticated account
 * (e.g. any swayzio.com Workspace user via Google SSO). Returns null when access
 * is allowed, or a 401/403 NextResponse to return immediately when not.
 *
 * Keyless local dev (isClerkConfigured=false) is allowed through, matching the
 * (dashboard) layout's behavior.
 */
export async function requireFounder(): Promise<NextResponse | null> {
  if (!isClerkConfigured) return null;
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isFounder(user.primaryEmailAddress?.emailAddress, user.publicMetadata?.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return null;
}
