import { useQuery, useMutation } from "@tanstack/react-query";
import { StripeDashboard } from "@/components/integrations/stripe-dashboard";
import { AlertTriangle, RefreshCw, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";

function formatLastUpdated(date: string | Date | null): string {
  if (!date) return 'Never';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
  return d.toLocaleDateString();
}

export default function StripeAnalytics() {
  const { data: status, isLoading: statusLoading } = useQuery<{ connected: boolean; mode?: string }>({
    queryKey: ["/api/stripe/live/status"],
  });

  const { data: dashboard, isLoading: dashboardLoading, isFetching, refetch } = useQuery<any>({
    queryKey: ["/api/stripe/live/dashboard"],
    enabled: status?.connected === true,
    staleTime: 5 * 60 * 1000,
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/cache/refresh/stripe');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stripe/live/dashboard"] });
    }
  });

  const cacheInfo = dashboard?._cache;
  const isStale = cacheInfo?.isStale;
  const lastUpdated = cacheInfo?.lastUpdated;
  const fromCache = cacheInfo?.fromCache;

  if (statusLoading) {
    return (
      <div className="space-y-6" data-testid="stripe-analytics-loading">
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
      <div className="space-y-6" data-testid="stripe-analytics-disconnected">
        <div>
          <h1 className="text-2xl font-bold text-white">Stripe Analytics</h1>
          <p className="text-linear-text-secondary mt-1">Revenue, subscriptions, and payments</p>
        </div>
        <Card className="bg-linear-card border-linear-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-linear-warning mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Stripe Not Connected</h3>
            <p className="text-linear-text-secondary text-center max-w-md mb-4">
              Connect your Stripe account in Settings to view payment analytics.
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/settings'} data-testid="button-connect-stripe">
              Go to Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="stripe-analytics">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Stripe Analytics</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-linear-text-secondary">Revenue, subscriptions, and payments</p>
            {lastUpdated && (
              <span className="flex items-center gap-1 text-xs text-linear-text-tertiary">
                <Clock className="h-3 w-3" />
                Updated {formatLastUpdated(lastUpdated)}
                {isStale && (
                  <span className="flex items-center gap-1 text-linear-warning ml-2">
                    <AlertCircle className="h-3 w-3" />
                    Refreshing...
                  </span>
                )}
                {fromCache && !isStale && (
                  <span className="text-linear-success ml-1">(cached)</span>
                )}
              </span>
            )}
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            if (!refreshMutation.isPending && !isFetching) {
              refreshMutation.mutate();
            }
          }}
          disabled={isFetching || refreshMutation.isPending}
          className="gap-2"
          data-testid="button-refresh-stripe"
        >
          <RefreshCw className={`h-4 w-4 ${(isFetching || refreshMutation.isPending) ? 'animate-spin' : ''}`} />
          {refreshMutation.isPending ? 'Refreshing...' : isFetching ? 'Loading...' : 'Refresh'}
        </Button>
      </div>
      
      {dashboardLoading && !dashboard ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <StripeDashboard 
          stats={dashboard ? {
            revenue: dashboard.totalRevenue || 0,
            mrr: dashboard.mrr || 0,
            activeSubscriptions: dashboard.activeSubscriptions || 0,
            churnRate: dashboard.churnRate || 0,
            avgRevenuePerUser: dashboard.totalCustomers > 0 ? (dashboard.totalRevenue || 0) / dashboard.totalCustomers : 0,
            totalCustomers: dashboard.totalCustomers || 0,
          } : undefined}
          transactions={dashboard?.recentPayments?.map((p: any) => ({
            id: p.id,
            customer: p.customerId || 'Unknown',
            amount: p.amount / 100,
            status: p.status === 'succeeded' ? 'paid' : p.status,
            type: 'payment',
            createdAt: new Date(p.created * 1000).toISOString(),
          })) || []}
          subscriptions={dashboard?.activeSubscriptionsList?.map((s: any) => ({
            id: s.id,
            customer: s.customer,
            plan: s.plan,
            amount: s.amount,
            status: s.status,
            nextBillingDate: s.nextBillingDate,
          })) || []}
          revenueHistory={dashboard?.revenueByMonth?.map((m: any) => ({
            name: m.month,
            revenue: m.revenue || 0,
            mrr: m.mrr || 0,
          })) || []}
          planDistribution={dashboard?.subscriptionsByPlan ? 
            Object.entries(dashboard.subscriptionsByPlan).map(([name, value]) => ({ name, value: value as number })) : []}
        />
      )}
    </div>
  );
}
