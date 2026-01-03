import { useQuery } from "@tanstack/react-query";
import { StripeDashboard } from "@/components/integrations/stripe-dashboard";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StripeAnalytics() {
  const { data: status, isLoading: statusLoading } = useQuery<{ connected: boolean; mode?: string }>({
    queryKey: ["/api/stripe/live/status"],
  });

  const { data: dashboard, isLoading: dashboardLoading, refetch } = useQuery<any>({
    queryKey: ["/api/stripe/live/dashboard"],
    enabled: status?.connected === true,
  });

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
          <p className="text-linear-text-secondary mt-1">Revenue, subscriptions, and payments</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          className="gap-2"
          data-testid="button-refresh-stripe"
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
        <StripeDashboard 
          stats={dashboard ? {
            revenue: dashboard.totalRevenue || 0,
            revenueGrowth: 0,
            mrr: dashboard.mrr || 0,
            mrrGrowth: 0,
            activeSubscriptions: dashboard.activeSubscriptions || 0,
            churnRate: 0,
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
          subscriptions={[]}
          revenueHistory={dashboard?.revenueByMonth?.map((m: any) => ({
            name: m.month,
            revenue: m.revenue,
            mrr: dashboard.mrr || 0,
          })) || []}
          planDistribution={dashboard?.subscriptionsByStatus ? 
            Object.entries(dashboard.subscriptionsByStatus).map(([name, value]) => ({ name, value: value as number })) : []}
        />
      )}
    </div>
  );
}
