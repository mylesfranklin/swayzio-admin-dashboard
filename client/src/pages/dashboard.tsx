import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, RefreshCw, ChevronDown, User, Users, CreditCard, Wallet } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RecentActivity, Activity } from "@/components/dashboard/recent-activity";
import { ChartSection } from "@/components/dashboard/charts";
import { formatCurrency } from "@/lib/utils";
import { KitNewsletter } from "@/components/newsletter/kit-newsletter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LiveDashboardData {
  totalCustomers: number;
  connectedCustomers: number;
  totalRevenue: number;
  activeSubscriptions: number;
  mrr: number;
  totalSubscribers: number;
  bankBalance: number;
  subscribedUsers: number;
  revenueSubscriberData: Array<{ name: string; mrr: number; subscribers: number }>;
  recentActivity: Activity[];
  cacheStatus: {
    stripe: { cached: boolean; stale: boolean; updatedAt: string | null };
    hubspot: { cached: boolean; stale: boolean; updatedAt: string | null };
    kit: { cached: boolean; stale: boolean; updatedAt: string | null };
    mercury: { cached: boolean; stale: boolean; updatedAt: string | null };
  };
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [timePeriod, setTimePeriod] = useState("30");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: dashboardData, isLoading } = useQuery<LiveDashboardData>({
    queryKey: ["/api/dashboard/live"],
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refresh all integration caches
      await Promise.all([
        apiRequest('POST', '/api/cache/refresh/stripe'),
        apiRequest('POST', '/api/cache/refresh/hubspot'),
      ]);
      // Invalidate dashboard query to refetch
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard/live"] });
      toast({
        title: "Dashboard refreshed",
        description: "All data has been updated with the latest information.",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Some data could not be refreshed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const kpiData = [
    {
      title: "Stripe Customers",
      value: isLoading ? "-" : formatNumber(dashboardData?.totalCustomers || 0),
      change: 12.5,
      icon: User,
    },
    {
      title: "HubSpot Contacts",
      value: isLoading ? "-" : formatNumber(dashboardData?.connectedCustomers || 0),
      change: 8.2,
      icon: Users,
    },
    {
      title: "Monthly Revenue (MRR)",
      value: isLoading ? "-" : formatCurrency(dashboardData?.mrr || 0),
      change: 15.3,
      icon: Wallet,
    },
    {
      title: "Active Subscriptions",
      value: isLoading ? "-" : formatNumber(dashboardData?.activeSubscriptions || 0),
      change: 5.7,
      icon: CreditCard,
    },
  ];

  // Use live data from API or fallback to empty arrays
  const revenueSubscriberData = dashboardData?.revenueSubscriberData || [];
  const recentActivities: Activity[] = dashboardData?.recentActivity || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-linear-text-secondary">
            Monitor your key metrics and customer data
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2">
          <div className="relative">
            <select
              className="appearance-none h-8 pl-3 pr-8 text-sm bg-linear-card border border-linear-border text-white rounded focus:outline-none focus:ring-1 focus:ring-linear-purple cursor-pointer"
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              data-testid="select-time-period"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Year to date</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-linear-text-secondary" />
          </div>
          <Button variant="outline" size="sm" data-testid="button-export">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button 
            size="sm" 
            data-testid="button-sync"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Syncing...' : 'Sync'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((item, index) => (
          <KpiCard
            key={index}
            title={item.title}
            value={item.value}
            change={item.change}
            icon={item.icon}
            isLoading={isLoading}
            accentColor={index === 2 ? "success" : "purple"}
            animationDelay={index * 75}
          />
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions" data-testid="tab-subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="revenue" data-testid="tab-revenue">Revenue</TabsTrigger>
          <TabsTrigger value="integrations" data-testid="tab-integrations">Integrations</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="space-y-6 mt-4">
            <ChartSection
              revenueData={revenueSubscriberData}
              totalRevenue={dashboardData?.totalRevenue || 0}
              mrr={dashboardData?.mrr || 0}
              subscribedUsers={dashboardData?.subscribedUsers || 0}
              isLoading={isLoading}
            />
            
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Newsletter Analytics</h2>
              <KitNewsletter />
            </div>

            <RecentActivity activities={recentActivities} isLoading={isLoading} />
          </div>
        </TabsContent>
        <TabsContent value="subscriptions">
          <div className="mt-4 p-8 text-center text-linear-text-secondary">
            <p>Subscription analytics coming soon...</p>
          </div>
        </TabsContent>
        <TabsContent value="revenue">
          <div className="mt-4 p-8 text-center text-linear-text-secondary">
            <p>Revenue analytics coming soon...</p>
          </div>
        </TabsContent>
        <TabsContent value="integrations">
          <div className="mt-4 p-8 text-center text-linear-text-secondary">
            <p>Integration analytics coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

function formatNumber(num: number | string): string {
  if (typeof num === "string") return num;
  return new Intl.NumberFormat("en-US").format(num);
}

export default Dashboard;
