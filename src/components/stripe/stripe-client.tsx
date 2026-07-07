"use client";

import { Wallet, CreditCard, DollarSign, Percent } from "lucide-react";
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

      {/* KPIs — the honest money story: collected → collectible → booked (see docs/STRIPE-MRR-INVESTIGATION.md) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Collected Last Month"
          value={formatCurrency(stripe.collectedLastFullMonth)}
          icon={DollarSign}
          accent="success"
          hint="Real cash collected in the last full month (succeeded charges net of refunds). The ground truth."
        />
        <KpiCard
          title="Collectible MRR"
          value={stripe.collectibleMrr != null ? formatCurrency(stripe.collectibleMrr) : "—"}
          icon={Wallet}
          accent="brand"
          animationDelay={75}
          hint="Subscriptions whose billing is still live: paying subs plus past-due subs in active dunning. This is ≈ the MRR the Stripe app shows."
        />
        <KpiCard
          title="Booked MRR"
          value={formatCurrency(stripe.mrr)}
          icon={CreditCard}
          accent="info"
          animationDelay={150}
          hint="List price of every active-status subscription — includes the paused-collection base whose invoices void every cycle and never collect."
        />
        <KpiCard
          title="Collection Rate"
          value={`${stripe.collectionRatePct}%`}
          icon={Percent}
          accent="warning"
          animationDelay={225}
          subtitle="collected ÷ booked"
        />
      </div>

      {/* Billing reality */}
      <div className="rounded-box border border-line bg-base-200 p-4">
        <p className="mb-3 text-[0.6875rem] font-medium uppercase tracking-wider text-ink-faint">Billing reality</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <RealityTile
            label="Actually paying"
            value={`${formatNumber(stripe.payingSubscriptions)} subs`}
            detail={`${stripe.payingRatePct}% of ${formatNumber(stripe.activeSubscriptions)} active · ${formatCurrency(stripe.payingMrr)}/mo`}
            tone="success"
          />
          <RealityTile
            label="Broken billing"
            value={`${formatNumber(stripe.voidInvoiceSubscriptions)} subs`}
            detail="active, latest invoice voided (paused collection)"
            tone="error"
          />
          <RealityTile
            label="Past-due at risk"
            value={`${formatCurrency(stripe.pastDueMrrAtRisk)}/mo`}
            detail={`${formatNumber(stripe.pastDueSubscriptions)} subs in/after dunning`}
            tone="warning"
          />
          <RealityTile
            label="Churn (30d)"
            value={`${stripe.churnRatePct}%`}
            detail={`${formatNumber(stripe.canceledLast30Days)} canceled`}
            tone="neutral"
          />
          <RealityTile
            label="Customers"
            value={formatNumber(stripe.customers)}
            detail={`${formatCurrency(stripe.revenue12mo)} collected · 12mo`}
            tone="neutral"
          />
        </div>
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

const realityTones = {
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  neutral: "bg-ink-faint",
} as const;

function RealityTile({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: keyof typeof realityTones;
}) {
  return (
    <div className="rounded-lg border border-line bg-base-300/40 p-3">
      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${realityTones[tone]}`} />
        <p className="text-[0.6875rem] font-medium uppercase tracking-wider text-ink-faint">{label}</p>
      </div>
      <p className="mt-1.5 text-lg font-bold leading-none tracking-tight text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink-muted">{detail}</p>
    </div>
  );
}
