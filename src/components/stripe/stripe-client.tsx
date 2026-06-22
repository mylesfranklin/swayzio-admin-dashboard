"use client";

import { Wallet, CreditCard, Users, DollarSign } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RevenueAreaChart } from "@/components/charts/revenue-area-chart";
import { StatusDonut } from "@/components/charts/status-donut";
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
          Revenue, subscriptions &amp; customers
          {stripe.updatedAt && <span className="text-ink-faint"> · updated {new Date(stripe.updatedAt).toLocaleString()}{stripe.stale ? " (refreshing…)" : ""}</span>}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Monthly Revenue (MRR)" value={formatCurrency(stripe.mrr)} icon={Wallet} accent="brand" />
        <KpiCard title="Active Subscriptions" value={formatNumber(stripe.activeSubscriptions)} icon={CreditCard} accent="brand" animationDelay={75} />
        <KpiCard title="Stripe Customers" value={formatNumber(stripe.customers)} icon={Users} accent="brand" animationDelay={150} />
        <KpiCard title="Total Revenue" value={formatCurrency(stripe.revenue12mo)} icon={DollarSign} accent="success" animationDelay={225} />
      </div>

      {/* Revenue + subscription mix */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-box border border-line bg-base-200 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-ink-muted">Revenue</h3>
            <p className="mt-1 text-3xl font-bold tracking-tight text-ink">{formatCurrency(stripe.revenue12mo)}</p>
            <p className="text-xs text-ink-faint">trailing 12 months</p>
          </div>
          <RevenueAreaChart data={stripe.revenueByMonth} label="Revenue" />
        </div>
        <div className="rounded-box border border-line bg-base-200 p-5">
          <h3 className="mb-2 text-sm font-medium text-ink-muted">Subscriptions</h3>
          <StatusDonut byStatus={stripe.byStatus} />
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
                  <td className="max-w-[16.25rem] truncate px-4 py-2 text-ink">{s.customer}</td>
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
