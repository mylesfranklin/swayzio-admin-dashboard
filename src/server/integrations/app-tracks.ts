import { appDb } from "@/server/db/app";

/**
 * Track analytics from the Swayzio-Core app DB — the source of truth for upload
 * timing (HubSpot has no per-track timestamps). Real `tracks.created_at`,
 * excluding soft-deletes.
 */
export interface MonthlyUploads {
  month: string; // e.g. "Jun 26"
  uploaded: number;
}

export async function getTracksUploadedByMonth(): Promise<MonthlyUploads[]> {
  const sql = appDb();
  // gap-filled 12-month series so months with 0 uploads still render
  const rows = (await sql`
    SELECT to_char(m, 'Mon YY') AS month, coalesce(t.cnt, 0)::int AS uploaded
    FROM generate_series(
      date_trunc('month', now()) - interval '11 months',
      date_trunc('month', now()),
      interval '1 month'
    ) AS m
    LEFT JOIN (
      SELECT date_trunc('month', created_at) AS mm, count(*) AS cnt
      FROM tracks
      WHERE deleted_at IS NULL
        AND created_at >= date_trunc('month', now()) - interval '11 months'
      GROUP BY 1
    ) t ON t.mm = m
    ORDER BY m
  `) as Array<{ month: string; uploaded: number }>;
  return rows.map((r) => ({ month: r.month, uploaded: r.uploaded }));
}
