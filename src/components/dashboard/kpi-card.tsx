import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Accent = "brand" | "success" | "warning" | "error" | "info";

const accents: Record<Accent, { bg: string; text: string }> = {
  brand: { bg: "bg-brand/10 group-hover:bg-brand/20", text: "text-brand" },
  success: { bg: "bg-success/10 group-hover:bg-success/20", text: "text-success" },
  warning: { bg: "bg-warning/10 group-hover:bg-warning/20", text: "text-warning" },
  error: { bg: "bg-error/10 group-hover:bg-error/20", text: "text-error" },
  info: { bg: "bg-info/10 group-hover:bg-info/20", text: "text-info" },
};

export function KpiCard({
  title,
  value,
  change,
  icon: Icon,
  accent = "brand",
  animationDelay = 0,
}: {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  accent?: Accent;
  animationDelay?: number;
}) {
  const a = accents[accent];
  const positive = change !== undefined && change > 0;

  return (
    <div
      style={{ animationDelay: `${animationDelay}ms` }}
      className={cn(
        "stat-card group animate-[fadeInUp_0.3s_ease-out_forwards] rounded-box border border-line bg-base-200 p-5",
        "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-linear-md"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
            {title}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-ink md:text-3xl">{value}</p>
          {change !== undefined && (
            <div
              className={cn(
                "mt-2 flex items-center gap-1.5 text-xs font-medium",
                positive ? "text-success" : "text-error"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full",
                  positive ? "bg-success/10" : "bg-error/10"
                )}
              >
                {positive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
              </span>
              <span className="font-semibold">
                {positive ? "+" : ""}
                {change}%
              </span>
              <span className="font-normal text-ink-faint">vs last period</span>
            </div>
          )}
        </div>
        <div className={cn("rounded-xl p-2.5 transition-all duration-300", a.bg, a.text)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
