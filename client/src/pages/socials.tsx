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
  Image
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

  // Prepare data for charts
  const adSpendByPlatform = data ? Object.entries(data.advertising.platforms).map(([platform, spend]) => ({
    name: platform,
    value: spend as number
  })) : [];
  
  const platformFollowers = data ? Object.entries(data.platforms).map(([platform, stats]) => ({
    name: platform,
    value: platform === 'youtube' ? (stats as any).subscribers : (stats as any).followers
  })) : [];

  const adSpendChart = data ? data.advertising.monthly.map(item => ({
    name: item.month,
    spend: item.spend,
    roi: item.roi,
  })) : [];

  // Platform social stats
  const platformStats = data ? Object.entries(data.platforms).map(([platform, stats]) => ({
    platform,
    ...stats
  })) : [];

  // Top posts columns
  const topPostsColumns = [
    {
      accessorKey: "platform",
      header: "Platform",
      cell: ({ row }: any) => {
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
      cell: ({ row }: any) => new Date(row.getValue("date")).toLocaleDateString(),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }: any) => (
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
      cell: ({ row }: any) => `${row.getValue("engagementRate")}%`,
    },
    {
      accessorKey: "impressions",
      header: "Impressions",
      cell: ({ row }: any) => row.getValue("impressions").toLocaleString(),
    },
    {
      accessorKey: "content",
      header: "Content",
      cell: ({ row }: any) => (
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
      cell: ({ row }: any) => {
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
      cell: ({ row }: any) => {
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
      cell: ({ row }: any) => formatCurrency(row.getValue("spend")),
    },
    {
      accessorKey: "impressions",
      header: "Impressions",
      cell: ({ row }: any) => row.getValue("impressions").toLocaleString(),
    },
    {
      accessorKey: "clicks",
      header: "Clicks",
      cell: ({ row }: any) => row.getValue("clicks").toLocaleString(),
    },
    {
      accessorKey: "ctr",
      header: "CTR",
      cell: ({ row }: any) => `${row.getValue("ctr")}%`,
    },
    {
      accessorKey: "conversions",
      header: "Conv.",
      cell: ({ row }: any) => row.getValue("conversions").toLocaleString(),
    },
    {
      accessorKey: "roi",
      header: "ROI",
      cell: ({ row }: any) => formatCurrency(row.getValue("roi")),
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
                  { dataKey: "roi", stroke: "#16A34A", fill: "rgba(22, 163, 74, 0.1)", name: "ROI" }
                ]}
                valueFormatter={(value) => formatCurrency(value)}
                showXAxis={true}
                showYAxis={true}
                showGrid={true}
                showTooltip={true}
              />
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Platforms</CardTitle>
                <CardDescription>Based on engagement rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {platformStats.sort((a, b) => (b as any).engagementRate - (a as any).engagementRate).slice(0, 3).map((platform: any) => (
                    <div key={platform.platform} className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getPlatformIcon(platform.platform)}
                        <span className="ml-2 capitalize">{platform.platform}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-muted-foreground">
                          {platform.engagement.toLocaleString()} engagements
                        </div>
                        <Badge variant="secondary">{platform.engagementRate}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Advertising Performance</CardTitle>
                <CardDescription>Key metrics summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">CTR</p>
                    <p className="text-2xl font-bold">{data?.advertising.ctr}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Avg. CPC</p>
                    <p className="text-2xl font-bold">${data?.advertising.cpc}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Conversion Rate</p>
                    <p className="text-2xl font-bold">{data?.advertising.conversionRate}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">ROI</p>
                    <p className="text-2xl font-bold text-green-600">+{data?.advertising.roiPercentage}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-4">
          <div className="flex overflow-x-auto pb-2 mb-2">
            <div className="flex space-x-2">
              <Button 
                variant={activePlatform === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActivePlatform("all")}
              >
                All Platforms
              </Button>
              
              <Button 
                variant={activePlatform === "instagram" ? "default" : "outline"}
                size="sm"
                onClick={() => setActivePlatform("instagram")}
                className="flex items-center"
              >
                <Instagram className="h-4 w-4 mr-2" />
                Instagram
              </Button>
              
              <Button 
                variant={activePlatform === "facebook" ? "default" : "outline"}
                size="sm"
                onClick={() => setActivePlatform("facebook")}
                className="flex items-center"
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              
              <Button 
                variant={activePlatform === "twitter" ? "default" : "outline"}
                size="sm"
                onClick={() => setActivePlatform("twitter")}
                className="flex items-center"
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              
              <Button 
                variant={activePlatform === "linkedin" ? "default" : "outline"}
                size="sm"
                onClick={() => setActivePlatform("linkedin")}
                className="flex items-center"
              >
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              
              <Button 
                variant={activePlatform === "youtube" ? "default" : "outline"}
                size="sm"
                onClick={() => setActivePlatform("youtube")}
                className="flex items-center"
              >
                <Youtube className="h-4 w-4 mr-2" />
                YouTube
              </Button>
            </div>
          </div>
          
          {activePlatform === "all" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platformStats.map((platform: any) => (
                <Card key={platform.platform}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center text-lg">
                        {getPlatformIcon(platform.platform)}
                        <span className="ml-2 capitalize">{platform.platform}</span>
                      </CardTitle>
                      <Badge variant="outline" className="ml-2">
                        +{platform.growth}%
                      </Badge>
                    </div>
                    <CardDescription>
                      {platform.platform === 'youtube' ? 'Subscribers' : 'Followers'}: {platform.platform === 'youtube' ? platform.subscribers.toLocaleString() : platform.followers.toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Engagement</p>
                        <p className="text-sm font-medium">{platform.engagement.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Eng. Rate</p>
                        <p className="text-sm font-medium">{platform.engagementRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Posts</p>
                        <p className="text-sm font-medium">{platform.posts || platform.tweets || platform.videos}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg. Likes</p>
                        <p className="text-sm font-medium">{platform.avgLikes.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {activePlatform === "instagram" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center">
                        <Instagram className="h-5 w-5 mr-2" />
                        Instagram Performance
                      </CardTitle>
                      <CardDescription>@syncmoney • 50,000 followers</CardDescription>
                    </div>
                    <Badge variant="outline">+{data?.platforms.instagram.growth}%</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Followers</p>
                      <p className="text-2xl font-bold">{data?.platforms.instagram.followers.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Engagement Rate</p>
                      <p className="text-2xl font-bold">{data?.platforms.instagram.engagementRate}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Posts</p>
                      <p className="text-2xl font-bold">{data?.platforms.instagram.posts}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Avg. Likes</p>
                      <p className="text-2xl font-bold">{data?.platforms.instagram.avgLikes.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* More detailed Instagram stats would go here */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Breakdown</CardTitle>
                    <CardDescription>Distribution of user interactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PieChart 
                      data={[
                        { name: "Likes", value: 68 },
                        { name: "Comments", value: 14 },
                        { name: "Shares", value: 11 },
                        { name: "Saves", value: 7 }
                      ]}
                      height={250}
                      colors={["#E1306C", "#F56040", "#405DE6", "#5851DB"]}
                      valueFormatter={(value) => `${value}%`}
                      showLegend={true}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Content Type Performance</CardTitle>
                    <CardDescription>Engagement rate by content type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-[#E1306C] mr-2"></div>
                          <span>Carousel</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">6.8%</span>
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#E1306C] rounded-full" style={{ width: "68%" }}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-[#F56040] mr-2"></div>
                          <span>Reels</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">5.9%</span>
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#F56040] rounded-full" style={{ width: "59%" }}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-[#405DE6] mr-2"></div>
                          <span>Single Image</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">4.2%</span>
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#405DE6] rounded-full" style={{ width: "42%" }}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-[#5851DB] mr-2"></div>
                          <span>Stories</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">3.5%</span>
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#5851DB] rounded-full" style={{ width: "35%" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {(activePlatform !== "all" && activePlatform !== "instagram") && (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Detailed stats for {activePlatform} coming soon...</p>
            </div>
          )}
        </TabsContent>
        
        {/* Advertising Tab */}
        <TabsContent value="advertising" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Ad Spend Overview</CardTitle>
                <CardDescription>Total: {formatCurrency(data?.advertising.totalSpend || 0)}</CardDescription>
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
            
            <Card>
              <CardHeader>
                <CardTitle>Advertising Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-y-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Impressions</p>
                    <p className="text-2xl font-bold">{data?.advertising.impressions.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Clicks</p>
                    <p className="text-2xl font-bold">{data?.advertising.clicks.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">CTR</p>
                    <p className="text-2xl font-bold">{data?.advertising.ctr}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">CPC</p>
                    <p className="text-2xl font-bold">${data?.advertising.cpc}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Conversions</p>
                    <p className="text-2xl font-bold">{data?.advertising.conversions.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Conv. Rate</p>
                    <p className="text-2xl font-bold">{data?.advertising.conversionRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Monthly Ad Performance</CardTitle>
              <CardDescription>Spending and return on investment</CardDescription>
            </CardHeader>
            <CardContent>
              <AreaChart 
                data={adSpendChart}
                height={350}
                lines={[
                  { dataKey: "spend", stroke: "#6E56CF", fill: "rgba(110, 86, 207, 0.1)", name: "Ad Spend" },
                  { dataKey: "roi", stroke: "#16A34A", fill: "rgba(22, 163, 74, 0.1)", name: "ROI" }
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
                <CardTitle>Ad Campaigns</CardTitle>
                <CardDescription>View and filter advertising campaigns</CardDescription>
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
                searchableColumns={["name", "platform", "status"]}
                placeholder="Search campaigns..."
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Content Performance Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Posts</CardTitle>
              <CardDescription>Highest engagement across all platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={topPostsColumns}
                data={postsData || []}
                searchableColumns={["content", "platform", "type"]}
                placeholder="Search posts..."
              />
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Engagement by Content Type</CardTitle>
                <CardDescription>Average engagement rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-[#6E56CF] mr-2"></div>
                      <span>Video</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">6.5%</span>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#6E56CF] rounded-full" style={{ width: "65%" }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-[#E1306C] mr-2"></div>
                      <span>Carousel</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">5.8%</span>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#E1306C] rounded-full" style={{ width: "58%" }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-[#1DA1F2] mr-2"></div>
                      <span>Text</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">4.2%</span>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#1DA1F2] rounded-full" style={{ width: "42%" }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-[#0077B5] mr-2"></div>
                      <span>Article</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">3.9%</span>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0077B5] rounded-full" style={{ width: "39%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Best Posting Times</CardTitle>
                <CardDescription>Highest engagement by day and time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-[#6E56CF] mr-2"></div>
                      <span>Tuesday 6-8pm</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">7.2%</span>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#6E56CF] rounded-full" style={{ width: "72%" }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-[#E1306C] mr-2"></div>
                      <span>Wednesday 12-2pm</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">6.8%</span>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#E1306C] rounded-full" style={{ width: "68%" }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-[#1DA1F2] mr-2"></div>
                      <span>Friday 3-5pm</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">6.5%</span>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#1DA1F2] rounded-full" style={{ width: "65%" }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-[#0077B5] mr-2"></div>
                      <span>Sunday 7-9pm</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">5.9%</span>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0077B5] rounded-full" style={{ width: "59%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Content Calendar</CardTitle>
              <CardDescription>Upcoming and scheduled posts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">Content calendar coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Audience Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Audience Insights
              </CardTitle>
              <CardDescription>Demographic and audience data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Age Distribution</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">18-24</span>
                    <div className="w-full max-w-[180px] h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "22%" }}></div>
                    </div>
                    <span className="text-sm ml-2 w-8 text-right">22%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">25-34</span>
                    <div className="w-full max-w-[180px] h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "38%" }}></div>
                    </div>
                    <span className="text-sm ml-2 w-8 text-right">38%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">35-44</span>
                    <div className="w-full max-w-[180px] h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "24%" }}></div>
                    </div>
                    <span className="text-sm ml-2 w-8 text-right">24%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">45+</span>
                    <div className="w-full max-w-[180px] h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "16%" }}></div>
                    </div>
                    <span className="text-sm ml-2 w-8 text-right">16%</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Gender</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                        <span className="text-sm">Male</span>
                      </div>
                      <span className="text-sm font-medium">54%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-pink-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-pink-500 mr-2"></div>
                        <span className="text-sm">Female</span>
                      </div>
                      <span className="text-sm font-medium">46%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Top Locations</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">United States</span>
                    <Badge variant="outline">42%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">United Kingdom</span>
                    <Badge variant="outline">18%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Canada</span>
                    <Badge variant="outline">12%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Australia</span>
                    <Badge variant="outline">8%</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Column 2: Content Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                Content Performance
              </CardTitle>
              <CardDescription>Top performing content types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <Video className="h-4 w-4 mr-2 text-indigo-600" />
                    <h3 className="font-medium">Product Tutorials</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Avg. Engagement</p>
                      <p className="font-medium">6.8%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reach</p>
                      <p className="font-medium">42.5k</p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <Image className="h-4 w-4 mr-2 text-indigo-600" />
                    <h3 className="font-medium">Customer Stories</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Avg. Engagement</p>
                      <p className="font-medium">5.3%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reach</p>
                      <p className="font-medium">38.2k</p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <MessageSquare className="h-4 w-4 mr-2 text-indigo-600" />
                    <h3 className="font-medium">Financial Tips</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Avg. Engagement</p>
                      <p className="font-medium">4.9%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reach</p>
                      <p className="font-medium">35.7k</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-3">Optimal Posting Times</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-indigo-50 p-2 rounded-md text-center">
                    <p className="text-xs text-indigo-700">Tuesday</p>
                    <p className="font-medium text-sm">11am-1pm</p>
                  </div>
                  <div className="bg-indigo-50 p-2 rounded-md text-center">
                    <p className="text-xs text-indigo-700">Thursday</p>
                    <p className="font-medium text-sm">4pm-6pm</p>
                  </div>
                  <div className="bg-indigo-50 p-2 rounded-md text-center">
                    <p className="text-xs text-indigo-700">Sunday</p>
                    <p className="font-medium text-sm">6pm-8pm</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Column 3: Latest Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-violet-600" />
                Latest Posts
              </CardTitle>
              <CardDescription>Recent content performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {postsData?.slice(0, 3).map((post: any, index: number) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {getPlatformIcon(post.platform)}
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded ml-2 capitalize">{post.type}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-medium line-clamp-2 mb-2">{post.content}</p>
                    <div className="flex items-center text-xs text-muted-foreground space-x-3">
                      <div className="flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        <span>{post.likes.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        <span>{post.comments.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Share2 className="h-3 w-3 mr-1" />
                        <span>{post.shares ? post.shares.toLocaleString() : post.retweets?.toLocaleString() || "0"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-3 py-2 text-xs flex justify-between">
                    <span className="text-green-600 font-medium">{post.engagementRate}% engagement</span>
                    <span>{post.impressions.toLocaleString()} impressions</span>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full text-sm" size="sm">
                View All Posts
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Effectiveness</CardTitle>
              <CardDescription>Performance metrics for SyncMoney campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Cost per Acquisition</p>
                    <h3 className="text-2xl font-bold mt-1">$24.80</h3>
                    <div className="flex items-center mt-1 text-green-600 text-xs">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      <span>-12% from last month</span>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Click-through Rate</p>
                    <h3 className="text-2xl font-bold mt-1">3.2%</h3>
                    <div className="flex items-center mt-1 text-green-600 text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+0.5% from last month</span>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    <h3 className="text-2xl font-bold mt-1">8.7%</h3>
                    <div className="flex items-center mt-1 text-green-600 text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+1.2% from last month</span>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">ROAS</p>
                    <h3 className="text-2xl font-bold mt-1">4.3x</h3>
                    <div className="flex items-center mt-1 text-green-600 text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+0.7x from last month</span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-4">Campaign Performance Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-2 font-medium text-sm">Campaign</th>
                          <th className="text-left pb-2 font-medium text-sm">Platform</th>
                          <th className="text-left pb-2 font-medium text-sm">Budget</th>
                          <th className="text-left pb-2 font-medium text-sm">Impressions</th>
                          <th className="text-left pb-2 font-medium text-sm">Clicks</th>
                          <th className="text-left pb-2 font-medium text-sm">CTR</th>
                          <th className="text-left pb-2 font-medium text-sm">Conversions</th>
                          <th className="text-left pb-2 font-medium text-sm">Cost/Conv.</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 pr-4">Summer Promo</td>
                          <td className="py-3 pr-4">Instagram</td>
                          <td className="py-3 pr-4">$12,500</td>
                          <td className="py-3 pr-4">685,240</td>
                          <td className="py-3 pr-4">24,325</td>
                          <td className="py-3 pr-4">3.55%</td>
                          <td className="py-3 pr-4">1,825</td>
                          <td className="py-3 pr-4">$6.85</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 pr-4">App Install</td>
                          <td className="py-3 pr-4">Facebook</td>
                          <td className="py-3 pr-4">$18,750</td>
                          <td className="py-3 pr-4">1,254,600</td>
                          <td className="py-3 pr-4">38,540</td>
                          <td className="py-3 pr-4">3.07%</td>
                          <td className="py-3 pr-4">2,642</td>
                          <td className="py-3 pr-4">$7.10</td>
                        </tr>
                        <tr>
                          <td className="py-3 pr-4">Referral Program</td>
                          <td className="py-3 pr-4">Twitter</td>
                          <td className="py-3 pr-4">$8,250</td>
                          <td className="py-3 pr-4">520,125</td>
                          <td className="py-3 pr-4">15,285</td>
                          <td className="py-3 pr-4">2.94%</td>
                          <td className="py-3 pr-4">1,250</td>
                          <td className="py-3 pr-4">$6.60</td>
                        </tr>
                      </tbody>
                    </table>
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