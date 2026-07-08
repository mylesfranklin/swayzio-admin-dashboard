import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tones = {
  brand: "bg-brand",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  neutral: "bg-ink-faint",
  info: "bg-info",
} as const;

export function MetricTile({
  label,
  value,
  detail,
  tone = "brand",
  icon,
  className,
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: keyof typeof tones;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-line bg-base-300/40 p-3.5 transition-colors hover:bg-base-300/70", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", tones[tone])} />
          <p className="truncate text-[0.6875rem] font-medium uppercase tracking-wider text-ink-faint">{label}</p>
        </div>
        {icon && <span className="text-ink-faint">{icon}</span>}
      </div>
      <p className="mt-2 text-xl font-bold leading-none tracking-tight text-ink">{value}</p>
      {detail && <p className="mt-1.5 line-clamp-2 text-xs text-ink-muted">{detail}</p>}
    </div>
  );
}
