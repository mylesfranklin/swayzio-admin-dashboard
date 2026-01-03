import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";

export interface Activity {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  type: string;
  timestamp: string;
  details: string;
}

interface RecentActivityProps {
  activities: Activity[];
  isLoading?: boolean;
  className?: string;
}

function getActivityBadgeVariant(type: string): "default" | "success" | "warning" | "destructive" | "info" | "secondary" {
  switch (type.toLowerCase()) {
    case "payment successful":
      return "success";
    case "payment failed":
      return "destructive";
    case "subscription updated":
      return "info";
    case "new customer":
      return "default";
    case "contact updated":
      return "secondary";
    default:
      return "secondary";
  }
}

export function RecentActivity({
  activities,
  isLoading = false,
  className,
}: RecentActivityProps) {
  const [_, navigate] = useLocation();

  return (
    <Card className={className}>
      <CardHeader className="p-4 border-b border-linear-border flex flex-row justify-between items-center">
        <CardTitle className="text-sm font-medium text-white">Recent Customer Activity</CardTitle>
        <Button
          onClick={() => navigate("/customers")}
          variant="ghost"
          size="sm"
          className="text-xs text-linear-text-secondary hover:text-white"
          data-testid="button-view-all-activity"
        >
          View All
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardHeader>
      <div className="divide-y divide-linear-border max-h-[400px] overflow-y-auto">
        {isLoading ? (
          Array(5)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full bg-linear-hover" />
                    <div>
                      <Skeleton className="h-4 w-28 mb-1.5 bg-linear-hover" />
                      <Skeleton className="h-3 w-20 bg-linear-hover" />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Skeleton className="h-5 w-20 bg-linear-hover rounded" />
                    <Skeleton className="h-3 w-14 bg-linear-hover" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full mt-2 bg-linear-hover" />
              </div>
            ))
        ) : activities.length > 0 ? (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="p-4 hover:bg-linear-hover cursor-pointer transition-colors duration-150"
              onClick={() => navigate(`/customers/${activity.customerId}`)}
              data-testid={`activity-row-${activity.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 bg-linear-border">
                    <AvatarFallback className="bg-linear-purple/20 text-linear-purple text-xs">
                      {getInitials(activity.customerName.split(' ')[0], activity.customerName.split(' ')[1])}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {activity.customerName}
                    </p>
                    <p className="text-xs text-linear-text-secondary">
                      {activity.customerEmail}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={getActivityBadgeVariant(activity.type)}>
                    {activity.type}
                  </Badge>
                  <p className="text-xs text-linear-text-tertiary">
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-linear-text-secondary">{activity.details}</p>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <p className="text-linear-text-secondary text-sm">No recent activities found.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
