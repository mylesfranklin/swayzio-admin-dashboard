import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Settings as SettingsIcon,
  AlertCircle,
} from "lucide-react";
import { SiHubspot, SiStripe, SiGithub, SiVercel, SiInstagram } from "react-icons/si";
import { Mail } from "lucide-react";

import { GitHubDashboard } from "@/components/integrations/github-dashboard";
import { VercelDashboard } from "@/components/integrations/vercel-dashboard";
import { SocialMetrics } from "@/components/integrations/social-metrics";
import { KitDashboard } from "@/components/integrations/kit-dashboard";
import { StripeDashboard } from "@/components/integrations/stripe-dashboard";
import { HubSpotDashboard } from "@/components/integrations/hubspot-dashboard";

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
  ],
};

const mockVercelData = {
  stats: { totalVisitors: 45230, pageViews: 128450, bounceRate: 42.3, avgDuration: "2:34", visitorsGrowth: 18, pageViewsGrowth: 24 },
  trafficData: [
    { name: "Mon", visitors: 1200, pageViews: 3400 }, { name: "Tue", visitors: 1450, pageViews: 4100 },
    { name: "Wed", visitors: 1100, pageViews: 3200 }, { name: "Thu", visitors: 1680, pageViews: 4800 },
  ],
  webVitals: [
    { name: "LCP", value: 1.8, rating: "good" as const, target: 2.5 },
    { name: "FID", value: 45, rating: "good" as const, target: 100 },
  ],
  deployments: [
    { id: "1", name: "syncmoney-app", status: "ready" as const, url: "syncmoney.ai", createdAt: new Date().toISOString(), duration: 45 },
  ],
};

const mockSocialData = {
  platforms: [
    { platform: "Instagram", followers: 52400, followersGrowth: 8.2, engagement: 4230, engagementRate: 4.8, reach: 128000, impressions: 456000 },
    { platform: "YouTube", followers: 12800, followersGrowth: 15.4, engagement: 890, engagementRate: 6.2, reach: 89000, impressions: 234000 },
    { platform: "TikTok", followers: 28900, followersGrowth: 32.5, engagement: 8900, engagementRate: 12.4, reach: 234000, impressions: 890000 },
  ],
  followerHistory: [
    { name: "Jan", instagram: 48000, youtube: 10200, tiktok: 18000 },
    { name: "Feb", instagram: 49200, youtube: 10800, tiktok: 21000 },
    { name: "Mar", instagram: 52400, youtube: 12800, tiktok: 28900 },
  ],
};

const mockKitData = {
  stats: { 
    totalSubscribers: 12726, newSubscribersToday: 97, newSubscribers7Days: 908, newSubscribers30Days: 2310,
    avgOpenRate: 42.3, avgClickRate: 8.7, subscriberGrowth: 22 
  },
  subscriberHistory: [
    { name: "Week 1", subscribers: 11200 }, { name: "Week 2", subscribers: 11650 },
    { name: "Week 3", subscribers: 12100 }, { name: "Week 4", subscribers: 12726 },
  ],
  broadcasts: [
    { id: "1", subject: "New features announcement", status: "sent", sentAt: new Date().toISOString(), recipients: 12400, openRate: 45.2, clickRate: 12.3 },
  ],
  forms: [
    { id: "1", name: "Sync Money Meta (syncmoney.ai/ig)", subscribers: 4280, conversionRate: 32.4 },
  ],
};

const mockStripeData = {
  stats: { revenue: 278492, revenueGrowth: 15.3, mrr: 24580, mrrGrowth: 8.2, activeSubscriptions: 342, churnRate: 2.1, avgRevenuePerUser: 72, totalCustomers: 1247 },
  revenueHistory: [
    { name: "Jan", revenue: 42000, mrr: 21000 }, { name: "Feb", revenue: 48000, mrr: 22100 },
    { name: "Mar", revenue: 52000, mrr: 22800 }, { name: "Apr", revenue: 61000, mrr: 23500 },
  ],
  planDistribution: [
    { name: "Pro", value: 156 }, { name: "Business", value: 98 },
    { name: "Enterprise", value: 52 }, { name: "Starter", value: 36 },
  ],
  transactions: [
    { id: "1", customer: "Acme Corp", amount: 299, status: "paid", type: "subscription", createdAt: new Date().toISOString() },
  ],
  subscriptions: [
    { id: "1", customer: "Acme Corp", plan: "Pro", amount: 99, status: "active", nextBillingDate: new Date(Date.now() + 2592000000).toISOString() },
  ],
};

const mockHubSpotData = {
  stats: { totalContacts: 4892, contactsGrowth: 12, totalCompanies: 847, companiesGrowth: 8, openDeals: 67, dealValue: 1247000, emailsSent: 12400, emailOpenRate: 34.2 },
  activityHistory: [
    { name: "Mon", emails: 45, calls: 12, meetings: 5 }, { name: "Tue", emails: 52, calls: 18, meetings: 8 },
    { name: "Wed", emails: 38, calls: 15, meetings: 3 }, { name: "Thu", emails: 61, calls: 22, meetings: 6 },
  ],
  pipelineData: [
    { name: "Qualified", value: 245000, count: 18 }, { name: "Proposal", value: 389000, count: 24 },
    { name: "Negotiation", value: 412000, count: 15 }, { name: "Closing", value: 201000, count: 10 },
  ],
  contacts: [
    { id: "1", name: "John Smith", email: "john@acme.com", company: "Acme Corp", stage: "qualified", lastActivity: new Date().toISOString() },
  ],
  deals: [
    { id: "1", name: "Enterprise Contract", company: "Acme Corp", amount: 125000, stage: "negotiation", probability: 75, closeDate: new Date(Date.now() + 604800000).toISOString() },
  ],
};

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  connected: boolean;
  lastSync?: string;
}

const Settings: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [activeIntegration, setActiveIntegration] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch live integration status
  const { data: hubspotStatus } = useQuery<{ connected: boolean }>({
    queryKey: ["/api/hubspot/live/status"],
  });

  const { data: stripeStatus } = useQuery<{ connected: boolean }>({
    queryKey: ["/api/stripe/live/status"],
  });

  const { data: hubspotDashboard, isLoading: hubspotLoading, refetch: refetchHubspot } = useQuery<any>({
    queryKey: ["/api/hubspot/live/dashboard"],
    enabled: hubspotStatus?.connected === true && activeIntegration === "hubspot",
  });

  const { data: stripeDashboard, isLoading: stripeLoading, refetch: refetchStripe } = useQuery<any>({
    queryKey: ["/api/stripe/live/dashboard"],
    enabled: stripeStatus?.connected === true && activeIntegration === "stripe",
  });

  const integrations: Integration[] = [
    { id: "hubspot", name: "HubSpot", description: "CRM data, contacts, deals", icon: SiHubspot, connected: hubspotStatus?.connected || false, lastSync: hubspotStatus?.connected ? "Just now" : undefined },
    { id: "stripe", name: "Stripe", description: "Payments, subscriptions", icon: SiStripe, connected: stripeStatus?.connected || false, lastSync: stripeStatus?.connected ? "Just now" : undefined },
    { id: "github", name: "GitHub", description: "Repositories, commits", icon: SiGithub, connected: false },
    { id: "vercel", name: "Vercel", description: "Deployments, analytics", icon: SiVercel, connected: false },
    { id: "social", name: "Social Media", description: "Instagram, YouTube, TikTok", icon: SiInstagram, connected: true, lastSync: "10 minutes ago" },
    { id: "kit", name: "Kit Newsletter", description: "Email subscribers", icon: Mail, connected: true, lastSync: "1 minute ago" },
  ];

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      await Promise.all([refetchHubspot(), refetchStripe()]);
      toast({ title: "Sync Complete", description: "All integrations have been synced." });
    } finally {
      setIsSyncing(false);
    }
  };
  
  const { data: settings, isLoading } = useQuery<{
    applicationName?: string;
    dateFormat?: string;
    timeFormat?: string;
    timezone?: string;
    defaultCurrency?: string;
    autoSync?: boolean;
    syncFrequency?: number;
    conflictResolution?: string;
    emailNotifications?: boolean;
    syncFailures?: boolean;
    newCustomers?: boolean;
    paymentFailures?: boolean;
    subscriptionChanges?: boolean;
    emailAddress?: string;
  }>({
    queryKey: ["/api/settings"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: any) => {
      return await apiRequest("PATCH", "/api/settings", updatedSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings Updated",
        description: "Your settings have been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update settings.",
        variant: "destructive",
      });
    },
  });

  // Form state for general settings
  const [generalSettings, setGeneralSettings] = useState({
    applicationName: "",
    dateFormat: "MM/dd/yyyy",
    timeFormat: "12h",
    timezone: "UTC",
    defaultCurrency: "USD"
  });
  
  // Form state for sync settings
  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    syncFrequency: 30,
    conflictResolution: "hubspot"
  });
  
  // Form state for notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    syncFailures: true,
    newCustomers: true,
    paymentFailures: true,
    subscriptionChanges: true,
    emailAddress: ""
  });

  // Update local state when settings are loaded
  React.useEffect(() => {
    if (settings) {
      setGeneralSettings({
        applicationName: settings.applicationName || "Swayzio Admin",
        dateFormat: settings.dateFormat || "MM/dd/yyyy",
        timeFormat: settings.timeFormat || "12h",
        timezone: settings.timezone || "UTC",
        defaultCurrency: settings.defaultCurrency || "USD"
      });
      
      setSyncSettings({
        autoSync: settings.autoSync !== undefined ? settings.autoSync : true,
        syncFrequency: settings.syncFrequency || 30,
        conflictResolution: settings.conflictResolution || "hubspot"
      });
      
      setNotificationSettings({
        emailNotifications: settings.emailNotifications !== undefined ? settings.emailNotifications : true,
        syncFailures: settings.syncFailures !== undefined ? settings.syncFailures : true,
        newCustomers: settings.newCustomers !== undefined ? settings.newCustomers : true,
        paymentFailures: settings.paymentFailures !== undefined ? settings.paymentFailures : true,
        subscriptionChanges: settings.subscriptionChanges !== undefined ? settings.subscriptionChanges : true,
        emailAddress: settings.emailAddress || ""
      });
    }
  }, [settings]);

  const handleGeneralSettingsSave = () => {
    updateSettingsMutation.mutate(generalSettings);
  };
  
  const handleSyncSettingsSave = () => {
    updateSettingsMutation.mutate(syncSettings);
  };
  
  const handleNotificationSettingsSave = () => {
    updateSettingsMutation.mutate(notificationSettings);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-linear-text-secondary text-sm mt-1">
          Configure application settings and preferences
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="sync">Synchronization</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic application settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="application-name">Application Name</Label>
                    <Input 
                      id="application-name"
                      value={generalSettings.applicationName}
                      onChange={(e) => setGeneralSettings({...generalSettings, applicationName: e.target.value})}
                      placeholder="Swayzio Admin Dashboard"
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date-format">Date Format</Label>
                    <Select 
                      value={generalSettings.dateFormat}
                      onValueChange={(value) => setGeneralSettings({...generalSettings, dateFormat: value})}
                    >
                      <SelectTrigger id="date-format">
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                        <SelectItem value="MMMM d, yyyy">Month D, YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time-format">Time Format</Label>
                    <Select 
                      value={generalSettings.timeFormat}
                      onValueChange={(value) => setGeneralSettings({...generalSettings, timeFormat: value})}
                    >
                      <SelectTrigger id="time-format">
                        <SelectValue placeholder="Select time format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                        <SelectItem value="24h">24-hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={generalSettings.timezone}
                      onValueChange={(value) => setGeneralSettings({...generalSettings, timezone: value})}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select 
                      value={generalSettings.defaultCurrency}
                      onValueChange={(value) => setGeneralSettings({...generalSettings, defaultCurrency: value})}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD ($)</SelectItem>
                        <SelectItem value="AUD">AUD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleGeneralSettingsSave}>
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6 space-y-6">
          {!activeIntegration ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Connected Services</h2>
                  <p className="text-sm text-linear-text-secondary">Manage your third-party integrations</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSyncAll}
                  disabled={isSyncing}
                  data-testid="button-sync-all"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync All'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {integrations.map((integration) => {
                  const Icon = integration.icon;
                  return (
                    <Card 
                      key={integration.id} 
                      className="relative overflow-hidden cursor-pointer hover:border-linear-purple/50 transition-colors"
                      onClick={() => setActiveIntegration(integration.id)}
                      data-testid={`card-integration-${integration.id}`}
                    >
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
                          <Button variant="ghost" size="sm" className="h-7">
                            <SettingsIcon className="h-3 w-3 mr-1" />
                            View
                          </Button>
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
            </>
          ) : (
            <div className="space-y-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveIntegration(null)}
                className="mb-2"
                data-testid="button-back-integrations"
              >
                ← Back to Integrations
              </Button>

              {activeIntegration === "hubspot" && (
                <>
                  {!hubspotStatus?.connected && (
                    <Card className="border-linear-warning/50 bg-linear-warning/10">
                      <CardContent className="p-4 flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-linear-warning" />
                        <div>
                          <p className="text-sm text-white">HubSpot not connected</p>
                          <p className="text-xs text-linear-text-secondary">Connect your HubSpot account via the Replit connector</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <HubSpotDashboard 
                    stats={hubspotDashboard ? {
                      totalContacts: hubspotDashboard.totalContacts,
                      contactsGrowth: 0,
                      totalCompanies: hubspotDashboard.totalCompanies,
                      companiesGrowth: 0,
                      openDeals: hubspotDashboard.openDeals,
                      dealValue: hubspotDashboard.totalDealValue,
                      emailsSent: 0,
                      emailOpenRate: 0,
                    } : mockHubSpotData.stats}
                    contacts={hubspotDashboard?.recentContacts?.map((c: any) => ({
                      id: c.id,
                      name: `${c.firstname || ''} ${c.lastname || ''}`.trim() || c.email,
                      email: c.email,
                      company: c.company || '',
                      stage: c.lifecyclestage || 'subscriber',
                      lastActivity: c.lastmodifieddate || new Date().toISOString(),
                    })) || mockHubSpotData.contacts}
                    deals={hubspotDashboard?.recentDeals?.map((d: any) => ({
                      id: d.id,
                      name: d.dealname,
                      company: '',
                      amount: d.amount || 0,
                      stage: d.dealstage,
                      probability: 50,
                      closeDate: d.closedate || new Date().toISOString(),
                    })) || mockHubSpotData.deals}
                    pipelineData={mockHubSpotData.pipelineData}
                    activityHistory={mockHubSpotData.activityHistory}
                    isLoading={hubspotLoading}
                  />
                </>
              )}

              {activeIntegration === "stripe" && (
                <>
                  {!stripeStatus?.connected && (
                    <Card className="border-linear-warning/50 bg-linear-warning/10">
                      <CardContent className="p-4 flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-linear-warning" />
                        <div>
                          <p className="text-sm text-white">Stripe not connected</p>
                          <p className="text-xs text-linear-text-secondary">Connect your Stripe account via the Replit connector</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <StripeDashboard 
                    stats={stripeDashboard ? {
                      revenue: stripeDashboard.totalRevenue,
                      revenueGrowth: 0,
                      mrr: stripeDashboard.mrr,
                      mrrGrowth: 0,
                      activeSubscriptions: stripeDashboard.activeSubscriptions,
                      churnRate: 0,
                      avgRevenuePerUser: stripeDashboard.totalCustomers > 0 ? stripeDashboard.totalRevenue / stripeDashboard.totalCustomers : 0,
                      totalCustomers: stripeDashboard.totalCustomers,
                    } : mockStripeData.stats}
                    transactions={stripeDashboard?.recentPayments?.map((p: any) => ({
                      id: p.id,
                      customer: p.customerId || 'Unknown',
                      amount: p.amount / 100,
                      status: p.status === 'succeeded' ? 'paid' : p.status,
                      type: 'payment',
                      createdAt: new Date(p.created * 1000).toISOString(),
                    })) || mockStripeData.transactions}
                    subscriptions={mockStripeData.subscriptions}
                    revenueHistory={mockStripeData.revenueHistory}
                    planDistribution={mockStripeData.planDistribution}
                    isLoading={stripeLoading}
                  />
                </>
              )}

              {activeIntegration === "github" && (
                <GitHubDashboard 
                  stats={mockGitHubData.stats}
                  commitHistory={mockGitHubData.commitHistory}
                  languageDistribution={mockGitHubData.languageDistribution}
                  pullRequests={mockGitHubData.pullRequests}
                />
              )}

              {activeIntegration === "vercel" && (
                <VercelDashboard 
                  stats={mockVercelData.stats}
                  trafficData={mockVercelData.trafficData}
                  webVitals={mockVercelData.webVitals}
                  deployments={mockVercelData.deployments}
                />
              )}

              {activeIntegration === "social" && (
                <SocialMetrics 
                  platforms={mockSocialData.platforms}
                  followerHistory={mockSocialData.followerHistory}
                />
              )}

              {activeIntegration === "kit" && (
                <KitDashboard 
                  stats={mockKitData.stats}
                  broadcasts={mockKitData.broadcasts}
                  forms={mockKitData.forms}
                  subscriberHistory={mockKitData.subscriberHistory}
                />
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="sync" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Synchronization Settings</CardTitle>
              <CardDescription>
                Configure how data synchronization works between systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-sync">Automatic Synchronization</Label>
                    <p className="text-sm text-gray-500">
                      Enable automatic synchronization between HubSpot and Stripe
                    </p>
                  </div>
                  <Switch 
                    id="auto-sync" 
                    checked={syncSettings.autoSync}
                    onCheckedChange={(checked) => setSyncSettings({...syncSettings, autoSync: checked})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sync-frequency">Sync Frequency (minutes)</Label>
                  <div className="grid grid-cols-4 gap-4">
                    <Select 
                      value={syncSettings.syncFrequency.toString()}
                      onValueChange={(value) => setSyncSettings({...syncSettings, syncFrequency: parseInt(value)})}
                    >
                      <SelectTrigger id="sync-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="360">6 hours</SelectItem>
                        <SelectItem value="720">12 hours</SelectItem>
                        <SelectItem value="1440">24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="conflict-resolution">Conflict Resolution Strategy</Label>
                  <p className="text-sm text-gray-500 mb-2">
                    Define which system should be considered the source of truth when conflicts occur
                  </p>
                  <Select 
                    value={syncSettings.conflictResolution}
                    onValueChange={(value) => setSyncSettings({...syncSettings, conflictResolution: value})}
                  >
                    <SelectTrigger id="conflict-resolution">
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hubspot">HubSpot is primary</SelectItem>
                      <SelectItem value="stripe">Stripe is primary</SelectItem>
                      <SelectItem value="newest">Most recently updated wins</SelectItem>
                      <SelectItem value="manual">Manual resolution (require approval)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSyncSettingsSave}>
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive email notifications for important events
                    </p>
                  </div>
                  <Switch 
                    id="email-notifications" 
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                  />
                </div>
                
                {notificationSettings.emailNotifications && (
                  <div className="space-y-2">
                    <Label htmlFor="email-address">Email Address</Label>
                    <Input 
                      id="email-address"
                      value={notificationSettings.emailAddress}
                      onChange={(e) => setNotificationSettings({...notificationSettings, emailAddress: e.target.value})}
                      placeholder="admin@example.com"
                    />
                  </div>
                )}
                
                <Separator />
                
                <h3 className="text-sm font-medium">Notification Events</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sync-failures" className="cursor-pointer">Synchronization Failures</Label>
                    <Switch 
                      id="sync-failures" 
                      checked={notificationSettings.syncFailures}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, syncFailures: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="new-customers" className="cursor-pointer">New Customers</Label>
                    <Switch 
                      id="new-customers" 
                      checked={notificationSettings.newCustomers}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, newCustomers: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="payment-failures" className="cursor-pointer">Payment Failures</Label>
                    <Switch 
                      id="payment-failures" 
                      checked={notificationSettings.paymentFailures}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, paymentFailures: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="subscription-changes" className="cursor-pointer">Subscription Changes</Label>
                    <Switch 
                      id="subscription-changes" 
                      checked={notificationSettings.subscriptionChanges}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, subscriptionChanges: checked})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleNotificationSettingsSave}>
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users who have access to the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md overflow-hidden">
                  <div className="grid grid-cols-4 gap-4 p-4 font-medium bg-gray-50 border-b">
                    <div>Name</div>
                    <div>Email</div>
                    <div>Role</div>
                    <div className="text-right">Actions</div>
                  </div>
                  <div className="divide-y">
                    <div className="grid grid-cols-4 gap-4 p-4 items-center">
                      <div className="text-sm font-medium">Jane Smith</div>
                      <div className="text-sm">jane.smith@example.com</div>
                      <div className="text-sm">Admin</div>
                      <div className="flex justify-end">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Edit user</span>
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
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 p-4 items-center">
                      <div className="text-sm font-medium">John Doe</div>
                      <div className="text-sm">john.doe@example.com</div>
                      <div className="text-sm">User</div>
                      <div className="flex justify-end">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Edit user</span>
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
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>
                    Add User
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
