import { NextResponse } from "next/server";
import { getHubspotDashboard } from "@/server/integrations/hubspot-dashboard";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getHubspotDashboard());
  } catch (err) {
    console.error("[/api/hubspot/metrics] error:", (err as Error).message);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
