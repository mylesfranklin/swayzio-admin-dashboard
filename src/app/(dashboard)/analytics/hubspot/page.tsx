import { getHubspotDashboard, type HubspotDashboard } from "@/server/integrations/hubspot-dashboard";
import { getStripeDashboard } from "@/server/integrations/stripe-dashboard";
import { HubspotClient } from "@/components/hubspot/hubspot-client";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export default async function HubspotAnalyticsPage() {
  let data: HubspotDashboard | null = null;
  let error: string | null = null;
  let payingSubscribers: number | null = null;
  try {
    // Stripe is the source of truth for paying subscribers; fetch alongside HubSpot.
    const [hub, stripe] = await Promise.all([
      getHubspotDashboard(),
      getStripeDashboard().catch(() => null),
    ]);
    data = hub;
    payingSubscribers = stripe?.payingSubscriptions ?? null;
  } catch (e) {
    error = (e as Error).message;
  }
  return <HubspotClient data={data} error={error} payingSubscribers={payingSubscribers} />;
}
