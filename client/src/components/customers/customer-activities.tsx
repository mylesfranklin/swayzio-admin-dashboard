import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge-custom";
import { formatDateTime } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface CustomerActivitiesProps {
  customerId: string;
  hubspotId: string | null;
}

const CustomerActivities: React.FC<CustomerActivitiesProps> = ({ customerId, hubspotId }) => {
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ["/api/customers", customerId, "activities"],
    enabled: !!hubspotId,
  });

  if (!hubspotId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Customer Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-gray-500">
              No HubSpot ID associated with this customer. Activities are not available.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Customer Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Customer Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-destructive">Error loading activities. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Customer Activities</CardTitle>
      </CardHeader>
      <CardContent>
        {activities && activities.length > 0 ? (
          <div className="space-y-4 divide-y divide-gray-200">
            {activities.map((activity: Activity) => (
              <div key={activity.id} className="pt-4 first:pt-0">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center">
                    <StatusBadge status={activity.type} className="mr-2" />
                    <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDateTime(activity.timestamp)}
                  </span>
                </div>
                {activity.details && (
                  <p className="text-sm text-gray-500 mt-1">
                    {typeof activity.details === "string" 
                      ? activity.details 
                      : JSON.stringify(activity.details)}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-gray-500">No activities found for this customer.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerActivities;
