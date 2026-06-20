"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, RefreshCw, ChevronDown, Wallet, CreditCard, AlertTriangle, Users, TrendingDown, ArrowRight } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RevenueAreaChart } from "@/components/charts/revenue-area-chart";
import { StatusDonut } from "@/components/charts/status-donut";
import { NewsletterAnalytics } from "@/components/dashboard/newsletter-analytics";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { dashboardFixture } from "@/lib/fixtures/dashboard";
import type { StripeDashboard } from "@/server/integrations/stripe-dashboard";

const TABS = ["Overview", "Subscriptions", "Revenue", "Integrations"] as const;

export function DashboardClient({ stripe, error }: { stripe: StripeDashboard | null; error: string | null }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Monitor your key metrics and customer data
            {stripe?.updatedAt && (
              <span className="text-ink-faint">
                {" "}· Stripe updated {new Date(stripe.updatedAt).toLocaleString()}{stripe.stale ? " (refreshing…)" : ""}
              </span>
            )}
          </p>
        </div>
        <div className="mt-4 flex items-center gap-2 md:mt-0">
          <button className="flex h-8 items-center gap-1 rounded border border-line px-3 text-sm text-ink-muted transition-colors hover:bg-base-300 hover:text-ink">
            <Download className="h-4 w-4" /> Export
          </button>
          <Link href="/analytics/stripe" className="flex h-8 items-center gap-1 rounded bg-primary px-3 text-sm font-medium text-primary-content transition-colors hover:bg-brand-hover">
            Stripe detail <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-box border border-error/30 bg-error/10 p-4 text-sm text-error">
          Couldn’t load Stripe data: {error}
        </div>
      )}

      {/* KPI grid — real Stripe data */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="MRR (run-rate)" value={stripe ? formatCurrency(stripe.mrr) : "—"} icon={Wallet} accent="brand" animationDelay={0} />
        <KpiCard title="Active Subscriptions" value={stripe ? formatNumber(stripe.activeSubscriptions) : "—"} icon={CreditCard} accent="brand" animationDelay={75} />
        <KpiCard title="Past-due Subs" value={stripe ? formatNumber(stripe.pastDueSubscriptions) : "—"} icon={AlertTriangle} accent="error" animationDelay={150} />
        <KpiCard title="Stripe Customers" value={stripe ? formatNumber(stripe.customers) : "—"} icon={Users} accent="brand" animationDelay={225} />
      </div>

      {/* The collection-reality callout — the truth the old dashboard hid */}
      {stripe && (
        <div className="rounded-box border border-warning/30 bg-warning/5 p-5">
          <div className="flex items-start gap-3">
            <TrendingDown className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">
                You’re collecting {stripe.collectionRatePct}% of your MRR run-rate.
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                Nominal run-rate is <span className="font-semibold text-ink">{formatCurrency(stripe.mrr)}/mo</span> ({formatCurrency(stripe.mrrAnnualizedRunRate)}/yr),
                but last full month you actually collected <span className="font-semibold text-ink">{formatCurrency(stripe.collectedLastFullMonth)}</span>.
                {" "}<span className="font-semibold text-error">{formatNumber(stripe.pastDueSubscriptions)} subscriptions are past-due</span>
                {" "}({formatCurrency(stripe.pastDueMrrAtRisk)}/mo at risk).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div>
        <div className="inline-flex items-center gap-1 rounded-lg border border-line bg-base-200 p-1">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("rounded-md px-3 py-1.5 text-sm font-medium transition-colors", tab === t ? "bg-base-300 text-ink" : "text-ink-muted hover:text-ink")}>
              {t}
            </button>
          ))}
        </div>

        {tab === "Overview" ? (
          <div className="mt-4 space-y-6">
            {stripe && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Real collected-revenue trend */}
                <div className="lg:col-span-2 rounded-box border border-line bg-base-200 p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-ink-muted">Collected Revenue</h3>
                      <p className="mt-1 text-3xl font-bold tracking-tight text-ink">{formatCurrency(stripe.revenue12mo)}</p>
                      <p className="text-xs text-ink-faint">trailing 12 months · real cash collected</p>
                    </div>
                  </div>
                  <RevenueAreaChart data={stripe.revenueByMonth} />
                </div>
                {/* Subscription health */}
                <div className="rounded-box border border-line bg-base-200 p-5">
                  <h3 className="mb-2 text-sm font-medium text-ink-muted">Subscription Health</h3>
                  <StatusDonut byStatus={stripe.byStatus} />
                </div>
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-lg font-semibold text-ink">Newsletter Analytics</h2>
                <span className="rounded bg-base-300 px-1.5 py-0.5 text-[10px] text-ink-faint">sample data — Kit not yet wired</span>
              </div>
              <NewsletterAnalytics data={dashboardFixture.newsletter} />
            </div>
          </div>
        ) : (
          <div className="mt-4 p-8 text-center text-sm text-ink-muted">{tab} view coming soon — see the Stripe detail page for full breakdowns.</div>
        )}
      </div>
    </div>
  );
}
