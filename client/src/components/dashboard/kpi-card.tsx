import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  iconBackground?: string;
  iconColor?: string;
  isLoading?: boolean;
  className?: string;
}

export function KpiCard({
  title,
  value,
  change,
  icon: Icon,
  isLoading = false,
  className,
}: KpiCardProps) {
  const isPositiveChange = change && change > 0;

  return (
    <Card className={cn("group hover:border-linear-purple/50 transition-all duration-150", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-linear-text-secondary uppercase tracking-wider">
              {title}
            </p>
            {isLoading ? (
              <div className="h-8 w-24 bg-linear-hover animate-pulse rounded mt-2"></div>
            ) : (
              <p className="text-2xl font-semibold text-white mt-1">
                {value}
              </p>
            )}
            {!isLoading && change !== undefined && (
              <div className={cn(
                "flex items-center gap-1 mt-2 text-xs font-medium",
                isPositiveChange ? "text-linear-success" : "text-linear-error"
              )}>
                {isPositiveChange ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{Math.abs(change)}%</span>
                <span className="text-linear-text-tertiary ml-1">vs last period</span>
              </div>
            )}
          </div>
          <div className="p-2 rounded-md bg-linear-purple/10 text-linear-purple group-hover:bg-linear-purple/20 transition-colors">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
