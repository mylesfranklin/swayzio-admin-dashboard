import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  Mail, 
  MousePointer,
  TrendingUp,
  TrendingDown,
  FileText,
  Tag,
  Send,
  Eye,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface KitGrowthStats {
  cancellations: number;
  net_new_subscribers: number;
  new_subscribers: number;
  subscribers: number;
  starting: string;
  ending: string;
}

interface KitEmailStats {
  sent: number;
  clicked: number;
  opened: number;
  email_stats_mode: string;
  open_tracking_enabled: boolean;
  click_tracking_enabled: boolean;
  starting: string;
  ending: string;
}

interface KitBroadcast {
  id: number;
  publication_id: number;
  created_at: string;
  subject: string;
  preview_text: string | null;
  public: boolean;
  published_at: string | null;
  send_at: string | null;
  email_address: string;
  email_template: {
    id: number;
    name: string;
  } | null;
}

interface KitForm {
  id: number;
  name: string;
  created_at: string;
  type: string;
  archived: boolean;
  uid: string;
}

interface KitTag {
  id: number;
  name: string;
  created_at: string;
}

interface KitDashboardStats {
  growthStats: KitGrowthStats;
  emailStats: KitEmailStats;
  totalSubscribers: number;
  broadcasts: KitBroadcast[];
  forms: KitForm[];
  tags: KitTag[];
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function KitDashboardContent({ data }: { data: KitDashboardStats }) {
  const openRate = data.emailStats.sent > 0 
    ? ((data.emailStats.opened / data.emailStats.sent) * 100).toFixed(1)
    : '0';
  const clickRate = data.emailStats.sent > 0 
    ? ((data.emailStats.clicked / data.emailStats.sent) * 100).toFixed(1)
    : '0';
  
  const activeForms = data.forms.filter(f => !f.archived);
  const sentBroadcasts = data.broadcasts.filter(b => b.published_at);
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-linear-card border-linear-border" data-testid="card-total-subscribers">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-linear-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white" data-testid="text-total-subscribers">
              {formatNumber(data.totalSubscribers)}
            </div>
            <p className="text-xs text-linear-text-tertiary mt-1">Active subscribers</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border" data-testid="card-new-subscribers">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">New Subscribers</CardTitle>
            <TrendingUp className="h-4 w-4 text-linear-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-linear-success" data-testid="text-new-subscribers">
              +{formatNumber(data.growthStats.new_subscribers)}
            </div>
            <p className="text-xs text-linear-text-tertiary mt-1">Last 90 days</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border" data-testid="card-cancellations">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Unsubscribes</CardTitle>
            <TrendingDown className="h-4 w-4 text-linear-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-linear-error" data-testid="text-cancellations">
              -{formatNumber(data.growthStats.cancellations)}
            </div>
            <p className="text-xs text-linear-text-tertiary mt-1">Last 90 days</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border" data-testid="card-net-new">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Net Growth</CardTitle>
            <Users className="h-4 w-4 text-linear-purple" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.growthStats.net_new_subscribers >= 0 ? 'text-linear-success' : 'text-linear-error'}`} data-testid="text-net-new">
              {data.growthStats.net_new_subscribers >= 0 ? '+' : ''}{formatNumber(data.growthStats.net_new_subscribers)}
            </div>
            <p className="text-xs text-linear-text-tertiary mt-1">Last 90 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-linear-card border-linear-border" data-testid="card-emails-sent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Emails Sent</CardTitle>
            <Send className="h-4 w-4 text-linear-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white" data-testid="text-emails-sent">
              {formatNumber(data.emailStats.sent)}
            </div>
            <p className="text-xs text-linear-text-tertiary mt-1">Last 90 days</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border" data-testid="card-emails-opened">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Opens</CardTitle>
            <Eye className="h-4 w-4 text-linear-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white" data-testid="text-emails-opened">
              {formatNumber(data.emailStats.opened)}
            </div>
            <p className="text-xs text-linear-text-tertiary mt-1">{openRate}% open rate</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border" data-testid="card-emails-clicked">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-linear-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white" data-testid="text-emails-clicked">
              {formatNumber(data.emailStats.clicked)}
            </div>
            <p className="text-xs text-linear-text-tertiary mt-1">{clickRate}% click rate</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border" data-testid="card-forms-count">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Active Forms</CardTitle>
            <FileText className="h-4 w-4 text-linear-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white" data-testid="text-forms-count">
              {activeForms.length}
            </div>
            <p className="text-xs text-linear-text-tertiary mt-1">{data.tags.length} tags</p>
          </CardContent>
        </Card>
      </div>

      {sentBroadcasts.length > 0 && (
        <Card className="bg-linear-card border-linear-border" data-testid="card-broadcasts">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Recent Broadcasts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-linear-border hover:bg-transparent">
                  <TableHead className="text-linear-text-secondary">Subject</TableHead>
                  <TableHead className="text-linear-text-secondary">Template</TableHead>
                  <TableHead className="text-linear-text-secondary">Sent</TableHead>
                  <TableHead className="text-linear-text-secondary">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sentBroadcasts.slice(0, 10).map((broadcast) => (
                  <TableRow 
                    key={broadcast.id} 
                    className="border-linear-border hover:bg-linear-base"
                    data-testid={`row-broadcast-${broadcast.id}`}
                  >
                    <TableCell className="text-white font-medium">
                      {broadcast.subject || 'No subject'}
                    </TableCell>
                    <TableCell className="text-linear-text-secondary">
                      {broadcast.email_template?.name || 'Default'}
                    </TableCell>
                    <TableCell className="text-linear-text-secondary">
                      {broadcast.published_at ? formatDate(broadcast.published_at) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={broadcast.published_at ? 'bg-linear-success/20 text-linear-success' : 'bg-linear-warning/20 text-linear-warning'}
                      >
                        {broadcast.published_at ? 'Sent' : 'Draft'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {activeForms.length > 0 && (
          <Card className="bg-linear-card border-linear-border" data-testid="card-forms">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Signup Forms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeForms.slice(0, 6).map((form) => (
                  <div 
                    key={form.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-linear-base border border-linear-border"
                    data-testid={`card-form-${form.id}`}
                  >
                    <div>
                      <p className="text-white font-medium">{form.name}</p>
                      <p className="text-xs text-linear-text-tertiary">
                        {form.type === 'embed' ? 'Embedded' : 'Landing Page'}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-linear-text-secondary border-linear-border capitalize">
                      {form.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {data.tags.length > 0 && (
          <Card className="bg-linear-card border-linear-border" data-testid="card-tags">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Subscriber Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.tags.slice(0, 20).map((tag) => (
                  <Badge 
                    key={tag.id} 
                    variant="secondary" 
                    className="bg-linear-purple/20 text-linear-purple"
                    data-testid={`tag-${tag.id}`}
                  >
                    {tag.name}
                  </Badge>
                ))}
                {data.tags.length > 20 && (
                  <Badge variant="outline" className="text-linear-text-secondary border-linear-border">
                    +{data.tags.length - 20} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function NotConnectedState() {
  return (
    <Card className="bg-linear-card border-linear-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-linear-purple/10">
            <Mail className="h-5 w-5 text-linear-purple" />
          </div>
          <div>
            <CardTitle className="text-white">Connect Kit Newsletter</CardTitle>
            <p className="text-sm text-linear-text-secondary mt-1">
              Link your Kit (ConvertKit) account to view subscriber analytics, broadcasts, and email performance.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 p-4 rounded-lg bg-linear-base border border-linear-border">
          <AlertCircle className="h-8 w-8 text-linear-warning" />
          <div className="flex-1">
            <p className="text-sm text-white font-medium">API Key Required</p>
            <p className="text-sm text-linear-text-secondary mt-1">
              Add your Kit API key as KIT_API_KEY in the Secrets tab to connect.
              You can generate an API key from Kit Settings → Developer.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-linear-card border-linear-border">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24 bg-linear-border" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 bg-linear-border" />
              <Skeleton className="h-3 w-16 bg-linear-border mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-linear-card border-linear-border">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24 bg-linear-border" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 bg-linear-border" />
              <Skeleton className="h-3 w-16 bg-linear-border mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function KitDashboard() {
  const statusQuery = useQuery<{ connected: boolean }>({
    queryKey: ['/api/kit/live/status'],
    refetchInterval: 30000
  });

  const dashboardQuery = useQuery<KitDashboardStats>({
    queryKey: ['/api/kit/live/dashboard'],
    enabled: statusQuery.data?.connected === true,
    staleTime: 60000
  });

  const isConnected = statusQuery.data?.connected === true;
  const isLoading = statusQuery.isLoading || (isConnected && dashboardQuery.isLoading);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/kit/live/dashboard'] });
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!isConnected) {
    return <NotConnectedState />;
  }

  if (dashboardQuery.isError) {
    return (
      <Card className="bg-linear-card border-linear-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-linear-error">
            <AlertCircle className="h-5 w-5" />
            <p>Error loading Kit data. Please check your API key.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dashboardQuery.data) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={dashboardQuery.isFetching}
          className="border-linear-border text-linear-text-secondary hover:text-white"
          data-testid="button-refresh-kit"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${dashboardQuery.isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      <KitDashboardContent data={dashboardQuery.data} />
    </div>
  );
}
