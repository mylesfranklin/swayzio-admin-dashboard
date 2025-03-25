import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge-custom";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";
import { useNavigate } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

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

export function RecentActivity({
  activities,
  isLoading = false,
  className,
}: RecentActivityProps) {
  const navigate = useNavigate();

  return (
    <Card className={className}>
      <CardHeader className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
        <CardTitle className="text-lg font-medium text-gray-900">Recent Customer Activity</CardTitle>
        <Button
          onClick={() => navigate("/customers")}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          View All
        </Button>
      </CardHeader>
      <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
        {isLoading ? (
          // Loading skeletons
          Array(5)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="ml-4">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mt-2" />
              </div>
            ))
        ) : activities.length > 0 ? (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/customers/${activity.customerId}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 bg-gray-200">
                    <AvatarFallback>{getInitials(activity.customerName.split(' ')[0], activity.customerName.split(' ')[1])}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {activity.customerName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {activity.customerEmail}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <StatusBadge status={activity.type} />
                  <div className="mt-1 text-sm text-gray-500">
                    {formatRelativeTime(activity.timestamp)}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">{activity.details}</div>
            </div>
          ))
        ) : (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500 text-sm">No recent activities found.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
