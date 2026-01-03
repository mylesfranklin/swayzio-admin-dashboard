import { useQuery } from "@tanstack/react-query";
import { HubSpotDashboard } from "@/components/integrations/hubspot-dashboard";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function HubSpotAnalytics() {
  const { data: status, isLoading: statusLoading } = useQuery<{ connected: boolean; accountInfo?: any }>({
    queryKey: ["/api/hubspot/live/status"],
  });

  const { data: dashboard, isLoading: dashboardLoading, refetch } = useQuery<any>({
    queryKey: ["/api/hubspot/live/dashboard"],
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
          <p className="text-linear-text-secondary mt-1">CRM data, contacts, and deals</p>
        </div>
        <Card className="bg-linear-card border-linear-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-linear-warning mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">HubSpot Not Connected</h3>
            <p className="text-linear-text-secondary text-center max-w-md mb-4">
              Connect your HubSpot account in Settings to view CRM analytics.
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
          <p className="text-linear-text-secondary mt-1">CRM data, contacts, and deals</p>
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
        <HubSpotDashboard 
          stats={dashboard ? {
            totalContacts: dashboard.totalContacts || 0,
            contactsGrowth: 0,
            totalCompanies: dashboard.totalCompanies || 0,
            companiesGrowth: 0,
            openDeals: dashboard.openDeals || 0,
            dealValue: dashboard.totalDealValue || 0,
            emailsSent: 0,
            emailOpenRate: 0,
          } : undefined}
          contacts={dashboard?.recentContacts?.map((c: any) => ({
            id: c.id,
            name: `${c.firstname || ''} ${c.lastname || ''}`.trim() || c.email,
            email: c.email,
            company: c.company || '',
            stage: c.lifecyclestage || 'subscriber',
            lastActivity: c.lastmodifieddate || new Date().toISOString(),
          })) || []}
          deals={dashboard?.recentDeals?.map((d: any) => ({
            id: d.id,
            name: d.dealname,
            company: '',
            amount: d.amount || 0,
            stage: d.dealstage,
            probability: 50,
            closeDate: d.closedate || new Date().toISOString(),
          })) || []}
          pipelineData={dashboard?.dealsByStage ? 
            Object.entries(dashboard.dealsByStage).map(([stage, count]) => ({
              name: stage,
              value: count as number,
              count: count as number,
            })) : []}
          activityHistory={[
            { name: "Mon", emails: 45, calls: 12, meetings: 5 },
            { name: "Tue", emails: 52, calls: 18, meetings: 8 },
            { name: "Wed", emails: 38, calls: 15, meetings: 3 },
            { name: "Thu", emails: 61, calls: 22, meetings: 6 },
          ]}
        />
      )}
    </div>
  );
}
