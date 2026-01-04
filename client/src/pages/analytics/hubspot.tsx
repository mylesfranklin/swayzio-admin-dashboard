import { useQuery } from "@tanstack/react-query";
import { MusicCatalogDashboard } from "@/components/integrations/music-catalog-dashboard";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function HubSpotAnalytics() {
  const { data: status, isLoading: statusLoading } = useQuery<{ connected: boolean; accountInfo?: any }>({
    queryKey: ["/api/hubspot/live/status"],
  });

  const { data: dashboard, isLoading: dashboardLoading, refetch } = useQuery<any>({
    queryKey: ["/api/hubspot/live/music-catalog"],
    enabled: status?.connected === true,
  });

  if (statusLoading) {
    return (
      <div className="space-y-6" data-testid="hubspot-analytics-loading">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!status?.connected) {
    return (
      <div className="space-y-6" data-testid="hubspot-analytics-disconnected">
        <div>
          <h1 className="text-2xl font-bold text-white">HubSpot Analytics</h1>
          <p className="text-linear-text-secondary mt-1">Music catalog user data and insights</p>
        </div>
        <Card className="bg-linear-card border-linear-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-linear-warning mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">HubSpot Not Connected</h3>
            <p className="text-linear-text-secondary text-center max-w-md mb-4">
              Connect your HubSpot account in Settings to view music catalog analytics.
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/settings'} data-testid="button-connect-hubspot">
              Go to Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="hubspot-analytics">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">HubSpot Analytics</h1>
          <p className="text-linear-text-secondary mt-1">Music catalog user data and insights</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          className="gap-2"
          data-testid="button-refresh-hubspot"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      {dashboardLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <MusicCatalogDashboard 
          totalUsers={dashboard?.totalUsers || 0}
          subscribedUsers={dashboard?.subscribedUsers || 0}
          signedToDeals={dashboard?.signedToDeals || 0}
          totalTracks={dashboard?.totalTracks || 0}
          taggedTracks={dashboard?.taggedTracks || 0}
          untaggedTracks={dashboard?.untaggedTracks || 0}
          catalogHealth={dashboard?.catalogHealth || 0}
          proDistribution={dashboard?.proDistribution || {}}
          subscribedContacts={dashboard?.subscribedContacts || []}
          unsubscribedContacts={dashboard?.unsubscribedContacts || []}
        />
      )}
    </div>
  );
}
