"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, RefreshCw, Wallet, CreditCard, Users, DollarSign, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Greeting } from "@/components/dashboard/greeting";
import { RevenueAreaChart } from "@/components/charts/revenue-area-chart";
import { NewsletterAnalytics } from "@/components/dashboard/newsletter-analytics";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { dashboardFixture } from "@/lib/fixtures/dashboard";
import type { StripeDashboard } from "@/server/integrations/stripe-dashboard";

const TABS = ["Overview", "Subscriptions", "Revenue", "Integrations"] as const;
const RANGES = [
  { label: "3M", months: 3 },
  { label: "6M", months: 6 },
  { label: "12M", months: 12 },
] as const;

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function DashboardClient({ stripe, error }: { stripe: StripeDashboard | null; error: string | null }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [months, setMonths] = useState(12);
  const router = useRouter();
  const [isSyncing, startSync] = useTransition();
  const loading = !stripe && !error;

  const chart = useMemo(() => {
    const data = stripe?.revenueByMonth.slice(-months) ?? [];
    return { data, total: data.reduce((s, m) => s + m.revenue, 0) };
  }, [stripe, months]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Greeting />
          <p className="mt-1 flex items-center gap-2 text-sm text-ink-muted">
            Here&apos;s how Swayzio is doing today
            {stripe?.updatedAt && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-base-200 px-2 py-0.5 text-[11px] text-ink-faint">
                <span className={cn("h-1.5 w-1.5 rounded-full", stripe.stale ? "bg-warning" : "bg-success")} />
                Stripe · {stripe.stale ? "refreshing…" : `updated ${timeAgo(stripe.updatedAt)}`}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-9 items-center gap-1.5 rounded-md border border-line px-3 text-sm text-ink-muted transition-colors hover:bg-base-300 hover:text-ink">
            <Download className="h-4 w-4" /> Export
          </button>
          <button
            onClick={() => startSync(() => router.refresh())}
            disabled={isSyncing}
            className="flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-content shadow-glow-brand transition-colors hover:bg-brand-hover disabled:opacity-60"
          >
            <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
            {isSyncing ? "Syncing…" : "Sync"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-box border border-error/30 bg-error/10 p-4 text-sm text-error">
          Couldn&apos;t load Stripe data: {error}
        </div>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Monthly Revenue (MRR)" value={stripe ? formatCurrency(stripe.mrr) : "—"} icon={Wallet} accent="brand" animationDelay={0} isLoading={loading} />
        <KpiCard title="Active Subscriptions" value={stripe ? formatNumber(stripe.activeSubscriptions) : "—"} icon={CreditCard} accent="brand" animationDelay={75} isLoading={loading} />
        <KpiCard title="Stripe Customers" value={stripe ? formatNumber(stripe.customers) : "—"} icon={Users} accent="brand" animationDelay={150} isLoading={loading} />
        <KpiCard title="Total Revenue" value={stripe ? formatCurrency(stripe.revenue12mo) : "—"} subtitle="trailing 12 months" icon={DollarSign} accent="success" animationDelay={225} isLoading={loading} />
      </div>

      {/* Tabs */}
      <div className="inline-flex items-center gap-1 rounded-lg border border-line bg-base-200 p-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("rounded-md px-3 py-1.5 text-sm font-medium transition-colors", tab === t ? "bg-base-300 text-ink shadow-linear-sm" : "text-ink-muted hover:text-ink")}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" ? (
        <div className="space-y-6">
          {/* Revenue hero */}
          <div className="rounded-box border border-line bg-base-200">
            <div className="flex items-start justify-between gap-4 border-b border-line p-5">
              <div>
                <h3 className="text-sm font-medium text-ink-muted">Revenue &amp; Growth</h3>
                {loading ? (
                  <div className="skeleton-shimmer mt-2 h-9 w-40 rounded-md" />
                ) : (
                  <p className="mt-1 text-3xl font-bold tracking-tight text-ink">{formatCurrency(chart.total)}</p>
                )}
                <p className="text-xs text-ink-faint">last {months} months · collected</p>
              </div>
              {/* range segmented control */}
              <div className="flex items-center gap-1 rounded-lg border border-line bg-base-300/60 p-0.5">
                {RANGES.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => setMonths(r.months)}
                    className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition-colors", months === r.months ? "bg-base-100 text-ink shadow-linear-sm" : "text-ink-muted hover:text-ink")}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="skeleton-shimmer h-72 w-full rounded-box" />
              ) : (
                <RevenueAreaChart data={chart.data} label="Revenue" />
              )}
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <SummaryTile icon={<DollarSign className="h-3.5 w-3.5 text-ink-faint" />} label="Total Revenue" value={stripe ? formatCurrency(stripe.revenue12mo) : "—"} loading={loading} />
                <SummaryTile icon={<span className="h-1.5 w-1.5 rounded-full bg-brand" />} label="MRR" value={stripe ? formatCurrency(stripe.mrr) : "—"} loading={loading} />
                <SummaryTile icon={<TrendingUp className="h-3.5 w-3.5 text-success" />} label="Active Subscriptions" value={stripe ? formatNumber(stripe.activeSubscriptions) : "—"} loading={loading} />
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
      ) : (
        <div className="rounded-box border border-line bg-base-200 p-12 text-center text-sm text-ink-muted">
          {tab} view coming soon — see the Stripe page for full breakdowns.
        </div>
      )}
    </div>
  );
}

function SummaryTile({ icon, label, value, loading }: { icon: React.ReactNode; label: string; value: string; loading?: boolean }) {
  return (
    <div className="rounded-lg border border-line bg-base-300/40 p-3.5 transition-colors hover:bg-base-300/70">
      <div className="mb-1.5 flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wide text-ink-faint">{label}</span>
      </div>
      {loading ? <div className="skeleton-shimmer h-6 w-20 rounded" /> : <p className="text-lg font-semibold text-ink">{value}</p>}
    </div>
  );
}
