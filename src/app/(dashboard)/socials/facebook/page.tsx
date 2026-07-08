import { FacebookClient } from "@/components/socials/facebook-client";
import { getCachedFacebookDashboard, type FacebookDashboard } from "@/server/os/social-dashboard";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export default async function FacebookPage() {
  let data: FacebookDashboard | null = null;
  let error: string | null = null;
  try {
    data = await getCachedFacebookDashboard();
  } catch (e) {
    error = (e as Error).message;
  }
  return <FacebookClient data={data} error={error} />;
}
