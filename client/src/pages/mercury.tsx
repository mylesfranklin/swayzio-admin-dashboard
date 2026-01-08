import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark, DollarSign, AlertCircle, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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


function MercuryDashboard({ data }: { data: MercuryDashboardStats }) {
  const activeAccounts = data.accounts.filter(account => account.currentBalance > 0);
  
  return (
    <div className="space-y-6">
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
            Across {activeAccounts.length} active account{activeAccounts.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      {activeAccounts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeAccounts.map((account) => (
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
      <Card className="bg-linear-card border-linear-border">
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24 bg-linear-border" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 bg-linear-border" />
          <Skeleton className="h-3 w-20 bg-linear-border mt-2" />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-linear-card border-linear-border">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32 bg-linear-border" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-24 bg-linear-border" />
              <Skeleton className="h-3 w-16 bg-linear-border mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
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
