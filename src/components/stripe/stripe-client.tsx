"use client";

import { Wallet, CreditCard, AlertTriangle, Users, TrendingDown, Repeat } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RevenueAreaChart } from "@/components/charts/revenue-area-chart";
import { StatusDonut } from "@/components/charts/status-donut";
import { CollectionRadial } from "@/components/charts/collection-radial";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { StripeDashboard } from "@/server/integrations/stripe-dashboard";

export function StripeClient({ stripe, error }: { stripe: StripeDashboard | null; error: string | null }) {
  if (error || !stripe) {
    return (
      <div className="rounded-box border border-error/30 bg-error/10 p-6 text-sm text-error">
        Couldn’t load Stripe data{error ? `: ${error}` : ""}.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Stripe</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Revenue, subscriptions & collection health
          {stripe.updatedAt && <span className="text-ink-faint"> · updated {new Date(stripe.updatedAt).toLocaleString()}{stripe.stale ? " (refreshing…)" : ""}</span>}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="MRR (run-rate)" value={formatCurrency(stripe.mrr)} icon={Wallet} accent="brand" />
        <KpiCard title="Active Subscriptions" value={formatNumber(stripe.activeSubscriptions)} icon={CreditCard} accent="brand" animationDelay={75} />
        <KpiCard title="Past-due Subs" value={formatNumber(stripe.pastDueSubscriptions)} icon={AlertTriangle} accent="error" animationDelay={150} />
        <KpiCard title="Churn (30d)" value={`${stripe.churnRatePct}%`} icon={TrendingDown} accent="warning" animationDelay={225} />
      </div>

      {/* Collection reality: radial + revenue */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-box border border-line bg-base-200 p-5">
          <h3 className="text-sm font-medium text-ink-muted">Collection Rate</h3>
          <p className="text-xs text-ink-faint">last full month ÷ MRR run-rate</p>
          <CollectionRadial pct={stripe.collectionRatePct} />
          <div className="mt-2 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg border border-line bg-base-300/50 p-2">
              <p className="text-[10px] uppercase tracking-wide text-ink-faint">Run-rate</p>
              <p className="text-sm font-semibold text-ink">{formatCurrency(stripe.mrr)}/mo</p>
            </div>
            <div className="rounded-lg border border-line bg-base-300/50 p-2">
              <p className="text-[10px] uppercase tracking-wide text-ink-faint">Collected</p>
              <p className="text-sm font-semibold text-ink">{formatCurrency(stripe.collectedLastFullMonth)}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-box border border-line bg-base-200 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-ink-muted">Collected Revenue</h3>
            <p className="mt-1 text-3xl font-bold tracking-tight text-ink">{formatCurrency(stripe.revenue12mo)}</p>
            <p className="text-xs text-ink-faint">trailing 12 months · real cash collected</p>
          </div>
          <RevenueAreaChart data={stripe.revenueByMonth} />
        </div>
      </div>

      {/* Status + at-risk */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-box border border-line bg-base-200 p-5">
          <h3 className="mb-2 text-sm font-medium text-ink-muted">Subscriptions by Status</h3>
          <StatusDonut byStatus={stripe.byStatus} />
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat label="At-risk MRR" value={`${formatCurrency(stripe.pastDueMrrAtRisk)}/mo`} sub={`${formatNumber(stripe.pastDueSubscriptions)} past-due`} tone="error" />
          <Stat label="Annualized run-rate" value={formatCurrency(stripe.mrrAnnualizedRunRate)} sub="MRR × 12" />
          <Stat label="12-mo collected" value={formatCurrency(stripe.revenue12mo)} sub="real cash" />
          <Stat label="Monthly subs" value={formatNumber(stripe.byInterval.monthly)} sub="active, monthly" icon />
          <Stat label="Annual subs" value={formatNumber(stripe.byInterval.annual)} sub="active, yearly" icon />
          <Stat label="Canceled (30d)" value={formatNumber(stripe.canceledLast30Days)} sub={`${stripe.churnRatePct}% churn`} />
        </div>
      </div>

      {/* Top subscriptions */}
      <div className="rounded-box border border-line bg-base-200">
        <div className="border-b border-line p-4">
          <h3 className="text-sm font-medium text-ink">Top Active Subscriptions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-2 font-medium">Customer</th>
                <th className="px-4 py-2 font-medium">Plan</th>
                <th className="px-4 py-2 font-medium">MRR</th>
                <th className="px-4 py-2 font-medium">Next billing</th>
              </tr>
            </thead>
            <tbody>
              {stripe.topSubscriptions.slice(0, 25).map((s) => (
                <tr key={s.id} className="border-t border-line/60 transition-colors hover:bg-base-300/40">
                  <td className="max-w-[260px] truncate px-4 py-2 text-ink">{s.customer}</td>
                  <td className="px-4 py-2 text-ink-muted">{s.plan}</td>
                  <td className="px-4 py-2 font-medium text-ink">{formatCurrency(s.amount)}/mo</td>
                  <td className="px-4 py-2 text-ink-muted">{s.nextBillingDate ? new Date(s.nextBillingDate).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, tone, icon }: { label: string; value: string; sub: string; tone?: "error"; icon?: boolean }) {
  return (
    <div className="rounded-box border border-line bg-base-200 p-4">
      <div className="flex items-center gap-1.5">
        {icon && <Repeat className="h-3 w-3 text-ink-faint" />}
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">{label}</p>
      </div>
      <p className={`mt-1 text-xl font-bold ${tone === "error" ? "text-error" : "text-ink"}`}>{value}</p>
      <p className="text-[11px] text-ink-faint">{sub}</p>
    </div>
  );
}
