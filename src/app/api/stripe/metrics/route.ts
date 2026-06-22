import { NextResponse } from "next/server";
import { getStripeDashboard } from "@/server/integrations/stripe-dashboard";
import { requireFounder } from "@/lib/require-founder";

// Long budget for the cold-miss path (full Stripe pagination ~30s). Cached hits
// return instantly; on Vercel this runs on Fluid Compute.
export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireFounder();
  if (denied) return denied;
  try {
    const data = await getStripeDashboard();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[/api/stripe/metrics] error:", (err as Error).message);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
