import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  iconBackground?: string;
  iconColor?: string;
  isLoading?: boolean;
  className?: string;
  accentColor?: "purple" | "success" | "warning" | "error" | "info";
  animationDelay?: number;
}

export function KpiCard({
  title,
  value,
  change,
  icon: Icon,
  isLoading = false,
  className,
  accentColor = "purple",
  animationDelay = 0,
}: KpiCardProps) {
  const isPositiveChange = change && change > 0;

  const accentColors = {
    purple: {
      bg: "bg-linear-purple/10",
      bgHover: "group-hover:bg-linear-purple/20",
      text: "text-linear-purple",
      glow: "group-hover:shadow-glow-purple/30",
      gradient: "from-linear-purple/10 via-transparent to-transparent",
    },
    success: {
      bg: "bg-linear-success/10",
      bgHover: "group-hover:bg-linear-success/20",
      text: "text-linear-success",
      glow: "group-hover:shadow-glow-success/30",
      gradient: "from-linear-success/10 via-transparent to-transparent",
    },
    warning: {
      bg: "bg-linear-warning/10",
      bgHover: "group-hover:bg-linear-warning/20",
      text: "text-linear-warning",
      glow: "",
      gradient: "from-linear-warning/10 via-transparent to-transparent",
    },
    error: {
      bg: "bg-linear-error/10",
      bgHover: "group-hover:bg-linear-error/20",
      text: "text-linear-error",
      glow: "",
      gradient: "from-linear-error/10 via-transparent to-transparent",
    },
    info: {
      bg: "bg-linear-info/10",
      bgHover: "group-hover:bg-linear-info/20",
      text: "text-linear-info",
      glow: "",
      gradient: "from-linear-info/10 via-transparent to-transparent",
    },
  };

  const accent = accentColors[accentColor];

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 ease-out",
        "hover:border-linear-purple/40 hover:shadow-linear-md hover:-translate-y-0.5",
        accent.glow,
        "animate-fade-in-up",
        className
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        accent.gradient
      )} />

      <CardContent className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <p className="text-[11px] font-medium text-linear-text-tertiary uppercase tracking-wider">
              {title}
            </p>
            {isLoading ? (
              <div className="h-9 w-28 skeleton-shimmer rounded-md mt-1.5" />
            ) : (
              <p className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-1">
                {value}
              </p>
            )}
            {!isLoading && change !== undefined && (
              <div className={cn(
                "flex items-center gap-1.5 mt-2 text-xs font-medium",
                isPositiveChange ? "text-linear-success" : "text-linear-error"
              )}>
                <div className={cn(
                  "flex items-center justify-center w-5 h-5 rounded-full",
                  isPositiveChange ? "bg-linear-success/10" : "bg-linear-error/10"
                )}>
                  {isPositiveChange ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                </div>
                <span className="font-semibold">{isPositiveChange ? "+" : ""}{change}%</span>
                <span className="text-linear-text-tertiary font-normal">vs last period</span>
              </div>
            )}
          </div>
          <div className={cn(
            "p-2.5 rounded-xl transition-all duration-300",
            accent.bg,
            accent.bgHover,
            accent.text
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface KpiGridProps {
  children: React.ReactNode;
  className?: string;
}

export function KpiGrid({ children, className }: KpiGridProps) {
  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
      className
    )}>
      {children}
    </div>
  );
}
