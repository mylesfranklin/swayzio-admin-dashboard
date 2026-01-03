import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart } from "@/components/ui/area-chart";
import { BarChart, SimpleBarChart } from "@/components/ui/bar-chart";
import { DataTable, StatusBadge, getStatusVariant } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Mail, 
  MousePointer,
  TrendingUp,
  Send,
  FileText,
  Tag,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";

interface KitStats {
  totalSubscribers: number;
  newSubscribersToday: number;
  newSubscribers7Days: number;
  newSubscribers30Days: number;
  avgOpenRate: number;
  avgClickRate: number;
  subscriberGrowth: number;
}

interface EmailBroadcast {
  id: string;
  subject: string;
  status: string;
  sentAt: string;
  recipients: number;
  openRate: number;
  clickRate: number;
}

interface Form {
  id: string;
  name: string;
  subscribers: number;
  conversionRate: number;
}

interface KitDashboardProps {
  stats?: KitStats;
  broadcasts?: EmailBroadcast[];
  forms?: Form[];
  subscriberHistory?: Array<{ name: string; subscribers: number }>;
  isLoading?: boolean;
}

const broadcastColumns: ColumnDef<EmailBroadcast>[] = [
  {
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => (
      <div className="max-w-[250px] truncate font-medium text-white">
        {row.getValue("subject")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return <StatusBadge status={status} variant={getStatusVariant(status)} />;
    },
  },
  {
    accessorKey: "recipients",
    header: "Recipients",
    cell: ({ row }) => (
      <span className="text-linear-text-secondary">
        {(row.getValue("recipients") as number).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "openRate",
    header: "Open Rate",
    cell: ({ row }) => {
      const rate = row.getValue("openRate") as number;
      return (
        <div className="flex items-center gap-2">
          <Progress value={rate} className="w-16 h-1.5 bg-linear-hover" />
          <span className="text-linear-text-secondary text-sm">{rate.toFixed(1)}%</span>
        </div>
      );
    },
  },
  {
    accessorKey: "clickRate",
    header: "Click Rate",
    cell: ({ row }) => {
      const rate = row.getValue("clickRate") as number;
      return (
        <div className="flex items-center gap-2">
          <Progress value={rate} className="w-16 h-1.5 bg-linear-hover" />
          <span className="text-linear-text-secondary text-sm">{rate.toFixed(1)}%</span>
        </div>
      );
    },
  },
  {
    accessorKey: "sentAt",
    header: "Sent",
    cell: ({ row }) => (
      <span className="text-linear-text-tertiary text-xs">
        {formatDistanceToNow(new Date(row.getValue("sentAt")), { addSuffix: true })}
      </span>
    ),
  },
];

const formColumns: ColumnDef<Form>[] = [
  {
    accessorKey: "name",
    header: "Form Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-linear-text-tertiary" />
        <span className="font-medium text-white">{row.getValue("name")}</span>
      </div>
    ),
  },
  {
    accessorKey: "subscribers",
    header: "Subscribers",
    cell: ({ row }) => (
      <span className="text-linear-text-secondary">
        {(row.getValue("subscribers") as number).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "conversionRate",
    header: "Conversion",
    cell: ({ row }) => {
      const rate = row.getValue("conversionRate") as number;
      return (
        <Badge 
          variant="outline" 
          className="text-xs text-linear-success border-linear-success/30 bg-linear-success/10"
        >
          {rate.toFixed(1)}%
        </Badge>
      );
    },
  },
];

export function KitDashboard({
  stats,
  broadcasts = [],
  forms = [],
  subscriberHistory = [],
  isLoading = false,
}: KitDashboardProps) {
  const statCards = [
    {
      title: "Total Subscribers",
      value: stats?.totalSubscribers ?? 0,
      change: stats?.subscriberGrowth ?? 0,
      icon: Users,
      format: (v: number) => v.toLocaleString(),
    },
    {
      title: "New Today",
      value: stats?.newSubscribersToday ?? 0,
      icon: TrendingUp,
      format: (v: number) => `+${v.toLocaleString()}`,
      highlight: true,
    },
    {
      title: "Avg Open Rate",
      value: stats?.avgOpenRate ?? 0,
      icon: Mail,
      format: (v: number) => `${v.toFixed(1)}%`,
    },
    {
      title: "Avg Click Rate",
      value: stats?.avgClickRate ?? 0,
      icon: MousePointer,
      format: (v: number) => `${v.toFixed(1)}%`,
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
                    <span className={`text-xl font-semibold ${stat.highlight ? 'text-linear-success' : 'text-white'}`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-3">
          <CardHeader className="p-4 border-b border-linear-border">
            <CardTitle className="text-sm font-medium text-white">Subscriber Growth</CardTitle>
            <CardDescription className="text-xs">New subscribers over time</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-48 w-full bg-linear-hover" />
            ) : (
              <AreaChart
                data={subscriberHistory}
                height={200}
                lines={[
                  { dataKey: "subscribers", stroke: "#5e6ad2", fill: "#5e6ad2", name: "Subscribers" },
                ]}
                valueFormatter={(v) => v.toLocaleString()}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 border-b border-linear-border">
            <CardTitle className="text-sm font-medium text-white">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-linear-hover" />
              ))
            ) : (
              <>
                <div className="p-3 rounded-md bg-linear-hover border border-linear-border">
                  <p className="text-xs text-linear-text-tertiary mb-1">Past 7 Days</p>
                  <p className="text-lg font-semibold text-linear-success">
                    +{stats?.newSubscribers7Days?.toLocaleString() ?? 0}
                  </p>
                </div>
                <div className="p-3 rounded-md bg-linear-hover border border-linear-border">
                  <p className="text-xs text-linear-text-tertiary mb-1">Past 30 Days</p>
                  <p className="text-lg font-semibold text-linear-success">
                    +{stats?.newSubscribers30Days?.toLocaleString() ?? 0}
                  </p>
                </div>
                <div className="p-3 rounded-md bg-linear-hover border border-linear-border">
                  <p className="text-xs text-linear-text-tertiary mb-1">Active Forms</p>
                  <p className="text-lg font-semibold text-white">{forms.length}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="p-4 border-b border-linear-border">
            <CardTitle className="text-sm font-medium text-white">Recent Broadcasts</CardTitle>
            <CardDescription className="text-xs">Email campaign performance</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <DataTable
              columns={broadcastColumns}
              data={broadcasts}
              isLoading={isLoading}
              pageSize={5}
              emptyMessage="No broadcasts found"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 border-b border-linear-border">
            <CardTitle className="text-sm font-medium text-white">Top Forms</CardTitle>
            <CardDescription className="text-xs">Forms by subscriber count</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <DataTable
              columns={formColumns}
              data={forms}
              isLoading={isLoading}
              pageSize={5}
              emptyMessage="No forms found"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
