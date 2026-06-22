import { getHubspotDashboard, type HubspotDashboard } from "@/server/integrations/hubspot-dashboard";
import { HubspotClient } from "@/components/hubspot/hubspot-client";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export default async function HubspotAnalyticsPage() {
  let data: HubspotDashboard | null = null;
  let error: string | null = null;
  try {
    data = await getHubspotDashboard();
  } catch (e) {
    error = (e as Error).message;
  }
  return <HubspotClient data={data} error={error} />;
}
