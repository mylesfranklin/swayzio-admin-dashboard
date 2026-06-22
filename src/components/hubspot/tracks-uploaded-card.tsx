"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ColumnChart } from "@/components/charts/column-chart";
import { cn, formatNumber } from "@/lib/utils";
import type { MonthlyUploads } from "@/server/integrations/app-tracks";

const RANGES = [
  { label: "12M", n: 12 },
  { label: "6M", n: 6 },
  { label: "3M", n: 3 },
  { label: "1M", n: 1 },
];

export function TracksUploadedCard({ data }: { data: MonthlyUploads[] | null }) {
  const [n, setN] = useState(12);

  if (!data) {
    return (
      <Card className="flex h-full items-center justify-center p-5 text-sm text-ink-faint">
        Tracks data unavailable
      </Card>
    );
  }

  const months = data.slice(-n);
  const total = months.reduce((s, d) => s + d.uploaded, 0);

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-ink-muted">Tracks Uploaded</h3>
          <p className="mt-1 text-3xl font-bold tracking-tight text-ink">{formatNumber(total)}</p>
          <p className="text-xs text-ink-faint">uploaded in the last {n === 1 ? "month" : `${n} months`}</p>
        </div>
        <div className="inline-flex shrink-0 rounded-lg border border-line bg-base-200 p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setN(r.n)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                n === r.n ? "bg-base-300 text-ink" : "text-ink-faint hover:text-ink-muted"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <ColumnChart data={months.map((m) => ({ label: m.month, value: m.uploaded }))} label="Uploaded" />
    </Card>
  );
}
