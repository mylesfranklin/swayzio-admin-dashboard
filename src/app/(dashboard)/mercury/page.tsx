import { MercuryClient } from "@/components/mercury/mercury-client";
import { getMercuryDashboard, type MercuryDashboard } from "@/server/os/mercury-dashboard";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export default async function MercuryPage() {
  let data: MercuryDashboard | null = null;
  let error: string | null = null;
  try {
    data = await getMercuryDashboard();
  } catch (e) {
    error = (e as Error).message;
  }
  return <MercuryClient data={data} error={error} />;
}
