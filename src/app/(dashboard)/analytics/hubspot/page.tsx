import { getHubspotDashboard, type HubspotDashboard } from "@/server/integrations/hubspot-dashboard";
import { getStripeDashboard } from "@/server/integrations/stripe-dashboard";
import { getTracksUploadedByMonth, type MonthlyUploads } from "@/server/integrations/app-tracks";
import { getOrCompute } from "@/server/cache";
import { HubspotClient } from "@/components/hubspot/hubspot-client";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export default async function HubspotAnalyticsPage() {
  let data: HubspotDashboard | null = null;
  let error: string | null = null;
  let payingSubscribers: number | null = null;
  let tracksUploaded: MonthlyUploads[] | null = null;
  try {
    // Stripe = source of truth for paying subs; app DB = source of truth for upload timing.
    const [hub, stripe, tracks] = await Promise.all([
      getHubspotDashboard(),
      getStripeDashboard().catch(() => null),
      getOrCompute("app:tracks-uploaded", getTracksUploadedByMonth, 60 * 60 * 1000)
        .then((r) => r.data)
        .catch(() => null),
    ]);
    data = hub;
    payingSubscribers = stripe?.payingSubscriptions ?? null;
    tracksUploaded = tracks;
  } catch (e) {
    error = (e as Error).message;
  }
  return <HubspotClient data={data} error={error} payingSubscribers={payingSubscribers} tracksUploaded={tracksUploaded} />;
}
