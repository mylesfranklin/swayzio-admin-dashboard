"use client";

import { ArrowDownLeft, ArrowUpRight, Banknote, CreditCard, ExternalLink, Landmark, ReceiptText, TimerReset, Wallet } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { FreshnessBadge } from "@/components/dashboard/freshness-badge";
import { MetricTile } from "@/components/dashboard/metric-tile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarList } from "@/components/charts/bar-list";
import { ComboTrendChart } from "@/components/charts/combo-trend-chart";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { MercuryDashboard } from "@/server/os/mercury-dashboard";

function compactCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(n);
}

function date(value: string | null) {
  return value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";
}

function signedCurrency(value: number) {
  const formatted = formatCurrency(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

export function MercuryClient({ data, error }: { data: MercuryDashboard | null; error: string | null }) {
  if (error || !data) {
    return (
      <div className="rounded-box border border-error/30 bg-error/10 p-6 text-sm text-error">
        Couldn’t load Mercury data{error ? `: ${error}` : ""}.
      </div>
    );
  }

  const spendBars = data.spendByCategory.map((row) => ({ label: row.category, value: row.spend }));
  const counterpartyBars = data.counterparties.map((row) => ({ label: row.counterparty, value: Math.max(row.inflow, row.outflow, Math.abs(row.net)) }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold text-ink">Mercury</h1>
          </div>
          <p className="mt-1 text-sm text-ink-muted">Cash position, banking activity, spend, counterparties, and operational controls.</p>
        </div>
        <FreshnessBadge label="Mercury" updatedAt={data.freshness.updatedAt} stale={data.freshness.stale} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Available Cash" value={formatCurrency(data.snapshot.availableBalance)} subtitle={`${formatNumber(data.snapshot.activeAccounts)} active accounts`} icon={Wallet} accent="success" />
        <KpiCard title="Current Balance" value={formatCurrency(data.snapshot.currentBalance)} subtitle={`${formatNumber(data.snapshot.accounts)} total accounts`} icon={Landmark} accent="brand" animationDelay={75} />
        <KpiCard title="Runway" value={data.runway?.runwayMonths != null ? `${data.runway.runwayMonths} mo` : "—"} subtitle={`${formatCurrency(data.runway?.estimatedMonthlyBurn ?? 0)}/mo burn`} icon={TimerReset} accent="warning" animationDelay={150} />
        <KpiCard title="Transactions" value={formatNumber(data.snapshot.transactions)} subtitle={`latest ${date(data.snapshot.latestTransactionAt)}`} icon={ReceiptText} accent="info" animationDelay={225} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-ink">Cashflow</h2>
              <p className="text-xs text-ink-faint">Monthly inflow, outflow, and net movement from Mercury transactions.</p>
            </div>
            <Badge tone={data.runway?.netCashflow90d && data.runway.netCashflow90d >= 0 ? "success" : "warning"}>
              90d net {signedCurrency(data.runway?.netCashflow90d ?? 0)}
            </Badge>
          </div>
          <ComboTrendChart
            categories={data.cashflow.map((row) => row.label)}
            series={[
              { name: "Inflow", type: "column", data: data.cashflow.map((row) => row.inflow) },
              { name: "Outflow", type: "column", data: data.cashflow.map((row) => row.outflow) },
              { name: "Net", type: "line", data: data.cashflow.map((row) => row.netCashflow) },
            ]}
            format={compactCurrency}
          />
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-medium text-ink">Runway Inputs</h2>
          <p className="mb-4 text-xs text-ink-faint">Computed from available cash and trailing 90-day movement.</p>
          <div className="grid grid-cols-1 gap-3">
            <MetricTile label="Available" value={formatCurrency(data.runway?.availableBalance ?? 0)} tone="success" />
            <MetricTile label="90d Inflow" value={formatCurrency(data.runway?.inflow90d ?? 0)} tone="brand" icon={<ArrowDownLeft className="h-4 w-4" />} />
            <MetricTile label="90d Outflow" value={formatCurrency(data.runway?.outflow90d ?? 0)} tone="warning" icon={<ArrowUpRight className="h-4 w-4" />} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5">
          <h2 className="text-sm font-medium text-ink">Spend by Category</h2>
          <p className="mb-4 text-xs text-ink-faint">Outbound spend grouped by Mercury/custom category.</p>
          <BarList data={spendBars} />
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-medium text-ink">Counterparty Movement</h2>
          <p className="mb-4 text-xs text-ink-faint">Largest vendors/customers by absolute movement.</p>
          <BarList data={counterpartyBars} barClassName="bg-info/15" />
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-medium text-ink">Account Balances</h2>
          <p className="mb-4 text-xs text-ink-faint">Current balance by depository account.</p>
          <div className="space-y-3">
            {data.accounts.map((account) => (
              <div key={account.id} className="rounded-lg border border-line bg-base-300/40 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{account.name}</p>
                    <p className="text-xs text-ink-faint">{account.kind ?? account.type ?? "account"} · {account.status ?? "unknown"}</p>
                  </div>
                  {account.dashboardLink && (
                    <a href={account.dashboardLink} target="_blank" rel="noreferrer" className="text-primary hover:text-base-content">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-ink-faint">Available</p>
                    <p className="font-medium tabular-nums text-ink">{formatCurrency(account.availableBalance)}</p>
                  </div>
                  <div>
                    <p className="text-ink-faint">Current</p>
                    <p className="font-medium tabular-nums text-ink">{formatCurrency(account.currentBalance)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-4 border-b border-line p-4">
          <div>
            <h2 className="text-sm font-medium text-ink">Recent Transactions</h2>
            <p className="text-xs text-ink-faint">Latest Mercury activity across accounts.</p>
          </div>
          <Badge>{formatNumber(data.recentTransactions.length)} shown</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-2 font-medium">Transaction</th>
                <th className="px-4 py-2 font-medium">Category</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Amount</th>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Link</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTransactions.map((row) => (
                <tr key={row.id} className="border-t border-line/60 transition-colors hover:bg-base-300/40">
                  <td className="max-w-[24rem] px-4 py-2">
                    <p className="truncate font-medium text-ink">{row.counterparty ?? row.bankDescription ?? "Unknown"}</p>
                    <p className="truncate text-xs text-ink-faint">{row.note ?? row.bankDescription ?? row.kind ?? "Mercury transaction"}</p>
                  </td>
                  <td className="px-4 py-2 text-ink-muted">{row.category ?? "—"}</td>
                  <td className="px-4 py-2"><Badge tone={row.status === "sent" ? "success" : "neutral"}>{row.status ?? "unknown"}</Badge></td>
                  <td className={row.amount >= 0 ? "px-4 py-2 font-medium tabular-nums text-success" : "px-4 py-2 font-medium tabular-nums text-ink"}>
                    {signedCurrency(row.amount)}
                  </td>
                  <td className="px-4 py-2 text-ink-muted">{date(row.transactionAt)}</td>
                  <td className="px-4 py-2">
                    {row.dashboardLink ? (
                      <a href={row.dashboardLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:text-base-content">
                        Open <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-center gap-2 border-b border-line p-4">
            <CreditCard className="h-4 w-4 text-ink-faint" />
            <div>
              <h2 className="text-sm font-medium text-ink">Cards & Statements</h2>
              <p className="text-xs text-ink-faint">Operational banking objects visible through the read-only API.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
            <div className="border-b border-line p-4 md:border-b-0 md:border-r">
              <p className="mb-3 text-[0.6875rem] font-medium uppercase tracking-wider text-ink-faint">Cards</p>
              <div className="space-y-2">
                {data.cards.slice(0, 8).map((card) => (
                  <div key={card.id} className="flex items-center justify-between gap-3 rounded-md px-2.5 py-2 transition-colors hover:bg-base-300/50">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ink">{card.nameOnCard ?? "Card"}</p>
                      <p className="text-xs text-ink-faint">{card.network ?? "network"} · •••• {card.lastFour ?? "—"}</p>
                    </div>
                    <Badge tone={card.status === "active" ? "success" : "neutral"}>{card.status ?? "unknown"}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4">
              <p className="mb-3 text-[0.6875rem] font-medium uppercase tracking-wider text-ink-faint">Statements</p>
              <div className="space-y-2">
                {data.statements.slice(0, 8).map((statement) => (
                  <div key={`${statement.accountName}-${statement.id}`} className="flex items-center justify-between gap-3 rounded-md px-2.5 py-2 transition-colors hover:bg-base-300/50">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ink">{statement.accountName ?? "Statement"}</p>
                      <p className="text-xs text-ink-faint">{date(statement.startDate)} – {date(statement.endDate)} · {formatCurrency(statement.endingBalance)}</p>
                    </div>
                    {statement.downloadUrl && (
                      <a href={statement.downloadUrl} target="_blank" rel="noreferrer" className="text-primary hover:text-base-content">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 border-b border-line p-4">
            <Banknote className="h-4 w-4 text-ink-faint" />
            <div>
              <h2 className="text-sm font-medium text-ink">Audit Events</h2>
              <p className="text-xs text-ink-faint">Recent Mercury source changes.</p>
            </div>
          </div>
          <div className="divide-y divide-line/60">
            {data.events.slice(0, 8).map((event) => (
              <div key={event.id} className="p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium text-ink">{event.resourceType ?? "resource"}</p>
                  <Badge>{event.operationType ?? "event"}</Badge>
                </div>
                <p className="mt-1 text-xs text-ink-faint">{date(event.occurredAt)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
