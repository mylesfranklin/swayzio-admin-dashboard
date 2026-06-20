import type { NextConfig } from "next";

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

export default nextConfig;
