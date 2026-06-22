import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Accent = "brand" | "success" | "warning" | "error" | "info";

const accents: Record<Accent, { tile: string; text: string; bar: string }> = {
  brand: { tile: "bg-brand/10 group-hover:bg-brand/20", text: "text-brand", bar: "bg-brand" },
  success: { tile: "bg-success/10 group-hover:bg-success/20", text: "text-success", bar: "bg-success" },
  warning: { tile: "bg-warning/10 group-hover:bg-warning/20", text: "text-warning", bar: "bg-warning" },
  error: { tile: "bg-error/10 group-hover:bg-error/20", text: "text-error", bar: "bg-error" },
  info: { tile: "bg-info/10 group-hover:bg-info/20", text: "text-info", bar: "bg-info" },
};

export function KpiCard({
  title,
  value,
  change,
  subtitle,
  icon: Icon,
  accent = "brand",
  animationDelay = 0,
  isLoading = false,
}: {
  title: string;
  value: string;
  change?: number;
  subtitle?: string;
  icon: LucideIcon;
  accent?: Accent;
  animationDelay?: number;
  isLoading?: boolean;
}) {
  const a = accents[accent];
  const positive = change !== undefined && change >= 0;

  return (
    <div
      style={{ animationDelay: `${animationDelay}ms` }}
      className={cn(
        "stat-card group relative animate-[fadeInUp_0.4s_ease-out_forwards] overflow-hidden rounded-box border border-line bg-base-200 p-5 opacity-0",
        "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-linear-md"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.6875rem] font-medium uppercase tracking-wider text-ink-faint">{title}</p>
          {isLoading ? (
            <div className="skeleton-shimmer mt-2 h-8 w-28 rounded-md" />
          ) : (
            <p className="mt-1.5 text-[1.75rem] font-bold leading-none tracking-tight text-ink">{value}</p>
          )}
          {!isLoading && change !== undefined && (
            <div className={cn("mt-2.5 flex items-center gap-1.5 text-xs font-medium", positive ? "text-success" : "text-error")}>
              <span className={cn("flex h-5 w-5 items-center justify-center rounded-full", positive ? "bg-success/10" : "bg-error/10")}>
                {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              </span>
              <span className="font-semibold">{positive ? "+" : ""}{change}%</span>
              <span className="font-normal text-ink-faint">vs last period</span>
            </div>
          )}
          {!isLoading && subtitle && change === undefined && (
            <p className="mt-2 text-[0.6875rem] text-ink-faint">{subtitle}</p>
          )}
        </div>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300", a.tile, a.text)}>
          <Icon className="h-[1.125rem] w-[1.125rem]" />
        </div>
      </div>
      {/* animated accent bar */}
      <span className={cn("absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 ease-out group-hover:w-full", a.bar)} />
    </div>
  );
}
