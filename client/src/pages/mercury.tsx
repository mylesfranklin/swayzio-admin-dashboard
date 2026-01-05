import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark, DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Building2 } from "lucide-react";

export default function MercuryPage() {
  return (
    <div className="space-y-6" data-testid="mercury-page">
      <div>
        <h1 className="text-2xl font-bold text-white">Mercury Banking</h1>
        <p className="text-linear-text-secondary mt-1">Business banking and financial overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-linear-card border-linear-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-linear-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">—</div>
            <p className="text-xs text-linear-text-tertiary mt-1">Connect Mercury to view</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Monthly Inflow</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-linear-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">—</div>
            <p className="text-xs text-linear-text-tertiary mt-1">Connect Mercury to view</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Monthly Outflow</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-linear-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">—</div>
            <p className="text-xs text-linear-text-tertiary mt-1">Connect Mercury to view</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Pending</CardTitle>
            <CreditCard className="h-4 w-4 text-linear-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">—</div>
            <p className="text-xs text-linear-text-tertiary mt-1">Connect Mercury to view</p>
          </CardContent>
        </Card>
      </div>

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
            <Building2 className="h-8 w-8 text-linear-text-tertiary" />
            <div className="flex-1">
              <p className="text-sm text-linear-text-secondary">
                Mercury integration coming soon. You'll be able to view account balances, recent transactions, 
                and cash flow analytics directly in your dashboard.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
