import { SuperFollowersClient } from "@/components/socials/super-followers-client";
import { getSuperFollowersDashboard, type SuperFollowersDashboard } from "@/server/os/social-dashboard";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export default async function SuperFollowersPage() {
  let data: SuperFollowersDashboard | null = null;
  let error: string | null = null;
  try {
    data = await getSuperFollowersDashboard();
  } catch (e) {
    error = (e as Error).message;
  }
  return <SuperFollowersClient data={data} error={error} />;
}
