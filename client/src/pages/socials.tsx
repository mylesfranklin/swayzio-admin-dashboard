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
  Users, 
  Share2, 
  DollarSign, 
  BarChart3,
  Heart,
  MessageSquare,
  Repeat2,
  Bookmark,
  Eye
} from "lucide-react";

// Mock data for now - would be replaced with actual API data
const mockSocialData = {
  overview: {
    totalFollowers: 123500,
    followerGrowth: 3.2,
    totalEngagement: 45670,
    engagementRate: 2.8,
    totalReach: 789000,
    reachGrowth: 5.1,
    totalImpressions: 1245000,
    impressionGrowth: 4.3
  },
  platforms: {
    instagram: {
      followers: 50000,
      growth: 2.3,
      engagement: 12500,
      engagementRate: 3.1,
      posts: 245,
      avgLikes: 1200,
      avgComments: 85
    },
    twitter: {
      followers: 28500,
      growth: 1.5,
      engagement: 8700,
      engagementRate: 1.9,
      tweets: 420,
      avgLikes: 320,
      avgRetweets: 45
    },
    facebook: {
      followers: 32000,
      growth: 0.8,
      engagement: 9500,
      engagementRate: 1.2,
      posts: 180,
      avgLikes: 380,
      avgComments: 65
    },
    linkedin: {
      followers: 12500,
      growth: 4.2,
      engagement: 3200,
      engagementRate: 2.5,
      posts: 120,
      avgLikes: 250,
      avgComments: 38
    },
    youtube: {
      subscribers: 8500,
      growth: 5.7,
      views: 325000,
      avgViews: 5600,
      videos: 58,
      avgLikes: 420,
      avgComments: 75
    }
  },
  advertising: {
    totalSpend: 125000,
    roiPercentage: 324,
    impressions: 8500000,
    clicks: 185000,
    ctr: 2.17,
    cpc: 0.68,
    conversions: 12800,
    conversionRate: 6.9,
    platforms: {
      instagram: 42000,
      facebook: 35000,
      twitter: 18000,
      linkedin: 22000,
      google: 8000
    },
    monthly: [
      { month: "Jan", spend: 9500, roi: 31000, ctr: 2.1 },
      { month: "Feb", spend: 10200, roi: 33500, ctr: 2.2 },
      { month: "Mar", spend: 9800, roi: 32000, ctr: 2.0 },
      { month: "Apr", spend: 10500, roi: 34000, ctr: 2.1 },
      { month: "May", spend: 11200, roi: 36500, ctr: 2.2 },
      { month: "Jun", spend: 12000, roi: 39000, ctr: 2.3 },
      { month: "Jul", spend: 12500, roi: 40500, ctr: 2.3 },
      { month: "Aug", spend: 13000, roi: 42000, ctr: 2.2 },
      { month: "Sep", spend: 12800, roi: 41500, ctr: 2.1 },
      { month: "Oct", spend: 12000, roi: 39000, ctr: 2.0 },
      { month: "Nov", spend: 11500, roi: 37000, ctr: 2.1 },
    ]
  },
  topPosts: [
    { 
      id: 1, 
      platform: "instagram", 
      date: "2023-11-15", 
      type: "carousel", 
      engagement: 3245,
      engagementRate: 6.5,
      likes: 2850,
      comments: 395,
      shares: 450,
      saves: 230,
      impressions: 62000,
      content: "New product launch - SyncMoney Premium Card 💳"
    },
    { 
      id: 2, 
      platform: "twitter", 
      date: "2023-11-10", 
      type: "text", 
      engagement: 1550,
      engagementRate: 5.4,
      likes: 920,
      comments: 230,
      retweets: 400,
      impressions: 28500,
      content: "Exciting news! We've just reached 50K happy customers! Thank you for your support 🎉"
    },
    { 
      id: 3, 
      platform: "facebook", 
      date: "2023-11-05", 
      type: "video", 
      engagement: 2100,
      engagementRate: 6.5,
      likes: 1250,
      comments: 350,
      shares: 500,
      views: 32000,
      impressions: 45000,
      content: "How SyncMoney helps you save $500/month"
    },
    { 
      id: 4, 
      platform: "linkedin", 
      date: "2023-11-02", 
      type: "article", 
      engagement: 1850,
      engagementRate: 8.2,
      likes: 1200,
      comments: 150,
      shares: 500,
      impressions: 22500,
      content: "SyncMoney named as Top Financial Innovation of 2023"
    },
    { 
      id: 5, 
      platform: "youtube", 
      date: "2023-10-28", 
      type: "video", 
      engagement: 2800,
      engagementRate: 7.0,
      likes: 1800,
      comments: 320,
      shares: 680,
      views: 42000,
      impressions: 65000,
      content: "SyncMoney App Walkthrough - Complete Guide"
    }
  ],
  adCampaigns: [
    {
      id: 1,
      name: "Holiday Special",
      platform: "instagram",
      status: "active",
      spend: 18500,
      impressions: 1250000,
      clicks: 36500,
      ctr: 2.92,
      cpc: 0.51,
      conversions: 3200,
      conversionRate: 8.8,
      roi: 54000
    },
    {
      id: 2,
      name: "App Install Campaign",
      platform: "facebook",
      status: "active",
      spend: 22000,
      impressions: 1650000,
      clicks: 42000,
      ctr: 2.55,
      cpc: 0.52,
      conversions: 3800,
      conversionRate: 9.0,
      roi: 65000
    },
    {
      id: 3,
      name: "Business Solutions",
      platform: "linkedin",
      status: "active",
      spend: 16500,
      impressions: 850000,
      clicks: 22000,
      ctr: 2.59,
      cpc: 0.75,
      conversions: 1800,
      conversionRate: 8.2,
      roi: 48000
    },
    {
      id: 4,
      name: "Retargeting Campaign",
      platform: "facebook",
      status: "paused",
      spend: 8500,
      impressions: 620000,
      clicks: 15000,
      ctr: 2.42,
      cpc: 0.57,
      conversions: 1200,
      conversionRate: 8.0,
      roi: 28000
    },
    {
      id: 5,
      name: "Brand Awareness",
      platform: "twitter",
      status: "completed",
      spend: 12000,
      impressions: 980000,
      clicks: 19500,
      ctr: 1.99,
      cpc: 0.62,
      conversions: 1100,
      conversionRate: 5.6,
      roi: 32000
    }
  ]
};

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
  
  // Simulate API call to fetch data
  const { data, isLoading } = useQuery({
    queryKey: ["socials", timeframe, activePlatform],
    queryFn: async () => {
      // In a real app, this would be an API call
      return mockSocialData;
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
            <CardHeader>
              <CardTitle>Active Ad Campaigns</CardTitle>
              <CardDescription>Currently running campaigns and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={adCampaignsColumns}
                data={data?.adCampaigns || []}
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
                data={data?.topPosts || []}
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
    </div>
  );
}