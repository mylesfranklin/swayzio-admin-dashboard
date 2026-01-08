import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark, DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Building2, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { queryClient } from "@/lib/queryClient";

interface MercuryAccount {
  id: string;
  name: string;
  type: string;
  status: string;
  currentBalance: number;
  availableBalance: number;
  accountNumber: string;
  routingNumber: string;
  createdAt: string;
}

interface MercuryTransaction {
  id: string;
  amount: number;
  bankDescription: string;
  counterpartyName: string;
  counterpartyNickname?: string;
  createdAt: string;
  dashboardLink: string;
  kind: string;
  note?: string;
  postedAt?: string;
  status: string;
}

interface MercuryDashboardStats {
  accounts: MercuryAccount[];
  totalBalance: number;
  recentTransactions: MercuryTransaction[];
  cashFlowByMonth: Array<{ month: string; inflow: number; outflow: number }>;
  transactionsByType: Record<string, number>;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'sent':
    case 'completed':
      return 'bg-linear-success/20 text-linear-success';
    case 'pending':
      return 'bg-linear-warning/20 text-linear-warning';
    case 'failed':
    case 'cancelled':
      return 'bg-linear-error/20 text-linear-error';
    default:
      return 'bg-linear-text-tertiary/20 text-linear-text-tertiary';
  }
}

function MercuryDashboard({ data }: { data: MercuryDashboardStats }) {
  const currentMonth = data.cashFlowByMonth[data.cashFlowByMonth.length - 1] || { inflow: 0, outflow: 0 };
  const pendingTransactions = data.recentTransactions.filter(t => t.status === 'pending');
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-linear-card border-linear-border" data-testid="card-total-balance">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-linear-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white" data-testid="text-total-balance">
              {formatCurrency(data.totalBalance)}
            </div>
            <p className="text-xs text-linear-text-tertiary mt-1">
              Across {data.accounts.length} account{data.accounts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border" data-testid="card-monthly-inflow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Monthly Inflow</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-linear-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-linear-success" data-testid="text-monthly-inflow">
              {formatCurrency(currentMonth.inflow)}
            </div>
            <p className="text-xs text-linear-text-tertiary mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border" data-testid="card-monthly-outflow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Monthly Outflow</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-linear-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-linear-error" data-testid="text-monthly-outflow">
              {formatCurrency(currentMonth.outflow)}
            </div>
            <p className="text-xs text-linear-text-tertiary mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border" data-testid="card-pending">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Pending</CardTitle>
            <CreditCard className="h-4 w-4 text-linear-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white" data-testid="text-pending-count">
              {pendingTransactions.length}
            </div>
            <p className="text-xs text-linear-text-tertiary mt-1">Transactions</p>
          </CardContent>
        </Card>
      </div>

      {data.accounts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.accounts.map((account) => (
            <Card key={account.id} className="bg-linear-card border-linear-border" data-testid={`card-account-${account.id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-white">{account.name}</CardTitle>
                  <Badge variant="outline" className="text-linear-text-secondary border-linear-border capitalize">
                    {account.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-white">{formatCurrency(account.currentBalance)}</div>
                <p className="text-xs text-linear-text-tertiary mt-2">
                  ****{account.accountNumber?.slice(-4) || '****'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data.cashFlowByMonth.length > 0 && (
        <Card className="bg-linear-card border-linear-border" data-testid="card-cash-flow-chart">
          <CardHeader>
            <CardTitle className="text-white">Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.cashFlowByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 15, 15, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'white' }}
                    formatter={(value: number) => [formatCurrency(value), '']}
                  />
                  <Legend />
                  <Bar dataKey="inflow" name="Inflow" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="outflow" name="Outflow" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {data.recentTransactions.length > 0 && (
        <Card className="bg-linear-card border-linear-border" data-testid="card-transactions">
          <CardHeader>
            <CardTitle className="text-white">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-linear-border hover:bg-transparent">
                  <TableHead className="text-linear-text-secondary">Date</TableHead>
                  <TableHead className="text-linear-text-secondary">Description</TableHead>
                  <TableHead className="text-linear-text-secondary">Type</TableHead>
                  <TableHead className="text-linear-text-secondary">Status</TableHead>
                  <TableHead className="text-linear-text-secondary text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentTransactions.slice(0, 15).map((txn) => (
                  <TableRow 
                    key={txn.id} 
                    className="border-linear-border hover:bg-linear-base"
                    data-testid={`row-transaction-${txn.id}`}
                  >
                    <TableCell className="text-linear-text-secondary">
                      {formatDate(txn.createdAt)}
                    </TableCell>
                    <TableCell className="text-white">
                      {txn.counterpartyName || txn.bankDescription || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-linear-text-secondary capitalize">
                      {txn.kind.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(txn.status)}>
                        {txn.status}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${txn.amount >= 0 ? 'text-linear-success' : 'text-linear-error'}`}>
                      {txn.amount >= 0 ? '+' : ''}{formatCurrency(txn.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function NotConnectedState() {
  return (
    <Card className="bg-linear-card border-linear-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-linear-purple/10">
            <Landmark className="h-5 w-5 text-linear-purple" />
          </div>
          <div>
            <CardTitle className="text-white">Connect Mercury</CardTitle>
            <p className="text-sm text-linear-text-secondary mt-1">
              Link your Mercury bank account to view balances, transactions, and financial insights.
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
              Add your Mercury API key as MERCURY_API_KEY in the Secrets tab to connect.
              You can generate an API token from Mercury Settings → API.
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-linear-card border-linear-border">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24 bg-linear-border" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 bg-linear-border" />
              <Skeleton className="h-3 w-20 bg-linear-border mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-linear-card border-linear-border">
        <CardHeader>
          <Skeleton className="h-6 w-32 bg-linear-border" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full bg-linear-border" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function MercuryPage() {
  const statusQuery = useQuery<{ connected: boolean }>({
    queryKey: ['/api/mercury/live/status'],
    refetchInterval: 30000
  });

  const dashboardQuery = useQuery<MercuryDashboardStats>({
    queryKey: ['/api/mercury/live/dashboard'],
    enabled: statusQuery.data?.connected === true,
    staleTime: 60000
  });

  const isConnected = statusQuery.data?.connected === true;
  const isLoading = statusQuery.isLoading || (isConnected && dashboardQuery.isLoading);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/mercury/live/dashboard'] });
  };

  return (
    <div className="space-y-6" data-testid="mercury-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mercury Banking</h1>
          <p className="text-linear-text-secondary mt-1">Business banking and financial overview</p>
        </div>
        {isConnected && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={dashboardQuery.isFetching}
            className="border-linear-border text-linear-text-secondary hover:text-white"
            data-testid="button-refresh"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${dashboardQuery.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      {isLoading ? (
        <LoadingState />
      ) : !isConnected ? (
        <NotConnectedState />
      ) : dashboardQuery.data ? (
        <MercuryDashboard data={dashboardQuery.data} />
      ) : dashboardQuery.isError ? (
        <Card className="bg-linear-card border-linear-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-linear-error">
              <AlertCircle className="h-5 w-5" />
              <p>Error loading Mercury data. Please check your API key.</p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
