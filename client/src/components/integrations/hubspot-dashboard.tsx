import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart } from "@/components/ui/area-chart";
import { BarChart } from "@/components/ui/bar-chart";
import { DonutChart, DonutLegend } from "@/components/ui/donut-chart";
import { DataTable, StatusBadge, getStatusVariant } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { 
  Users, 
  Building2, 
  DollarSign,
  Mail,
  TrendingUp,
  Target,
  Calendar,
  Phone,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";

interface HubSpotStats {
  totalContacts: number;
  contactsGrowth: number;
  totalCompanies: number;
  companiesGrowth: number;
  openDeals: number;
  dealValue: number;
  emailsSent: number;
  emailOpenRate: number;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  stage: string;
  lastActivity: string;
}

interface Deal {
  id: string;
  name: string;
  company: string;
  amount: number;
  stage: string;
  probability: number;
  closeDate: string;
}

interface HubSpotDashboardProps {
  stats?: HubSpotStats;
  contacts?: Contact[];
  deals?: Deal[];
  pipelineData?: Array<{ name: string; value: number; count: number }>;
  activityHistory?: Array<{ name: string; emails: number; calls: number; meetings: number }>;
  isLoading?: boolean;
}

const contactColumns: ColumnDef<Contact>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-linear-purple/20 flex items-center justify-center">
          <span className="text-xs font-medium text-linear-purple">
            {(row.getValue("name") as string).charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="font-medium text-white">{row.getValue("name")}</span>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-linear-text-secondary text-sm">{row.getValue("email")}</span>
    ),
  },
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }) => (
      <span className="text-linear-text-secondary">{row.getValue("company")}</span>
    ),
  },
  {
    accessorKey: "stage",
    header: "Stage",
    cell: ({ row }) => {
      const stage = row.getValue("stage") as string;
      return <StatusBadge status={stage} variant={getStatusVariant(stage)} />;
    },
  },
  {
    accessorKey: "lastActivity",
    header: "Last Activity",
    cell: ({ row }) => (
      <span className="text-linear-text-tertiary text-xs">
        {formatDistanceToNow(new Date(row.getValue("lastActivity")), { addSuffix: true })}
      </span>
    ),
  },
];

const dealColumns: ColumnDef<Deal>[] = [
  {
    accessorKey: "name",
    header: "Deal",
    cell: ({ row }) => (
      <span className="font-medium text-white">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }) => (
      <span className="text-linear-text-secondary">{row.getValue("company")}</span>
    ),
  },
  {
    accessorKey: "amount",
    header: "Value",
    cell: ({ row }) => (
      <span className="text-linear-success font-medium">
        {formatCurrency(row.getValue("amount"))}
      </span>
    ),
  },
  {
    accessorKey: "stage",
    header: "Stage",
    cell: ({ row }) => {
      const stage = row.getValue("stage") as string;
      return <StatusBadge status={stage} variant={getStatusVariant(stage)} />;
    },
  },
  {
    accessorKey: "probability",
    header: "Probability",
    cell: ({ row }) => {
      const prob = row.getValue("probability") as number;
      return (
        <div className="flex items-center gap-2">
          <Progress value={prob} className="w-12 h-1.5 bg-linear-hover" />
          <span className="text-linear-text-secondary text-xs">{prob}%</span>
        </div>
      );
    },
  },
  {
    accessorKey: "closeDate",
    header: "Close Date",
    cell: ({ row }) => (
      <span className="text-linear-text-tertiary text-xs">
        {new Date(row.getValue("closeDate")).toLocaleDateString()}
      </span>
    ),
  },
];

export function HubSpotDashboard({
  stats,
  contacts = [],
  deals = [],
  pipelineData = [],
  activityHistory = [],
  isLoading = false,
}: HubSpotDashboardProps) {
  const statCards = [
    {
      title: "Total Contacts",
      value: stats?.totalContacts ?? 0,
      change: stats?.contactsGrowth ?? 0,
      icon: Users,
      format: (v: number) => v.toLocaleString(),
    },
    {
      title: "Companies",
      value: stats?.totalCompanies ?? 0,
      change: stats?.companiesGrowth ?? 0,
      icon: Building2,
      format: (v: number) => v.toLocaleString(),
    },
    {
      title: "Open Deals",
      value: stats?.openDeals ?? 0,
      icon: Target,
      format: (v: number) => v.toLocaleString(),
      subValue: stats?.dealValue ? formatCurrency(stats.dealValue) : undefined,
    },
    {
      title: "Email Open Rate",
      value: stats?.emailOpenRate ?? 0,
      icon: Mail,
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
                    <span className="text-xl font-semibold text-white">
                      {stat.format(stat.value)}
                    </span>
                    {stat.change !== undefined && (
                      <span className={`text-xs ${stat.change >= 0 ? 'text-linear-success' : 'text-linear-error'}`}>
                        {stat.change >= 0 ? '+' : ''}{stat.change}%
                      </span>
                    )}
                  </div>
                  {stat.subValue && (
                    <p className="text-xs text-linear-text-tertiary mt-1">{stat.subValue} pipeline</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 border-b border-linear-border">
            <CardTitle className="text-sm font-medium text-white">Activity Overview</CardTitle>
            <CardDescription className="text-xs">Emails, calls, and meetings over time</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-48 w-full bg-linear-hover" />
            ) : (
              <BarChart
                data={activityHistory}
                height={200}
                bars={[
                  { dataKey: "emails", fill: "#5e6ad2", name: "Emails" },
                  { dataKey: "calls", fill: "#59a200", name: "Calls" },
                  { dataKey: "meetings", fill: "#f2994a", name: "Meetings" },
                ]}
                showLegend
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 border-b border-linear-border">
            <CardTitle className="text-sm font-medium text-white">Deal Pipeline</CardTitle>
            <CardDescription className="text-xs">Deals by stage</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-48 w-full bg-linear-hover" />
            ) : (
              <div className="space-y-4">
                <DonutChart
                  data={pipelineData}
                  height={140}
                  innerRadius={40}
                  outerRadius={55}
                  centerValue={stats?.openDeals?.toString() ?? '0'}
                  centerLabel="Deals"
                  valueFormatter={formatCurrency}
                />
                <DonutLegend 
                  data={pipelineData} 
                  valueFormatter={formatCurrency}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="p-4 border-b border-linear-border">
            <CardTitle className="text-sm font-medium text-white">Recent Contacts</CardTitle>
            <CardDescription className="text-xs">Latest contact activity</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <DataTable
              columns={contactColumns}
              data={contacts}
              isLoading={isLoading}
              pageSize={5}
              emptyMessage="No contacts found"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 border-b border-linear-border">
            <CardTitle className="text-sm font-medium text-white">Active Deals</CardTitle>
            <CardDescription className="text-xs">Deals in progress</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <DataTable
              columns={dealColumns}
              data={deals}
              isLoading={isLoading}
              pageSize={5}
              emptyMessage="No deals found"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
