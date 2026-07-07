import { SyncStatusClient } from "@/components/sync-status/sync-status-client";
import { getOsSyncStatus } from "@/server/os/dashboard";

export default async function SyncStatusPage() {
  const { health, quality, error } = await getOsSyncStatus();
  return <SyncStatusClient health={health} quality={quality} error={error} />;
}
