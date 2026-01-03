import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, RefreshCw, ChevronDown, User, ThumbsUp, CreditCard, Wallet } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RecentActivity, Activity } from "@/components/dashboard/recent-activity";
import { ChartSection } from "@/components/dashboard/charts";
import { formatCurrency } from "@/lib/utils";
import { AreaChartData } from "@/components/ui/area-chart";
import { PieChartData } from "@/components/ui/pie-chart";
import { KitNewsletter } from "@/components/newsletter/kit-newsletter";

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [timePeriod, setTimePeriod] = useState("30");

  const { data: dashboardData, isLoading } = useQuery<{
    totalCustomers: number;
    connectedCustomers: number;
    totalRevenue: number;
    activeSubscriptions: number;
  }>({
    queryKey: ["/api/dashboard", timePeriod],
  });

  const kpiData = [
    {
      title: "Total Customers",
      value: isLoading ? "-" : formatNumber(dashboardData?.totalCustomers || 5823),
      change: 12.5,
      icon: User,
    },
    {
      title: "Connected Customers",
      value: isLoading ? "-" : formatNumber(dashboardData?.connectedCustomers || 3427),
      change: 8.2,
      icon: ThumbsUp,
    },
    {
      title: "Total Revenue",
      value: isLoading ? "-" : formatCurrency(dashboardData?.totalRevenue || 278492),
      change: 15.3,
      icon: Wallet,
    },
    {
      title: "Active Subscriptions",
      value: isLoading ? "-" : formatNumber(dashboardData?.activeSubscriptions || 2589),
      change: 5.7,
      icon: CreditCard,
    },
  ];

  const revenueData: AreaChartData[] = [
    { name: "Jan", total: 24000, recurring: 18000 },
    { name: "Feb", total: 28000, recurring: 21000 },
    { name: "Mar", total: 30000, recurring: 24000 },
    { name: "Apr", total: 34000, recurring: 26000 },
    { name: "May", total: 38000, recurring: 29000 },
    { name: "Jun", total: 41000, recurring: 31000 },
    { name: "Jul", total: 44000, recurring: 34000 },
  ];

  const subscriptionData: PieChartData[] = [
    { name: "Enterprise Plan", value: 35 },
    { name: "Premium Plan", value: 25 },
    { name: "Standard Plan", value: 20 },
    { name: "Basic Plan", value: 15 },
    { name: "Free Tier", value: 5 },
  ];

  const recentActivities: Activity[] = [
    {
      id: "1",
      customerId: "1",
      customerName: "John Doe",
      customerEmail: "john.doe@example.com",
      type: "Payment Successful",
      timestamp: "2023-10-15T14:45:00Z",
      details: "Monthly subscription renewed for Enterprise Plan - $399.00",
    },
    {
      id: "2",
      customerId: "2",
      customerName: "Jane Smith",
      customerEmail: "jane.smith@example.com",
      type: "Subscription Updated",
      timestamp: "2023-10-15T11:30:00Z",
      details: "Upgraded from Premium Plan to Enterprise Plan",
    },
    {
      id: "3",
      customerId: "3",
      customerName: "Robert Johnson",
      customerEmail: "robert.johnson@example.com",
      type: "Contact Updated",
      timestamp: "2023-10-14T16:15:00Z",
      details: "Contact information updated in HubSpot",
    },
    {
      id: "4",
      customerId: "4",
      customerName: "Sarah Williams",
      customerEmail: "sarah.williams@example.com",
      type: "Payment Failed",
      timestamp: "2023-10-14T10:30:00Z",
      details: "Monthly subscription payment failed - $199.00",
    },
    {
      id: "5",
      customerId: "5",
      customerName: "Michael Brown",
      customerEmail: "michael.brown@example.com",
      type: "New Customer",
      timestamp: "2023-10-13T09:15:00Z",
      details: "New customer added to both HubSpot and Stripe",
    },
  ];

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
          <Button size="sm" data-testid="button-sync">
            <RefreshCw className="h-4 w-4 mr-1" />
            Sync
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((item, index) => (
          <KpiCard
            key={index}
            title={item.title}
            value={item.value}
            change={item.change}
            icon={item.icon}
            isLoading={isLoading}
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
              revenueData={revenueData}
              subscriptionData={subscriptionData}
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
