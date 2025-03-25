import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart } from "@/components/ui/area-chart";
import { PieChart } from "@/components/ui/pie-chart";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  Linkedin, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Share2, 
  DollarSign, 
  BarChart3,
  Heart,
  MessageSquare,
  MessageCircle,
  Repeat2,
  Bookmark,
  Eye,
  Download,
  FileText,
  Video,
  Image as ImageIcon,
  Globe,
  LineChart,
  Link,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// Helper functions and component for the social media dashboard

// Helper function to get platform icon
const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "instagram":
      return <Instagram className="h-4 w-4 mr-1" />;
    case "facebook":
      return <Facebook className="h-4 w-4 mr-1" />;
    case "twitter":
      return <Twitter className="h-4 w-4 mr-1" />;
    case "linkedin":
      return <Linkedin className="h-4 w-4 mr-1" />;
    case "youtube":
      return <Youtube className="h-4 w-4 mr-1" />;
    default:
      return <Share2 className="h-4 w-4 mr-1" />;
  }
};

// Helper function to get platform color
const getPlatformColor = (platform: string) => {
  switch (platform) {
    case "instagram":
      return "#E1306C";
    case "facebook":
      return "#4267B2";
    case "twitter":
      return "#1DA1F2";
    case "linkedin":
      return "#0077B5";
    case "youtube":
      return "#FF0000";
    case "google":
      return "#4285F4";
    default:
      return "#6E56CF";
  }
};

export default function SocialsPage() {
  const [timeframe, setTimeframe] = useState("30days");
  const [activePlatform, setActivePlatform] = useState("all");
  const [campaignStatus, setCampaignStatus] = useState("all");
  const [selectedDomain, setSelectedDomain] = useState("syncmoney.ai");
  
  // Fetch social media data from API
  const { data, isLoading } = useQuery({
    queryKey: ["socials", timeframe, activePlatform],
    queryFn: async () => {
      const response = await fetch(`/api/social/data?timeframe=${timeframe}&platform=${activePlatform}`);
      if (!response.ok) {
        throw new Error('Failed to fetch social media data');
      }
      return response.json();
    }
  });
  
  // Fetch social media posts
  const { data: postsData } = useQuery({
    queryKey: ["social-posts", activePlatform],
    queryFn: async () => {
      const response = await fetch(`/api/social/posts?platform=${activePlatform}&limit=10`);
      if (!response.ok) {
        throw new Error('Failed to fetch social media posts');
      }
      return response.json();
    }
  });
  
  // Fetch ad campaigns
  const { data: campaignsData } = useQuery({
    queryKey: ["social-campaigns", campaignStatus],
    queryFn: async () => {
      const response = await fetch(`/api/social/campaigns?status=${campaignStatus}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ad campaigns');
      }
      return response.json();
    }
  });
  
  // Fetch SEO analytics
  const { data: seoData, isLoading: seoLoading } = useQuery({
    queryKey: ["seo-analytics", selectedDomain],
    queryFn: async () => {
      const response = await fetch(`/api/seo/analytics?domain=${selectedDomain}`);
      if (!response.ok) {
        throw new Error('Failed to fetch SEO analytics');
      }
      return response.json();
    }
  });

  // Prepare data for charts
  const adSpendByPlatform = data ? Object.entries(data.advertising.platforms).map(([platform, spend]) => ({
    name: platform,
    value: spend as number
  })) : [];
  
  const platformFollowers = data ? Object.entries(data.platforms).map(([platform, stats]) => ({
    name: platform,
    value: platform === 'youtube' ? (stats as any).subscribers : (stats as any).followers
  })) : [];

  const adSpendChart = data ? data.advertising.monthly.map((item: any) => ({
    name: item.month,
    spend: item.spend,
    roi: item.roi,
  })) : [];

  // Platform social stats
  const platformStats = data ? Object.entries(data.platforms).map(([platform, stats]) => ({
    platform,
    ...stats as object
  })) : [];

  // Top posts columns
  const topPostsColumns = [
    {
      accessorKey: "platform",
      header: "Platform",
      cell: ({ row }: { row: any }) => {
        const platform = row.getValue("platform");
        return (
          <div className="flex items-center">
            {getPlatformIcon(platform)}
            <span className="capitalize">{platform}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }: { row: any }) => new Date(row.getValue("date")).toLocaleDateString(),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }: { row: any }) => (
        <Badge variant="outline" className="capitalize">
          {row.getValue("type")}
        </Badge>
      ),
    },
    {
      accessorKey: "engagement",
      header: "Engagement",
    },
    {
      accessorKey: "engagementRate",
      header: "Eng. Rate",
      cell: ({ row }: { row: any }) => `${row.getValue("engagementRate")}%`,
    },
    {
      accessorKey: "impressions",
      header: "Impressions",
      cell: ({ row }: { row: any }) => row.getValue("impressions").toLocaleString(),
    },
    {
      accessorKey: "content",
      header: "Content",
      cell: ({ row }: { row: any }) => (
        <div className="max-w-[300px] truncate">{row.getValue("content")}</div>
      ),
    },
  ];

  // Ad campaign columns
  const adCampaignsColumns = [
    {
      accessorKey: "name",
      header: "Campaign Name",
    },
    {
      accessorKey: "platform",
      header: "Platform",
      cell: ({ row }: { row: any }) => {
        const platform = row.getValue("platform");
        return (
          <div className="flex items-center">
            {getPlatformIcon(platform)}
            <span className="capitalize">{platform}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: any }) => {
        const status = row.getValue("status");
        let variant: "default" | "outline" | "secondary" | "destructive" = "outline";
        
        switch (status) {
          case "active":
            variant = "default";
            break;
          case "paused":
            variant = "secondary";
            break;
          case "completed":
            variant = "outline";
            break;
        }
        
        return (
          <Badge variant={variant} className="capitalize">
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "spend",
      header: "Spend",
      cell: ({ row }: { row: any }) => formatCurrency(row.getValue("spend")),
    },
    {
      accessorKey: "impressions",
      header: "Impressions",
      cell: ({ row }: { row: any }) => row.getValue("impressions").toLocaleString(),
    },
    {
      accessorKey: "clicks",
      header: "Clicks",
      cell: ({ row }: { row: any }) => row.getValue("clicks").toLocaleString(),
    },
    {
      accessorKey: "ctr",
      header: "CTR",
      cell: ({ row }: { row: any }) => `${row.getValue("ctr")}%`,
    },
    {
      accessorKey: "conversions",
      header: "Conv.",
      cell: ({ row }: { row: any }) => row.getValue("conversions").toLocaleString(),
    },
    {
      accessorKey: "roi",
      header: "ROI",
      cell: ({ row }: { row: any }) => formatCurrency(row.getValue("roi")),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Media Dashboard</h1>
          <p className="text-muted-foreground">Track and analyze your social media performance and ad campaigns</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>
      
      {/* SyncMoney Featured Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="p-6 md:w-2/3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">
                Featured Brand
              </Badge>
              <h2 className="text-2xl font-bold text-blue-900">@syncmoney</h2>
            </div>
            <p className="text-blue-700 mt-2 mb-4">Our flagship financial service brand with the largest following across all platforms</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                <p className="text-sm text-blue-600 font-medium">Followers</p>
                <p className="text-2xl font-bold text-blue-900">{data?.platforms?.instagram?.followers?.toLocaleString() || "50,000"}</p>
                <p className="text-xs text-green-600">+{data?.platforms?.instagram?.growth || "2.3"}% growth</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                <p className="text-sm text-blue-600 font-medium">Eng. Rate</p>
                <p className="text-2xl font-bold text-blue-900">{data?.platforms?.instagram?.engagementRate || "3.1"}%</p>
                <p className="text-xs text-blue-600">Industry avg: 2.2%</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                <p className="text-sm text-blue-600 font-medium">Avg. Likes</p>
                <p className="text-2xl font-bold text-blue-900">{data?.platforms?.instagram?.avgLikes?.toLocaleString() || "1,200"}</p>
                <p className="text-xs text-blue-600">{data?.platforms?.instagram?.posts || "245"} posts</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                <p className="text-sm text-blue-600 font-medium">Ad Spend</p>
                <p className="text-2xl font-bold text-blue-900">${(data?.advertising?.platforms?.instagram / 1000).toFixed(1) || "42.0"}k</p>
                <p className="text-xs text-green-600">ROI: +{data?.advertising?.roiPercentage || "324"}%</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                View Analytics
              </Button>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                Create Campaign
              </Button>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 md:w-1/3 p-6 flex flex-col justify-center items-center text-white">
            <h3 className="text-xl font-medium">Recent Growth</h3>
            <div className="w-full h-36 mt-4">
              <div className="h-full w-full relative">
                {/* Simple animated growth chart */}
                <div className="absolute bottom-0 left-0 w-full h-1/2 flex items-end">
                  <div className="w-1/6 h-[30%] bg-white/20 rounded-t-sm mx-[2px] animate-pulse"></div>
                  <div className="w-1/6 h-[45%] bg-white/30 rounded-t-sm mx-[2px] animate-pulse"></div>
                  <div className="w-1/6 h-[40%] bg-white/30 rounded-t-sm mx-[2px] animate-pulse"></div>
                  <div className="w-1/6 h-[60%] bg-white/40 rounded-t-sm mx-[2px] animate-pulse"></div>
                  <div className="w-1/6 h-[75%] bg-white/60 rounded-t-sm mx-[2px] animate-pulse"></div>
                  <div className="w-1/6 h-[90%] bg-white/80 rounded-t-sm mx-[2px] animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-3xl font-bold">+{data?.platforms?.instagram?.growth || "2.3"}%</p>
              <p className="text-sm opacity-80">Monthly growth rate</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Followers"
          value={data?.overview.totalFollowers.toLocaleString() || "0"}
          change={data?.overview.followerGrowth || 0}
          icon={Users}
          iconBackground="bg-blue-100"
          iconColor="text-blue-600"
          isLoading={isLoading}
        />
        <KpiCard
          title="Total Engagement"
          value={data?.overview.totalEngagement.toLocaleString() || "0"}
          change={data?.overview.engagementRate || 0}
          icon={Heart}
          iconBackground="bg-pink-100"
          iconColor="text-pink-600"
          isLoading={isLoading}
        />
        <KpiCard
          title="Total Reach"
          value={data?.overview.totalReach.toLocaleString() || "0"}
          change={data?.overview.reachGrowth || 0}
          icon={Eye}
          iconBackground="bg-purple-100"
          iconColor="text-purple-600"
          isLoading={isLoading}
        />
        <KpiCard
          title="Ad Spend"
          value={formatCurrency(data?.advertising.totalSpend || 0)}
          change={data?.advertising.roiPercentage || 0}
          icon={DollarSign}
          iconBackground="bg-green-100"
          iconColor="text-green-600"
          isLoading={isLoading}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="advertising">Advertising</TabsTrigger>
          <TabsTrigger value="content">Content Performance</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Followers by Platform</CardTitle>
                <CardDescription>Distribution of followers across social platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart 
                  data={platformFollowers}
                  height={300}
                  colors={platformFollowers.map(item => getPlatformColor(item.name))}
                  showLegend={true}
                  showTooltip={true}
                  valueFormatter={(value) => value.toLocaleString()}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Ad Spend by Platform</CardTitle>
                <CardDescription>Distribution of advertising budget</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart 
                  data={adSpendByPlatform}
                  height={300}
                  colors={adSpendByPlatform.map(item => getPlatformColor(item.name))}
                  showLegend={true}
                  showTooltip={true}
                  valueFormatter={(value) => formatCurrency(value)}
                />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Ad Spend vs. ROI</CardTitle>
              <CardDescription>Monthly advertising performance</CardDescription>
            </CardHeader>
            <CardContent>
              <AreaChart 
                data={adSpendChart}
                height={350}
                lines={[
                  { dataKey: "spend", stroke: "#6E56CF", fill: "rgba(110, 86, 207, 0.1)", name: "Ad Spend" },
                  { dataKey: "roi", stroke: "#10B981", fill: "rgba(16, 185, 129, 0.1)", name: "ROI" }
                ]}
                valueFormatter={(value) => formatCurrency(value)}
                showXAxis={true}
                showYAxis={true}
                showGrid={true}
                showTooltip={true}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Top Performing Posts</CardTitle>
                <CardDescription>Recent posts with highest engagement</CardDescription>
              </div>
              <Select value={activePlatform} onValueChange={setActivePlatform}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All platforms</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={topPostsColumns} 
                data={postsData || []} 
                searchableColumns={["content", "platform"]}
                placeholder="Filter posts..."
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {platformStats.map((platformData: any) => (
              <Card key={platformData.platform}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(platformData.platform)}
                      <CardTitle className="capitalize">{platformData.platform}</CardTitle>
                    </div>
                    <Badge className="capitalize px-3 py-1" variant="outline" 
                      style={{ 
                        backgroundColor: `${getPlatformColor(platformData.platform)}10`,
                        color: getPlatformColor(platformData.platform),
                        borderColor: `${getPlatformColor(platformData.platform)}40` 
                      }}>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> 
                        +{platformData.growth}%
                      </span>
                    </Badge>
                  </div>
                  <CardDescription>
                    {platformData.platform === 'youtube' 
                      ? `${platformData.subscribers.toLocaleString()} subscribers, ${platformData.videos} videos` 
                      : `${platformData.followers.toLocaleString()} followers, ${platformData.posts} posts`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">Engagement Rate</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{platformData.engagementRate}%</span>
                        <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                          +{(platformData.engagementRate - 2.2).toFixed(1)}% vs. avg
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">Total Reach</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{platformData.reach?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">
                        {platformData.platform === 'youtube' ? 'Avg. Views' : 'Avg. Likes'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">
                          {platformData.platform === 'youtube' 
                            ? platformData.avgViews?.toLocaleString() 
                            : platformData.avgLikes?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ 
                        width: `${platformData.engagementRate * 20}%`,
                        backgroundColor: getPlatformColor(platformData.platform)
                      }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Advertising Tab */}
        <TabsContent value="advertising" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Ad Campaigns</CardTitle>
                <CardDescription>Performance metrics for all campaigns</CardDescription>
              </div>
              <Select value={campaignStatus} onValueChange={setCampaignStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All campaigns</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={adCampaignsColumns} 
                data={campaignsData || []} 
                searchableColumns={["name", "platform"]}
                placeholder="Search campaigns..."
              />
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Campaign ROI</CardTitle>
                <CardDescription>Return on investment by platform</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {Object.entries(data?.advertising.platforms || {}).map(([platform, spend]) => {
                    const roi = (spend as number) * 3.24; // Example ROI calculation
                    const roiPercent = 324; // Example ROI percentage
                    return (
                      <div key={platform}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(platform)}
                            <span className="capitalize">{platform}</span>
                          </div>
                          <span className="text-sm font-medium">
                            {formatCurrency(roi)}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full">
                          <div className="h-2 bg-green-500 rounded-full" style={{ width: `${Math.min(100, roiPercent / 5)}%` }}></div>
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                          <span>Spend: {formatCurrency(spend as number)}</span>
                          <span>ROI: +{roiPercent}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Key metrics comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 pr-4 text-left font-medium">Metric</th>
                          <th className="py-3 pr-4 text-left font-medium">Current</th>
                          <th className="py-3 pr-4 text-left font-medium">Previous</th>
                          <th className="py-3 pr-4 text-left font-medium">Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 pr-4 font-medium">Impressions</td>
                          <td className="py-3 pr-4">8.5M</td>
                          <td className="py-3 pr-4">7.2M</td>
                          <td className="py-3 pr-4 text-green-600">+18.1%</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 pr-4 font-medium">Clicks</td>
                          <td className="py-3 pr-4">185K</td>
                          <td className="py-3 pr-4">162K</td>
                          <td className="py-3 pr-4 text-green-600">+14.2%</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 pr-4 font-medium">CTR</td>
                          <td className="py-3 pr-4">2.17%</td>
                          <td className="py-3 pr-4">2.25%</td>
                          <td className="py-3 pr-4 text-red-600">-3.6%</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 pr-4 font-medium">Conversions</td>
                          <td className="py-3 pr-4">12.8K</td>
                          <td className="py-3 pr-4">10.5K</td>
                          <td className="py-3 pr-4 text-green-600">+21.9%</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 pr-4 font-medium">Conversion Rate</td>
                          <td className="py-3 pr-4">6.9%</td>
                          <td className="py-3 pr-4">6.5%</td>
                          <td className="py-3 pr-4 text-green-600">+6.2%</td>
                        </tr>
                        <tr>
                          <td className="py-3 pr-4 font-medium">CPC</td>
                          <td className="py-3 pr-4">$0.68</td>
                          <td className="py-3 pr-4">$0.72</td>
                          <td className="py-3 pr-4 text-green-600">-5.6%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Content Performance Tab */}
        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  Engagement
                </CardTitle>
                <CardDescription>Top content by engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {postsData?.slice(0, 5).map((post: any, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                        index === 0 ? "bg-yellow-500" : 
                        index === 1 ? "bg-gray-400" : 
                        index === 2 ? "bg-amber-700" : "bg-gray-300"
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          {getPlatformIcon(post.platform)}
                          <span className="text-xs text-muted-foreground capitalize">{post.platform}</span>
                          <span className="text-xs text-muted-foreground">• {new Date(post.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm font-medium line-clamp-2">{post.content}</p>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground gap-2">
                          <span className="flex items-center gap-0.5">
                            <Heart className="h-3 w-3 text-pink-500" /> {post.engagement.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <MessageSquare className="h-3 w-3 text-blue-500" /> {Math.round(post.engagement / 12).toLocaleString()}
                          </span>
                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                            {post.engagementRate}% rate
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-500" />
                  Reach
                </CardTitle>
                <CardDescription>Top content by impressions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {postsData?.slice(0, 5).sort((a: any, b: any) => b.impressions - a.impressions).map((post: any, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                        index === 0 ? "bg-yellow-500" : 
                        index === 1 ? "bg-gray-400" : 
                        index === 2 ? "bg-amber-700" : "bg-gray-300"
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          {getPlatformIcon(post.platform)}
                          <span className="text-xs text-muted-foreground capitalize">{post.platform}</span>
                          <span className="text-xs text-muted-foreground">• {new Date(post.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm font-medium line-clamp-2">{post.content}</p>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground gap-2">
                          <span className="flex items-center gap-0.5">
                            <Eye className="h-3 w-3 text-purple-500" /> {post.impressions.toLocaleString()}
                          </span>
                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                            {post.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Content Type
                </CardTitle>
                <CardDescription>Performance by content type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Image</span>
                      <span className="text-sm font-medium">3.4%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>62 posts</span>
                      <span>+12% vs video</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Video</span>
                      <span className="text-sm font-medium">3.0%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>45 posts</span>
                      <span>+8% vs text</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Carousel</span>
                      <span className="text-sm font-medium">4.1%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: "100%" }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>28 posts</span>
                      <span>+35% vs image</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Text</span>
                      <span className="text-sm font-medium">2.8%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: "65%" }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>85 posts</span>
                      <span>-18% vs image</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Link</span>
                      <span className="text-sm font-medium">2.4%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: "55%" }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>52 posts</span>
                      <span>-30% vs image</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* SEO Analytics Section */}
      <div className="mt-10 border-t pt-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">SEO Analytics</h2>
            <p className="text-muted-foreground">Search engine performance for our websites</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select website" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="syncmoney.ai">syncmoney.ai</SelectItem>
                <SelectItem value="swayzio.com">swayzio.com</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>
        
        {/* SEO Dashboard */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border rounded-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <img 
              src="https://cdn.replit.assets/attachments/2.png" 
              alt="SyncMoney Logo" 
              className="h-8 w-auto"
            />
            <h3 className="text-xl font-bold">{selectedDomain}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="border-green-100">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-green-600 text-xl font-bold mb-1">{seoData?.seoScore || 0}/100</div>
                  <div className="text-sm font-medium">SEO Score</div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${seoData?.seoScore || 0}%` }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-100">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-blue-600 text-xl font-bold mb-1">+{seoData?.organicTrafficGrowth || 0}%</div>
                  <div className="text-sm font-medium">Organic Traffic</div>
                  <div className="flex justify-center mt-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-indigo-100">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-indigo-600 text-xl font-bold mb-1">{seoData?.top10Keywords || 0}</div>
                  <div className="text-sm font-medium">Top 10 Keywords</div>
                  <div className="flex justify-center mt-2">
                    <TrendingUp className="h-5 w-5 text-indigo-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-purple-100">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-purple-600 text-xl font-bold mb-1">{seoData?.backlinks?.length || 0}</div>
                  <div className="text-sm font-medium">Backlinks</div>
                  <div className="flex justify-center mt-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-orange-100">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-orange-600 text-xl font-bold mb-1">{seoData?.pageLoadTime || 0}s</div>
                  <div className="text-sm font-medium">Page Load Time</div>
                  <div className="flex justify-center mt-2">
                    <TrendingDown className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Keywords</CardTitle>
              <CardDescription>Current keyword rankings in Google Search</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {seoData?.keywordRankings?.map((keyword: any, index: number) => (
                  <React.Fragment key={index}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="bg-green-100 text-green-800 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3">{keyword.position}</div>
                        <span>{keyword.keyword}</span>
                      </div>
                      <Badge className={
                        keyword.change > 0 ? "bg-green-100 text-green-800 hover:bg-green-200" : 
                        keyword.change < 0 ? "bg-red-100 text-red-800 hover:bg-red-200" : 
                        "bg-amber-100 text-amber-800 hover:bg-amber-200"
                      }>
                        {keyword.change > 0 ? `+${keyword.change} ↑` : 
                         keyword.change < 0 ? `${keyword.change} ↓` : 
                         `${keyword.change} ↔`}
                      </Badge>
                    </div>
                    {index < (seoData?.keywordRankings?.length - 1) && <Separator />}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Page Performance</CardTitle>
              <CardDescription>Top pages by organic traffic</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {seoData?.pagePerformance?.map((page: any, index: number) => (
                  <React.Fragment key={index}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{page.page}</div>
                        <div className="text-sm text-muted-foreground">{page.title}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{page.visitors.toLocaleString()}</div>
                        <div className={`text-xs ${page.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {page.change >= 0 ? '+' : ''}{page.change}%
                        </div>
                      </div>
                    </div>
                    {index < (seoData?.pagePerformance?.length - 1) && <Separator />}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Organic Traffic Trends</CardTitle>
              <CardDescription>Monthly visitors from search engines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {seoData?.organicTraffic ? (
                  <AreaChart 
                    data={seoData.organicTraffic}
                    height={320}
                    lines={[
                      { dataKey: "visitors", stroke: "#4f46e5", fill: "rgba(79, 70, 229, 0.1)", name: "Organic Visitors" }
                    ]}
                    valueFormatter={(value) => value.toLocaleString()}
                    showXAxis={true}
                    showYAxis={true}
                    showGrid={true}
                    showTooltip={true}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p>Loading chart data...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Technical SEO
              </CardTitle>
              <CardDescription>Site health check</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {seoData?.technicalSeo && Object.entries(seoData.technicalSeo).map(([key, value]: [string, any], index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center">
                      {value.status === "passed" ? (
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-600 mr-2" />
                      )}
                      <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                    <Badge variant="outline" className={value.status === "passed" ? "bg-green-50" : "bg-amber-50"}>
                      {value.status === "passed" ? "Passed" : `${value.issues} Issues`}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-purple-600" />
                Search Visibility
              </CardTitle>
              <CardDescription>Search engine presence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {seoData?.searchVisibility && Object.entries(seoData.searchVisibility).map(([engine, visibility]: [string, any], index: number) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm capitalize">{engine}</span>
                      <span className="text-sm font-medium">{visibility}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-purple-500 rounded-full" style={{ width: `${visibility}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5 text-blue-600" />
                Backlink Sources
              </CardTitle>
              <CardDescription>Top referring domains</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {seoData?.backlinks?.map((backlink: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-blue-600 mr-2"></div>
                      <span className="text-sm">{backlink.domain}</span>
                    </div>
                    <span className="text-sm font-medium">{backlink.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Detailed SyncMoney Section */}
      <div className="mt-10 border-t pt-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">SyncMoney Detailed Analytics</h2>
            <p className="text-muted-foreground">In-depth performance metrics for our flagship brand</p>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Audience Insights
              </CardTitle>
              <CardDescription>Demographics and audience growth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Age Distribution</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>18-24</span>
                        <span>23%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full">
                        <div className="h-2 bg-blue-500 rounded-full" style={{ width: "23%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>25-34</span>
                        <span>38%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full">
                        <div className="h-2 bg-blue-500 rounded-full" style={{ width: "38%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>35-44</span>
                        <span>26%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full">
                        <div className="h-2 bg-blue-500 rounded-full" style={{ width: "26%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>45+</span>
                        <span>13%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full">
                        <div className="h-2 bg-blue-500 rounded-full" style={{ width: "13%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Gender Distribution</h4>
                  <div className="flex items-center h-24">
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-700">58%</div>
                          <div className="text-xs text-gray-500">Male</div>
                        </div>
                      </div>
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="10" strokeDasharray="251.2" strokeDashoffset="105.5" transform="rotate(-90 50 50)" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                      <span>Male (58%)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-200 rounded-full mr-1"></div>
                      <span>Female (42%)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Geographic Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">United States</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">United Kingdom</span>
                    <span className="text-sm font-medium">18%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Canada</span>
                    <span className="text-sm font-medium">12%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Australia</span>
                    <span className="text-sm font-medium">8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Other</span>
                    <span className="text-sm font-medium">17%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                Content Performance
              </CardTitle>
              <CardDescription>Trending topics and content types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Top Performing Content Categories</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Personal Finance Tips</span>
                        <span>4.2% Engagement</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full">
                        <div className="h-2 bg-indigo-500 rounded-full" style={{ width: "84%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Investment Strategies</span>
                        <span>3.8% Engagement</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full">
                        <div className="h-2 bg-indigo-500 rounded-full" style={{ width: "76%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Financial News</span>
                        <span>3.5% Engagement</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full">
                        <div className="h-2 bg-indigo-500 rounded-full" style={{ width: "70%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Success Stories</span>
                        <span>4.7% Engagement</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full">
                        <div className="h-2 bg-indigo-500 rounded-full" style={{ width: "94%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Product Updates</span>
                        <span>3.2% Engagement</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full">
                        <div className="h-2 bg-indigo-500 rounded-full" style={{ width: "64%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Trending Hashtags</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">#PersonalFinance</Badge>
                    <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">#FinancialFreedom</Badge>
                    <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">#SyncMoney</Badge>
                    <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">#InvestingTips</Badge>
                    <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">#MoneyManagement</Badge>
                    <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">#FinTech</Badge>
                    <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">#BudgetingTips</Badge>
                    <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">#WealthBuilding</Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Posting Schedule Effectiveness</h4>
                  <div className="grid grid-cols-7 gap-1">
                    {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                      <div key={i} className="text-center">
                        <div className="text-xs font-medium mb-1">{day}</div>
                        <div className={`h-16 rounded-md ${
                          i === 1 || i === 3 ? "bg-indigo-600" : 
                          i === 0 || i === 4 ? "bg-indigo-500" : 
                          i === 2 ? "bg-indigo-400" : 
                          "bg-indigo-200"
                        }`}></div>
                        <div className="text-xs mt-1">
                          {i === 1 || i === 3 ? "4.2%" : 
                           i === 0 || i === 4 ? "3.8%" : 
                           i === 2 ? "3.2%" : 
                           "2.2%"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-pink-600" />
                Social Engagement
              </CardTitle>
              <CardDescription>User interactions and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-500" />
                    <span className="text-sm">Likes</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">42,385</div>
                    <div className="text-xs text-green-600">+18.2%</div>
                  </div>
                </div>
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Comments</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">8,754</div>
                    <div className="text-xs text-green-600">+12.7%</div>
                  </div>
                </div>
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Repeat2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Shares</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">6,321</div>
                    <div className="text-xs text-green-600">+24.3%</div>
                  </div>
                </div>
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">Saves</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">12,543</div>
                    <div className="text-xs text-green-600">+31.2%</div>
                  </div>
                </div>
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Profile Visits</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">28,965</div>
                    <div className="text-xs text-green-600">+15.8%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Campaign Performance
              </CardTitle>
              <CardDescription>Recent campaign metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <h4 className="text-sm font-medium">Product Launch Campaign</h4>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">Spend</div>
                      <div className="font-medium">$12,450</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">ROI</div>
                      <div className="font-medium text-green-600">325%</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mb-1">
                    <div className="h-1.5 rounded-full bg-green-500" style={{ width: "68%" }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>68% complete</span>
                    <span>8 days left</span>
                  </div>
                </div>
                <Separator />
                
                <div>
                  <div className="flex justify-between mb-2">
                    <h4 className="text-sm font-medium">Referral Program</h4>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">Spend</div>
                      <div className="font-medium">$8,750</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">ROI</div>
                      <div className="font-medium text-green-600">420%</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mb-1">
                    <div className="h-1.5 rounded-full bg-green-500" style={{ width: "42%" }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>42% complete</span>
                    <span>15 days left</span>
                  </div>
                </div>
                <Separator />
                
                <div>
                  <div className="flex justify-between mb-2">
                    <h4 className="text-sm font-medium">Q4 Brand Awareness</h4>
                    <Badge className="bg-gray-100 text-gray-800">Planned</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">Budget</div>
                      <div className="font-medium">$24,000</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">Expected ROI</div>
                      <div className="font-medium">280%</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mb-1">
                    <div className="h-1.5 rounded-full bg-gray-300" style={{ width: "0%" }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Starts in 2 weeks</span>
                    <span>30 day duration</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                Action Items
              </CardTitle>
              <CardDescription>Suggested improvements and tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <div className="min-w-5 mt-0.5">
                    <div className="w-4 h-4 rounded-full border-2 border-amber-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Increase posting frequency</h4>
                    <p className="text-xs text-gray-500 mt-1">Analysis shows optimal engagement with 5-7 posts per week, current average is 3.2</p>
                  </div>
                </div>
                
                <div className="flex gap-3 items-start">
                  <div className="min-w-5 mt-0.5">
                    <div className="w-4 h-4 rounded-full border-2 border-amber-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Improve carousel content</h4>
                    <p className="text-xs text-gray-500 mt-1">Carousel posts show 35% higher engagement; increase from current 12% to target 30% of content mix</p>
                  </div>
                </div>
                
                <div className="flex gap-3 items-start">
                  <div className="min-w-5 mt-0.5">
                    <div className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Increase video production</h4>
                    <p className="text-xs text-gray-500 mt-1">Video content engagement is growing monthly; invest in short-form educational content</p>
                  </div>
                </div>
                
                <div className="flex gap-3 items-start">
                  <div className="min-w-5 mt-0.5">
                    <div className="w-4 h-4 rounded-full border-2 border-red-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Improve response time</h4>
                    <p className="text-xs text-gray-500 mt-1">Current avg. response time of 5.2 hours should be reduced to under 2 hours</p>
                  </div>
                </div>
                
                <div className="flex gap-3 items-start">
                  <div className="min-w-5 mt-0.5">
                    <div className="w-4 h-4 rounded-full border-2 border-amber-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Amplify user testimonials</h4>
                    <p className="text-xs text-gray-500 mt-1">Success story content gets 4.7% engagement rate vs 3.5% average; increase frequency</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}