import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart } from "@/components/ui/area-chart";
import { LineChart } from "@/components/ui/line-chart";
import { DataTable, StatusBadge } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Globe, 
  Rocket, 
  Clock, 
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp,
  Eye,
  MousePointer,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";

interface VercelStats {
  totalVisitors: number;
  pageViews: number;
  bounceRate: number;
  avgDuration: string;
  visitorsGrowth: number;
  pageViewsGrowth: number;
}

interface Deployment {
  id: string;
  name: string;
  status: 'ready' | 'building' | 'error' | 'queued';
  url: string;
  createdAt: string;
  duration: number;
}

interface WebVital {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  target: number;
}

interface VercelDashboardProps {
  stats?: VercelStats;
  deployments?: Deployment[];
  trafficData?: Array<{ name: string; visitors: number; pageViews: number }>;
  webVitals?: WebVital[];
  isLoading?: boolean;
}

const deploymentColumns: ColumnDef<Deployment>[] = [
  {
    accessorKey: "name",
    header: "Project",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-linear-text-tertiary" />
        <span className="font-medium text-white">{row.getValue("name")}</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusConfig = {
        ready: { icon: CheckCircle2, color: 'text-linear-success', bg: 'bg-linear-success/20' },
        building: { icon: Loader2, color: 'text-linear-warning', bg: 'bg-linear-warning/20' },
        error: { icon: XCircle, color: 'text-linear-error', bg: 'bg-linear-error/20' },
        queued: { icon: Clock, color: 'text-linear-text-tertiary', bg: 'bg-linear-hover' },
      };
      const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.queued;
      const Icon = config.icon;
      
      return (
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${config.bg}`}>
          <Icon className={`h-3 w-3 ${config.color} ${status === 'building' ? 'animate-spin' : ''}`} />
          <span className={`text-xs capitalize ${config.color}`}>{status}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "url",
    header: "URL",
    cell: ({ row }) => (
      <a 
        href={`https://${row.getValue("url")}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-linear-purple hover:underline text-sm truncate max-w-[200px] block"
      >
        {row.getValue("url")}
      </a>
    ),
  },
  {
    accessorKey: "duration",
    header: "Build Time",
    cell: ({ row }) => (
      <span className="text-linear-text-secondary text-sm">
        {row.getValue("duration")}s
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Deployed",
    cell: ({ row }) => (
      <span className="text-linear-text-tertiary text-xs">
        {formatDistanceToNow(new Date(row.getValue("createdAt")), { addSuffix: true })}
      </span>
    ),
  },
];

const getVitalRating = (rating: string) => {
  switch (rating) {
    case 'good': return { color: 'text-linear-success', bg: 'bg-linear-success' };
    case 'needs-improvement': return { color: 'text-linear-warning', bg: 'bg-linear-warning' };
    case 'poor': return { color: 'text-linear-error', bg: 'bg-linear-error' };
    default: return { color: 'text-linear-text-secondary', bg: 'bg-linear-hover' };
  }
};

export function VercelDashboard({
  stats,
  deployments = [],
  trafficData = [],
  webVitals = [],
  isLoading = false,
}: VercelDashboardProps) {
  const statCards: Array<{
    title: string;
    value: number | string;
    change?: number;
    icon: any;
    format: (v: any) => string;
  }> = [
    {
      title: "Unique Visitors",
      value: stats?.totalVisitors ?? 0,
      change: stats?.visitorsGrowth ?? 0,
      icon: Eye,
      format: (v: number) => v.toLocaleString(),
    },
    {
      title: "Page Views",
      value: stats?.pageViews ?? 0,
      change: stats?.pageViewsGrowth ?? 0,
      icon: MousePointer,
      format: (v: number) => v.toLocaleString(),
    },
    {
      title: "Bounce Rate",
      value: stats?.bounceRate ?? 0,
      icon: TrendingUp,
      format: (v: number) => `${v.toFixed(1)}%`,
    },
    {
      title: "Avg. Duration",
      value: stats?.avgDuration ?? "0:00",
      icon: Clock,
      format: (v: string) => v,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 bg-linear-hover" />
                  <Skeleton className="h-6 w-16 bg-linear-hover" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-linear-text-secondary">{stat.title}</span>
                    <stat.icon className="h-4 w-4 text-linear-text-tertiary" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-semibold text-white">
                      {stat.format(stat.value)}
                    </span>
                    {stat.change !== undefined && (
                      <span className={`text-xs ${stat.change >= 0 ? 'text-linear-success' : 'text-linear-error'}`}>
                        {stat.change >= 0 ? '+' : ''}{stat.change}%
                      </span>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 border-b border-linear-border">
            <CardTitle className="text-sm font-medium text-white">Traffic Overview</CardTitle>
            <CardDescription className="text-xs">Visitors and page views over time</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-48 w-full bg-linear-hover" />
            ) : (
              <AreaChart
                data={trafficData}
                height={200}
                lines={[
                  { dataKey: "visitors", stroke: "#5e6ad2", fill: "#5e6ad2", name: "Visitors" },
                  { dataKey: "pageViews", stroke: "#59a200", fill: "#59a200", name: "Page Views" },
                ]}
                showLegend
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 border-b border-linear-border">
            <CardTitle className="text-sm font-medium text-white">Core Web Vitals</CardTitle>
            <CardDescription className="text-xs">Performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-linear-hover" />
              ))
            ) : (
              webVitals.map((vital, index) => {
                const rating = getVitalRating(vital.rating);
                const progress = Math.min((vital.value / vital.target) * 100, 100);
                
                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-linear-text-secondary">{vital.name}</span>
                      <span className={rating.color}>{vital.value}ms</span>
                    </div>
                    <Progress 
                      value={progress} 
                      className="h-1.5 bg-linear-hover"
                    />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 border-b border-linear-border">
          <CardTitle className="text-sm font-medium text-white">Recent Deployments</CardTitle>
          <CardDescription className="text-xs">Latest deployment activity</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <DataTable
            columns={deploymentColumns}
            data={deployments}
            isLoading={isLoading}
            pageSize={5}
            emptyMessage="No deployments found"
          />
        </CardContent>
      </Card>
    </div>
  );
}
