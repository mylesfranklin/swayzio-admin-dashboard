"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, RefreshCw, ChevronDown, Wallet, CreditCard, Users, DollarSign, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RevenueAreaChart } from "@/components/charts/revenue-area-chart";
import { NewsletterAnalytics } from "@/components/dashboard/newsletter-analytics";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { dashboardFixture } from "@/lib/fixtures/dashboard";
import type { StripeDashboard } from "@/server/integrations/stripe-dashboard";

const TABS = ["Overview", "Subscriptions", "Revenue", "Integrations"] as const;

export function DashboardClient({ stripe, error }: { stripe: StripeDashboard | null; error: string | null }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [period, setPeriod] = useState("30");
  const router = useRouter();
  const [isSyncing, startSync] = useTransition();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-muted">Monitor your key metrics and customer data</p>
        </div>
        <div className="mt-4 flex items-center gap-2 md:mt-0">
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="h-8 appearance-none rounded-md border border-line bg-base-200 pl-3 pr-8 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Year to date</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          </div>
          <button className="flex h-8 items-center gap-1.5 rounded-md border border-line px-3 text-sm text-ink-muted transition-colors hover:bg-base-300 hover:text-ink">
            <Download className="h-4 w-4" /> Export
          </button>
          <button
            onClick={() => startSync(() => router.refresh())}
            disabled={isSyncing}
            className="flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-content transition-colors hover:bg-brand-hover disabled:opacity-60"
          >
            <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
            {isSyncing ? "Syncing…" : "Sync"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-box border border-error/30 bg-error/10 p-4 text-sm text-error">
          Couldn’t load Stripe data: {error}
        </div>
      )}

      {/* KPI grid — clean, generalized Stripe overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Monthly Revenue (MRR)" value={stripe ? formatCurrency(stripe.mrr) : "—"} icon={Wallet} accent="brand" animationDelay={0} />
        <KpiCard title="Active Subscriptions" value={stripe ? formatNumber(stripe.activeSubscriptions) : "—"} icon={CreditCard} accent="brand" animationDelay={75} />
        <KpiCard title="Stripe Customers" value={stripe ? formatNumber(stripe.customers) : "—"} icon={Users} accent="brand" animationDelay={150} />
        <KpiCard title="Total Revenue" value={stripe ? formatCurrency(stripe.revenue12mo) : "—"} icon={DollarSign} accent="success" animationDelay={225} />
      </div>

      {/* Tabs */}
      <div>
        <div className="inline-flex items-center gap-1 rounded-lg border border-line bg-base-200 p-1">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("rounded-md px-3 py-1.5 text-sm font-medium transition-colors", tab === t ? "bg-base-300 text-ink" : "text-ink-muted hover:text-ink")}>
              {t}
            </button>
          ))}
        </div>

        {tab === "Overview" && stripe ? (
          <div className="mt-4 space-y-6">
            {/* Revenue hero */}
            <div className="rounded-box border border-line bg-base-200">
              <div className="flex items-center justify-between border-b border-line p-5">
                <div>
                  <h3 className="text-sm font-medium text-ink-muted">Revenue &amp; Growth</h3>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-ink">{formatCurrency(stripe.revenue12mo)}</p>
                  <p className="text-xs text-ink-faint">trailing 12 months</p>
                </div>
                <div className="hidden items-center gap-2 text-xs text-ink-muted sm:flex">
                  <span className="h-2 w-2 rounded-full bg-brand" /> Revenue
                </div>
              </div>
              <div className="p-5">
                <RevenueAreaChart data={stripe.revenueByMonth} label="Revenue" />
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <SummaryTile icon={<DollarSign className="h-3.5 w-3.5 text-ink-faint" />} label="Total Revenue" value={formatCurrency(stripe.revenue12mo)} />
                  <SummaryTile icon={<span className="h-1.5 w-1.5 rounded-full bg-brand" />} label="MRR" value={formatCurrency(stripe.mrr)} />
                  <SummaryTile icon={<TrendingUp className="h-3.5 w-3.5 text-success" />} label="Active Subscriptions" value={formatNumber(stripe.activeSubscriptions)} />
                </div>
              </div>
            </div>

            {/* Newsletter (fixture until Kit is wired) */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-lg font-semibold text-ink">Newsletter Analytics</h2>
                <span className="rounded bg-base-300 px-1.5 py-0.5 text-[10px] text-ink-faint">sample data — Kit not yet wired</span>
              </div>
              <NewsletterAnalytics data={dashboardFixture.newsletter} />
            </div>
          </div>
        ) : tab !== "Overview" ? (
          <div className="mt-4 p-8 text-center text-sm text-ink-muted">{tab} view coming soon — see the Stripe page for full breakdowns.</div>
        ) : null}
      </div>
    </div>
  );
}

function SummaryTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-base-300/40 p-3.5">
      <div className="mb-1 flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wide text-ink-faint">{label}</span>
      </div>
      <p className="text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}
