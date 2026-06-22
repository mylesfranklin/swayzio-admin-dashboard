import { cn, formatNumber } from "@/lib/utils";

/**
 * Ranked horizontal bar list (Tremor-style) — the clean way to show category
 * distributions: label left, value right, a subtle proportional fill behind.
 * No legend, no wasted space, reads well even with a dominant category.
 */
export function BarList({
  data,
  className,
  barClassName = "bg-brand/15",
}: {
  data: Array<{ label: string; value: number }>;
  className?: string;
  barClassName?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className={cn("space-y-1.5", className)}>
      {data.map((d) => (
        <div key={d.label} className="relative flex h-8 items-center justify-between gap-3 overflow-hidden rounded-md px-2.5">
          <div
            aria-hidden
            className={cn("absolute inset-y-0 left-0 rounded-md", barClassName)}
            style={{ width: `${Math.max((d.value / max) * 100, 1.5)}%` }}
          />
          <span className="relative z-10 truncate text-sm text-ink">{d.label}</span>
          <span className="relative z-10 shrink-0 text-sm font-medium tabular-nums text-ink-muted">{formatNumber(d.value)}</span>
        </div>
      ))}
    </div>
  );
}
