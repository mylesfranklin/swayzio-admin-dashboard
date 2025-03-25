import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

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
  iconBackground = "bg-primary-100",
  iconColor = "text-primary-600",
  isLoading = false,
  className,
}: KpiCardProps) {
  const isPositiveChange = change && change > 0;

  return (
    <Card className={cn("overflow-hidden shadow hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1", className)}>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", iconBackground)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                {isLoading ? (
                  <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <div className="text-2xl font-semibold text-gray-900">
                    {value}
                  </div>
                )}
                {!isLoading && change && (
                  <div className={cn(
                    "ml-2 flex items-baseline text-sm font-semibold",
                    isPositiveChange ? "text-accent-600" : "text-destructive-600"
                  )}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      className={cn(
                        "self-center flex-shrink-0 h-4 w-4",
                        isPositiveChange ? "text-accent-500" : "text-destructive-500"
                      )}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d={isPositiveChange ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"}
                      />
                    </svg>
                    <span className="ml-1">{Math.abs(change)}%</span>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
