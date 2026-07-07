"use client";

import { AlertTriangle, CheckCircle2, Clock3, Database, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import type { DataQualityRow, SyncHealthRow } from "@/server/os/dashboard";

function statusTone(row: SyncHealthRow): "success" | "warning" | "error" | "info" {
  if (row.hasError || row.status !== "ok") return "error";
  if (row.stale8h) return "warning";
  return "success";
}

function statusIcon(row: SyncHealthRow) {
  if (row.hasError || row.status !== "ok") return <AlertTriangle className="h-4 w-4 text-error" />;
  if (row.stale8h) return <Clock3 className="h-4 w-4 text-warning" />;
  return <CheckCircle2 className="h-4 w-4 text-success" />;
}

export function SyncStatusClient({
  health,
  quality,
  error,
}: {
  health: SyncHealthRow[];
  quality: DataQualityRow[];
  error: string | null;
}) {
  const failing = health.filter((r) => r.hasError || r.status !== "ok").length;
  const stale = health.filter((r) => r.stale8h).length;
  const identityGaps = quality.reduce((sum, r) => sum + r.nullIdentityRows, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Sync Status</h1>
        <p className="mt-1 text-sm text-ink-muted">Neon OS freshness and data quality</p>
      </div>

      {error && (
        <div className="rounded-box border border-error/30 bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <RefreshCw className="h-4 w-4 text-ink-faint" />
            Feeds
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">{formatNumber(health.length)}</p>
          <p className="text-xs text-ink-faint">{failing} failing · {stale} stale</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <Database className="h-4 w-4 text-ink-faint" />
            Quality Checks
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">{formatNumber(quality.length)}</p>
          <p className="text-xs text-ink-faint">{formatNumber(identityGaps)} unresolved identity rows</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Healthy
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">{formatNumber(Math.max(health.length - failing - stale, 0))}</p>
          <p className="text-xs text-ink-faint">ok and fresh within 8h</p>
        </Card>
      </div>

      <Card>
        <div className="border-b border-line p-4">
          <h2 className="text-sm font-medium text-ink">Feed Freshness</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-2 font-medium">Source</th>
                <th className="px-4 py-2 font-medium">Entity</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Finished</th>
                <th className="px-4 py-2 font-medium">Rows</th>
                <th className="px-4 py-2 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody>
              {health.map((row) => (
                <tr key={`${row.source}:${row.entity}`} className="border-t border-line/60">
                  <td className="px-4 py-2 font-medium text-ink">{row.source}</td>
                  <td className="px-4 py-2 text-ink-muted">{row.entity}</td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center gap-2">
                      {statusIcon(row)}
                      <Badge tone={statusTone(row)}>{row.status}</Badge>
                    </span>
                  </td>
                  <td className="px-4 py-2 text-ink-muted">{row.finishedAt ? new Date(row.finishedAt).toLocaleString() : "—"}</td>
                  <td className="px-4 py-2 text-ink-muted">{formatNumber(row.rowsWritten)} / {formatNumber(row.rowsRead)}</td>
                  <td className="px-4 py-2 text-ink-muted">{row.durationMs == null ? "—" : `${Math.round(row.durationMs / 1000)}s`}</td>
                </tr>
              ))}
              {!health.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">No sync runs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="border-b border-line p-4">
          <h2 className="text-sm font-medium text-ink">Data Quality</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-2 font-medium">Check</th>
                <th className="px-4 py-2 font-medium">Source Rows</th>
                <th className="px-4 py-2 font-medium">Neon Rows</th>
                <th className="px-4 py-2 font-medium">Delta</th>
                <th className="px-4 py-2 font-medium">Identity Gap</th>
                <th className="px-4 py-2 font-medium">Email Gap</th>
              </tr>
            </thead>
            <tbody>
              {quality.map((row) => (
                <tr key={`${row.source}:${row.entity}`} className="border-t border-line/60">
                  <td className="px-4 py-2 font-medium text-ink">{row.source} / {row.entity}</td>
                  <td className="px-4 py-2 text-ink-muted">{formatNumber(row.sourceRows)}</td>
                  <td className="px-4 py-2 text-ink-muted">{formatNumber(row.neonRows)}</td>
                  <td className="px-4 py-2 text-ink-muted">{formatNumber(row.rowDelta)}</td>
                  <td className="px-4 py-2 text-ink-muted">{formatNumber(row.nullIdentityRows)} · {row.nullIdentityPct}%</td>
                  <td className="px-4 py-2 text-ink-muted">{formatNumber(row.nullEmailRows)} · {row.nullEmailPct}%</td>
                </tr>
              ))}
              {!quality.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">No quality checks found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
