import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Plus, RefreshCw } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RecentActivity, Activity } from "@/components/dashboard/recent-activity";
import { ChartSection } from "@/components/dashboard/charts";
import { User, ThumbsUp, CreditCard, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AreaChartData } from "@/components/ui/area-chart";
import { PieChartData } from "@/components/ui/pie-chart";
import { apiRequest } from "@/lib/queryClient";
import { KitNewsletter } from "@/components/newsletter/kit-newsletter";

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [timePeriod, setTimePeriod] = useState("30");

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard", timePeriod],
  });

  // KPI data
  const kpiData = [
    {
      title: "Total Customers",
      value: isLoading ? "-" : formatNumber(dashboardData?.totalCustomers || 5823),
      change: 12.5,
      icon: User,
      iconBackground: "bg-primary-100",
      iconColor: "text-primary-600",
    },
    {
      title: "Connected Customers",
      value: isLoading ? "-" : formatNumber(dashboardData?.connectedCustomers || 3427),
      change: 8.2,
      icon: ThumbsUp,
      iconBackground: "bg-accent-100",
      iconColor: "text-accent-600",
    },
    {
      title: "Total Revenue",
      value: isLoading ? "-" : formatCurrency(dashboardData?.totalRevenue || 278492),
      change: 15.3,
      icon: Wallet,
      iconBackground: "bg-secondary-100",
      iconColor: "text-secondary-600",
    },
    {
      title: "Active Subscriptions",
      value: isLoading ? "-" : formatNumber(dashboardData?.activeSubscriptions || 2589),
      change: 5.7,
      icon: CreditCard,
      iconBackground: "bg-amber-100",
      iconColor: "text-amber-800",
    },
  ];

  // Chart data
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

  // Recent activities data
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

  const handleTimePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimePeriod(e.target.value);
  };

  const handleSyncData = () => {
    // Trigger data synchronization
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor your key metrics and customer data at a glance
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <div className="relative">
            <select
              className="appearance-none block w-full bg-white border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
              value={timePeriod}
              onChange={handleTimePeriodChange}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Year to date</option>
              <option value="custom">Custom range</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={handleSyncData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Data
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {kpiData.map((item, index) => (
          <KpiCard
            key={index}
            title={item.title}
            value={item.value}
            change={item.change}
            icon={item.icon}
            iconBackground={item.iconBackground}
            iconColor={item.iconColor}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Dashboard Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent border-b-0">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 border-b-2 border-transparent px-1 py-4"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="subscriptions"
                className="data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 border-b-2 border-transparent px-1 py-4"
              >
                Subscriptions
              </TabsTrigger>
              <TabsTrigger
                value="revenue"
                className="data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 border-b-2 border-transparent px-1 py-4"
              >
                Revenue
              </TabsTrigger>
              <TabsTrigger
                value="integrations"
                className="data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 border-b-2 border-transparent px-1 py-4"
              >
                Integrations
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Charts */}
      <ChartSection
        revenueData={revenueData}
        subscriptionData={subscriptionData}
        isLoading={isLoading}
      />

      {/* Kit Newsletter Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Newsletter Analytics</h2>
        <KitNewsletter />
      </div>

      {/* Recent Customer Activity */}
      <RecentActivity activities={recentActivities} isLoading={isLoading} />
    </div>
  );
};

// Helper function to format numbers with commas
function formatNumber(num: number | string): string {
  if (typeof num === "string") return num;
  return new Intl.NumberFormat("en-US").format(num);
}

export default Dashboard;
