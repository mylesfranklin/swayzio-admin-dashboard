import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart } from "@/components/ui/area-chart";
import { BarChart } from "@/components/ui/bar-chart";
import { DonutChart, DonutLegend } from "@/components/ui/donut-chart";
import { DataTable, StatusBadge, getStatusVariant } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  Users,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";

interface StripeStats {
  revenue: number;
  revenueGrowth: number;
  mrr: number;
  mrrGrowth: number;
  activeSubscriptions: number;
  churnRate: number;
  avgRevenuePerUser: number;
  totalCustomers: number;
}

interface Transaction {
  id: string;
  customer: string;
  amount: number;
  status: string;
  type: string;
  createdAt: string;
}

interface Subscription {
  id: string;
  customer: string;
  plan: string;
  amount: number;
  status: string;
  nextBillingDate: string;
}

interface StripeDashboardProps {
  stats?: StripeStats;
  transactions?: Transaction[];
  subscriptions?: Subscription[];
  revenueHistory?: Array<{ name: string; revenue: number; mrr: number }>;
  planDistribution?: Array<{ name: string; value: number }>;
  isLoading?: boolean;
}

const transactionColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <span className="font-medium text-white">{row.getValue("customer")}</span>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="text-linear-success font-medium">
        {formatCurrency(row.getValue("amount"))}
      </span>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span className="text-linear-text-secondary capitalize">{row.getValue("type")}</span>
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
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-linear-text-tertiary text-xs">
        {formatDistanceToNow(new Date(row.getValue("createdAt")), { addSuffix: true })}
      </span>
    ),
  },
];

const subscriptionColumns: ColumnDef<Subscription>[] = [
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <span className="font-medium text-white">{row.getValue("customer")}</span>
    ),
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {row.getValue("plan")}
      </Badge>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="text-linear-text-secondary">
        {formatCurrency(row.getValue("amount"))}/mo
      </span>
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
    accessorKey: "nextBillingDate",
    header: "Next Billing",
    cell: ({ row }) => (
      <span className="text-linear-text-tertiary text-xs">
        {new Date(row.getValue("nextBillingDate")).toLocaleDateString()}
      </span>
    ),
  },
];

export function StripeDashboard({
  stats,
  transactions = [],
  subscriptions = [],
  revenueHistory = [],
  planDistribution = [],
  isLoading = false,
}: StripeDashboardProps) {
  const statCards: Array<{
    title: string;
    value: number;
    change?: number;
    icon: any;
    format: (v: number) => string;
    color?: string;
    negative?: boolean;
  }> = [
    {
      title: "Total Revenue",
      value: stats?.revenue ?? 0,
      change: stats?.revenueGrowth ?? 0,
      icon: DollarSign,
      format: formatCurrency,
      color: 'text-linear-success',
    },
    {
      title: "MRR",
      value: stats?.mrr ?? 0,
      change: stats?.mrrGrowth ?? 0,
      icon: RefreshCw,
      format: formatCurrency,
    },
    {
      title: "Active Subscriptions",
      value: stats?.activeSubscriptions ?? 0,
      icon: CreditCard,
      format: (v: number) => v.toLocaleString(),
    },
    {
      title: "Churn Rate",
      value: stats?.churnRate ?? 0,
      icon: AlertTriangle,
      format: (v: number) => `${v.toFixed(1)}%`,
      negative: true,
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
                    <stat.icon className={`h-4 w-4 ${stat.negative ? 'text-linear-warning' : 'text-linear-text-tertiary'}`} />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-xl font-semibold ${stat.color || 'text-white'}`}>
                      {stat.format(stat.value)}
                    </span>
                    {stat.change !== undefined && (
                      <span className={`text-xs flex items-center ${
                        stat.negative 
                          ? (stat.change <= 0 ? 'text-linear-success' : 'text-linear-error')
                          : (stat.change >= 0 ? 'text-linear-success' : 'text-linear-error')
                      }`}>
                        {stat.change >= 0 
                          ? <TrendingUp className="h-3 w-3 mr-0.5" /> 
                          : <TrendingDown className="h-3 w-3 mr-0.5" />
                        }
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
            <CardTitle className="text-sm font-medium text-white">Revenue Overview</CardTitle>
            <CardDescription className="text-xs">Revenue and MRR over time</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-48 w-full bg-linear-hover" />
            ) : (
              <AreaChart
                data={revenueHistory}
                height={200}
                lines={[
                  { dataKey: "revenue", stroke: "#5e6ad2", fill: "#5e6ad2", name: "Revenue" },
                  { dataKey: "mrr", stroke: "#59a200", fill: "#59a200", name: "MRR" },
                ]}
                valueFormatter={formatCurrency}
                showLegend
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 border-b border-linear-border">
            <CardTitle className="text-sm font-medium text-white">Plan Distribution</CardTitle>
            <CardDescription className="text-xs">Subscribers by plan</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-48 w-full bg-linear-hover" />
            ) : (
              <div className="space-y-4">
                <DonutChart
                  data={planDistribution}
                  height={140}
                  innerRadius={40}
                  outerRadius={55}
                  centerValue={stats?.activeSubscriptions?.toString() ?? '0'}
                  centerLabel="Active"
                />
                <DonutLegend data={planDistribution} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="p-4 border-b border-linear-border">
            <CardTitle className="text-sm font-medium text-white">Recent Transactions</CardTitle>
            <CardDescription className="text-xs">Latest payment activity</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <DataTable
              columns={transactionColumns}
              data={transactions}
              isLoading={isLoading}
              pageSize={5}
              emptyMessage="No transactions found"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 border-b border-linear-border">
            <CardTitle className="text-sm font-medium text-white">Active Subscriptions</CardTitle>
            <CardDescription className="text-xs">Current subscriber base</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <DataTable
              columns={subscriptionColumns}
              data={subscriptions}
              isLoading={isLoading}
              pageSize={5}
              emptyMessage="No subscriptions found"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
