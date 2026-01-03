import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { SiHubspot, SiStripe, SiGithub, SiVercel, SiInstagram } from "react-icons/si";
import { Mail } from "lucide-react";
import { Link } from "wouter";

import { GitHubDashboard } from "@/components/integrations/github-dashboard";
import { VercelDashboard } from "@/components/integrations/vercel-dashboard";
import { SocialMetrics } from "@/components/integrations/social-metrics";
import { KitDashboard } from "@/components/integrations/kit-dashboard";
import { StripeDashboard } from "@/components/integrations/stripe-dashboard";
import { HubSpotDashboard } from "@/components/integrations/hubspot-dashboard";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  connected: boolean;
  lastSync?: string;
  settingsPath: string;
}

const integrations: Integration[] = [
  {
    id: "hubspot",
    name: "HubSpot",
    description: "CRM data, contacts, deals, and activities",
    icon: SiHubspot,
    connected: true,
    lastSync: "2 minutes ago",
    settingsPath: "/integrations/hubspot",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Payments, subscriptions, and invoices",
    icon: SiStripe,
    connected: true,
    lastSync: "5 minutes ago",
    settingsPath: "/integrations/stripe",
  },
  {
    id: "github",
    name: "GitHub",
    description: "Repositories, commits, and pull requests",
    icon: SiGithub,
    connected: false,
    settingsPath: "/settings",
  },
  {
    id: "vercel",
    name: "Vercel",
    description: "Deployments, analytics, and web vitals",
    icon: SiVercel,
    connected: false,
    settingsPath: "/settings",
  },
  {
    id: "social",
    name: "Social Media",
    description: "Instagram, YouTube, Facebook, Twitter, LinkedIn, TikTok",
    icon: SiInstagram,
    connected: true,
    lastSync: "10 minutes ago",
    settingsPath: "/settings",
  },
  {
    id: "kit",
    name: "Kit (ConvertKit)",
    description: "Email subscribers, broadcasts, and forms",
    icon: Mail,
    connected: true,
    lastSync: "1 minute ago",
    settingsPath: "/settings",
  },
];

const mockGitHubData = {
  stats: { totalCommits: 1247, totalPRs: 89, openIssues: 23, contributors: 8, commitsGrowth: 12, prsGrowth: 5 },
  commitHistory: [
    { name: "Mon", commits: 12 }, { name: "Tue", commits: 19 }, { name: "Wed", commits: 8 },
    { name: "Thu", commits: 15 }, { name: "Fri", commits: 22 }, { name: "Sat", commits: 5 }, { name: "Sun", commits: 3 },
  ],
  languageDistribution: [
    { name: "TypeScript", value: 65 }, { name: "JavaScript", value: 20 },
    { name: "CSS", value: 10 }, { name: "Other", value: 5 },
  ],
  pullRequests: [
    { id: 1, title: "Add user authentication flow", author: "john", status: "open", createdAt: new Date().toISOString(), reviewers: 2 },
    { id: 2, title: "Fix payment processing bug", author: "sarah", status: "merged", createdAt: new Date(Date.now() - 86400000).toISOString(), reviewers: 1 },
    { id: 3, title: "Update dashboard components", author: "mike", status: "open", createdAt: new Date(Date.now() - 172800000).toISOString(), reviewers: 3 },
  ],
};

const mockVercelData = {
  stats: { totalVisitors: 45230, pageViews: 128450, bounceRate: 42.3, avgDuration: "2:34", visitorsGrowth: 18, pageViewsGrowth: 24 },
  trafficData: [
    { name: "Mon", visitors: 1200, pageViews: 3400 }, { name: "Tue", visitors: 1450, pageViews: 4100 },
    { name: "Wed", visitors: 1100, pageViews: 3200 }, { name: "Thu", visitors: 1680, pageViews: 4800 },
    { name: "Fri", visitors: 1890, pageViews: 5200 }, { name: "Sat", visitors: 980, pageViews: 2800 },
    { name: "Sun", visitors: 750, pageViews: 2100 },
  ],
  webVitals: [
    { name: "LCP", value: 1.8, rating: "good" as const, target: 2.5 },
    { name: "FID", value: 45, rating: "good" as const, target: 100 },
    { name: "CLS", value: 0.08, rating: "good" as const, target: 0.1 },
    { name: "TTFB", value: 320, rating: "needs-improvement" as const, target: 200 },
  ],
  deployments: [
    { id: "1", name: "syncmoney-app", status: "ready" as const, url: "syncmoney.ai", createdAt: new Date().toISOString(), duration: 45 },
    { id: "2", name: "swayzio-dashboard", status: "ready" as const, url: "swayzio.com", createdAt: new Date(Date.now() - 3600000).toISOString(), duration: 38 },
    { id: "3", name: "api-service", status: "building" as const, url: "api.syncmoney.ai", createdAt: new Date(Date.now() - 7200000).toISOString(), duration: 0 },
  ],
};

const mockSocialData = {
  platforms: [
    { platform: "Instagram", followers: 52400, followersGrowth: 8.2, engagement: 4230, engagementRate: 4.8, reach: 128000, impressions: 456000 },
    { platform: "YouTube", followers: 12800, followersGrowth: 15.4, engagement: 890, engagementRate: 6.2, reach: 89000, impressions: 234000 },
    { platform: "Facebook", followers: 8900, followersGrowth: 2.1, engagement: 450, engagementRate: 3.1, reach: 34000, impressions: 98000 },
    { platform: "Twitter", followers: 6200, followersGrowth: -1.2, engagement: 320, engagementRate: 2.8, reach: 45000, impressions: 123000 },
    { platform: "LinkedIn", followers: 4500, followersGrowth: 5.6, engagement: 280, engagementRate: 4.2, reach: 28000, impressions: 67000 },
    { platform: "TikTok", followers: 28900, followersGrowth: 32.5, engagement: 8900, engagementRate: 12.4, reach: 234000, impressions: 890000 },
  ],
  followerHistory: [
    { name: "Jan", instagram: 48000, youtube: 10200, tiktok: 18000 },
    { name: "Feb", instagram: 49200, youtube: 10800, tiktok: 21000 },
    { name: "Mar", instagram: 50100, youtube: 11400, tiktok: 24500 },
    { name: "Apr", instagram: 51800, youtube: 12200, tiktok: 27200 },
    { name: "May", instagram: 52400, youtube: 12800, tiktok: 28900 },
  ],
};

const mockKitData = {
  stats: { 
    totalSubscribers: 12726, 
    newSubscribersToday: 97, 
    newSubscribers7Days: 908, 
    newSubscribers30Days: 2310,
    avgOpenRate: 42.3, 
    avgClickRate: 8.7, 
    subscriberGrowth: 22 
  },
  subscriberHistory: [
    { name: "Week 1", subscribers: 11200 }, { name: "Week 2", subscribers: 11650 },
    { name: "Week 3", subscribers: 12100 }, { name: "Week 4", subscribers: 12726 },
  ],
  broadcasts: [
    { id: "1", subject: "New features announcement", status: "sent", sentAt: new Date().toISOString(), recipients: 12400, openRate: 45.2, clickRate: 12.3 },
    { id: "2", subject: "Weekly digest", status: "sent", sentAt: new Date(Date.now() - 604800000).toISOString(), recipients: 11800, openRate: 38.6, clickRate: 6.8 },
  ],
  forms: [
    { id: "1", name: "Sync Money Meta (syncmoney.ai/ig)", subscribers: 4280, conversionRate: 32.4 },
    { id: "2", name: "Insta Bio Link Subscribers", subscribers: 3120, conversionRate: 28.1 },
    { id: "3", name: "Top 22 Libraries Offer", subscribers: 2890, conversionRate: 45.6 },
    { id: "4", name: "AudioMack in-app sign up flow", subscribers: 1540, conversionRate: 18.2 },
  ],
};

const mockStripeData = {
  stats: { revenue: 278492, revenueGrowth: 15.3, mrr: 24580, mrrGrowth: 8.2, activeSubscriptions: 342, churnRate: 2.1, avgRevenuePerUser: 72, totalCustomers: 1247 },
  revenueHistory: [
    { name: "Jan", revenue: 42000, mrr: 21000 }, { name: "Feb", revenue: 48000, mrr: 22100 },
    { name: "Mar", revenue: 52000, mrr: 22800 }, { name: "Apr", revenue: 61000, mrr: 23500 },
    { name: "May", revenue: 75492, mrr: 24580 },
  ],
  planDistribution: [
    { name: "Pro", value: 156 }, { name: "Business", value: 98 },
    { name: "Enterprise", value: 52 }, { name: "Starter", value: 36 },
  ],
  transactions: [
    { id: "1", customer: "Acme Corp", amount: 299, status: "paid", type: "subscription", createdAt: new Date().toISOString() },
    { id: "2", customer: "TechStart Inc", amount: 599, status: "paid", type: "subscription", createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "3", customer: "Global Media", amount: 1299, status: "pending", type: "invoice", createdAt: new Date(Date.now() - 172800000).toISOString() },
  ],
  subscriptions: [
    { id: "1", customer: "Acme Corp", plan: "Pro", amount: 99, status: "active", nextBillingDate: new Date(Date.now() + 2592000000).toISOString() },
    { id: "2", customer: "TechStart Inc", plan: "Business", amount: 299, status: "active", nextBillingDate: new Date(Date.now() + 1728000000).toISOString() },
  ],
};

const mockHubSpotData = {
  stats: { totalContacts: 4892, contactsGrowth: 12, totalCompanies: 847, companiesGrowth: 8, openDeals: 67, dealValue: 1247000, emailsSent: 12400, emailOpenRate: 34.2 },
  activityHistory: [
    { name: "Mon", emails: 45, calls: 12, meetings: 5 }, { name: "Tue", emails: 52, calls: 18, meetings: 8 },
    { name: "Wed", emails: 38, calls: 15, meetings: 3 }, { name: "Thu", emails: 61, calls: 22, meetings: 6 },
    { name: "Fri", emails: 48, calls: 14, meetings: 4 },
  ],
  pipelineData: [
    { name: "Qualified", value: 245000, count: 18 }, { name: "Proposal", value: 389000, count: 24 },
    { name: "Negotiation", value: 412000, count: 15 }, { name: "Closing", value: 201000, count: 10 },
  ],
  contacts: [
    { id: "1", name: "John Smith", email: "john@acme.com", company: "Acme Corp", stage: "qualified", lastActivity: new Date().toISOString() },
    { id: "2", name: "Sarah Johnson", email: "sarah@techstart.io", company: "TechStart", stage: "new", lastActivity: new Date(Date.now() - 86400000).toISOString() },
  ],
  deals: [
    { id: "1", name: "Enterprise Contract", company: "Acme Corp", amount: 125000, stage: "negotiation", probability: 75, closeDate: new Date(Date.now() + 604800000).toISOString() },
    { id: "2", name: "Annual Subscription", company: "TechStart", amount: 48000, stage: "proposal", probability: 50, closeDate: new Date(Date.now() + 1209600000).toISOString() },
  ],
};

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Integrations</h1>
          <p className="mt-1 text-sm text-linear-text-secondary">
            Connect and manage your business tools
          </p>
        </div>
        <Button variant="outline" size="sm" className="mt-4 md:mt-0">
          <RefreshCw className="h-4 w-4 mr-2" />
          Sync All
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hubspot">HubSpot</TabsTrigger>
          <TabsTrigger value="stripe">Stripe</TabsTrigger>
          <TabsTrigger value="github">GitHub</TabsTrigger>
          <TabsTrigger value="vercel">Vercel</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="kit">Kit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <Card key={integration.id} className="relative overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-linear-hover">
                          <Icon className="h-5 w-5 text-linear-text-secondary" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-medium text-white">
                            {integration.name}
                          </CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            {integration.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {integration.connected ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-linear-success" />
                            <span className="text-xs text-linear-success">Connected</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-linear-text-tertiary" />
                            <span className="text-xs text-linear-text-tertiary">Not connected</span>
                          </>
                        )}
                      </div>
                      <Link href={integration.settingsPath}>
                        <Button variant="ghost" size="sm" className="h-7">
                          <Settings className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                      </Link>
                    </div>
                    {integration.lastSync && (
                      <p className="text-xs text-linear-text-tertiary mt-2">
                        Last synced {integration.lastSync}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="hubspot" className="mt-4">
          <HubSpotDashboard 
            stats={mockHubSpotData.stats}
            contacts={mockHubSpotData.contacts}
            deals={mockHubSpotData.deals}
            pipelineData={mockHubSpotData.pipelineData}
            activityHistory={mockHubSpotData.activityHistory}
          />
        </TabsContent>

        <TabsContent value="stripe" className="mt-4">
          <StripeDashboard 
            stats={mockStripeData.stats}
            transactions={mockStripeData.transactions}
            subscriptions={mockStripeData.subscriptions}
            revenueHistory={mockStripeData.revenueHistory}
            planDistribution={mockStripeData.planDistribution}
          />
        </TabsContent>

        <TabsContent value="github" className="mt-4">
          <GitHubDashboard 
            stats={mockGitHubData.stats}
            commitHistory={mockGitHubData.commitHistory}
            languageDistribution={mockGitHubData.languageDistribution}
            pullRequests={mockGitHubData.pullRequests}
          />
        </TabsContent>

        <TabsContent value="vercel" className="mt-4">
          <VercelDashboard 
            stats={mockVercelData.stats}
            trafficData={mockVercelData.trafficData}
            webVitals={mockVercelData.webVitals}
            deployments={mockVercelData.deployments}
          />
        </TabsContent>

        <TabsContent value="social" className="mt-4">
          <SocialMetrics 
            platforms={mockSocialData.platforms}
            followerHistory={mockSocialData.followerHistory}
          />
        </TabsContent>

        <TabsContent value="kit" className="mt-4">
          <KitDashboard 
            stats={mockKitData.stats}
            broadcasts={mockKitData.broadcasts}
            forms={mockKitData.forms}
            subscriberHistory={mockKitData.subscriberHistory}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
