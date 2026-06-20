import { getStripeDashboard, type StripeDashboard } from "@/server/integrations/stripe-dashboard";
import { StripeClient } from "@/components/stripe/stripe-client";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export default async function StripeAnalyticsPage() {
  let stripe: StripeDashboard | null = null;
  let error: string | null = null;
  try {
    stripe = await getStripeDashboard();
  } catch (e) {
    error = (e as Error).message;
  }
  return <StripeClient stripe={stripe} error={error} />;
}
