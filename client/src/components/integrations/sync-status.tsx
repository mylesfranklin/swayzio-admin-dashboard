import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge-custom";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export interface SyncEvent {
  id: string;
  timestamp: string;
  status: "success" | "error" | "partial";
  customerIds?: string[];
  fullSync: boolean;
  operations: {
    type: string;
    status: "success" | "error" | "skipped";
    fields?: string[];
    error?: string;
  }[];
  errorCount?: number;
  errorMessage?: string;
}

interface SyncStatusProps {
  syncEvents: SyncEvent[];
  isLoading?: boolean;
}

export function SyncStatus({ syncEvents, isLoading = false }: SyncStatusProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-6" />
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
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
      </div>
    );
  }

  // Get the latest sync event
  const latestSyncEvent = syncEvents && syncEvents.length > 0 ? syncEvents[0] : null;

  // Calculate success rate
  const calcSuccessRate = (event: SyncEvent): number => {
    if (!event.operations || event.operations.length === 0) return 0;
    
    const successCount = event.operations.filter(op => op.status === "success").length;
    return Math.round((successCount / event.operations.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Sync Status</h2>
        <p className="text-gray-500 mt-1">
          Monitor the synchronization status between HubSpot and Stripe.
        </p>
      </div>
      
      {latestSyncEvent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Current Status</CardTitle>
            <CardDescription>
              Last sync attempt: {formatRelativeTime(latestSyncEvent.timestamp)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {latestSyncEvent.status === "success" ? (
                    <CheckCircle className="h-5 w-5 text-accent-600 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive-600 mr-2" />
                  )}
                  <span className="font-medium">
                    {latestSyncEvent.status === "success"
                      ? "Sync Completed Successfully"
                      : latestSyncEvent.status === "partial"
                      ? "Sync Completed with Warnings"
                      : "Sync Failed"}
                  </span>
                </div>
                <StatusBadge status={latestSyncEvent.status} />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-500">Success Rate</span>
                  <span className="text-sm font-medium">{calcSuccessRate(latestSyncEvent)}%</span>
                </div>
                <Progress value={calcSuccessRate(latestSyncEvent)} className="h-2" />
              </div>
              
              {latestSyncEvent.status !== "success" && latestSyncEvent.errorMessage && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Sync Issue Detected</AlertTitle>
                  <AlertDescription>{latestSyncEvent.errorMessage}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Sync History</CardTitle>
          <CardDescription>Recent synchronization attempts</CardDescription>
        </CardHeader>
        <CardContent>
          {syncEvents && syncEvents.length > 0 ? (
            <div className="space-y-4 divide-y divide-gray-200">
              {syncEvents.map((event) => (
                <div key={event.id} className="pt-4 first:pt-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center">
                      <StatusBadge status={event.status} className="mr-2" />
                      <span className="text-sm font-medium">
                        {event.fullSync ? "Full Sync" : "Partial Sync"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(event.timestamp)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500 mt-1">
                    {event.operations.length} operations performed
                    {event.errorCount ? ` with ${event.errorCount} errors` : ""}
                  </div>
                  
                  {event.customerIds && event.customerIds.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Affected {event.customerIds.length} customer(s)
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-gray-500">No sync history available.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
