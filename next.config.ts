import type { NextConfig } from "next";
import { withEve } from "eve/next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this repo (a stray lockfile in $HOME otherwise
  // confuses Turbopack's root inference).
  turbopack: {
    root: import.meta.dirname,
  },
  // Stripe / Drizzle / Neon are server-only Node packages — keep them external
  // so they aren't bundled into the edge/client graph.
  serverExternalPackages: ["stripe", "@neondatabase/serverless", "drizzle-orm"],
};

// Co-deploy the eve agent (agent/) inside this same Vercel project; eve routes
// (/eve/v1/*) are rewritten same-origin. See docs/PHASE-F-EVE.md.
export default withEve(nextConfig);
