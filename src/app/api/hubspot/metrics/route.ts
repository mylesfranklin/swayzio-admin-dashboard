import { NextResponse } from "next/server";
import { getHubspotDashboard } from "@/server/integrations/hubspot-dashboard";
import { requireFounder } from "@/lib/require-founder";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireFounder();
  if (denied) return denied;
  try {
    return NextResponse.json(await getHubspotDashboard());
  } catch (err) {
    console.error("[/api/hubspot/metrics] error:", (err as Error).message);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
