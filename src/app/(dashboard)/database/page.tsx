import { getDbStats, getCatalogIngestion, type DbStats, type MonthlyIngest } from "@/server/integrations/app-db-stats";
import { getOrCompute } from "@/server/cache";
import { DatabaseClient } from "@/components/database/database-client";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function DatabasePage() {
  let stats: DbStats | null = null;
  let ingestion: MonthlyIngest[] | null = null;
  let error: string | null = null;
  try {
    const [s, i] = await Promise.all([
      getOrCompute("appdb:stats", getDbStats, 60 * 1000).then((r) => r.data), // near-live
      getOrCompute("appdb:ingestion", getCatalogIngestion, 60 * 60 * 1000).then((r) => r.data),
    ]);
    stats = s;
    ingestion = i;
  } catch (e) {
    error = (e as Error).message;
  }
  return <DatabaseClient stats={stats} ingestion={ingestion} error={error} />;
}
