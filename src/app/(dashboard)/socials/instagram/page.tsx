import { InstagramClient } from "@/components/socials/instagram-client";
import { getInstagramDashboard, type InstagramDashboard } from "@/server/os/social-dashboard";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export default async function InstagramPage() {
  let data: InstagramDashboard | null = null;
  let error: string | null = null;
  try {
    data = await getInstagramDashboard();
  } catch (e) {
    error = (e as Error).message;
  }
  return <InstagramClient data={data} error={error} />;
}
