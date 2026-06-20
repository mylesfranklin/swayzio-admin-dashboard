"use client";

import { useState } from "react";
import { Download, RefreshCw, ChevronDown, User, Users, CreditCard, Wallet } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { NewsletterAnalytics } from "@/components/dashboard/newsletter-analytics";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { dashboardFixture as d } from "@/lib/fixtures/dashboard";

const TABS = ["Overview", "Subscriptions", "Revenue", "Integrations"] as const;

export default function DashboardPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [period, setPeriod] = useState("30");

  const kpis = [
    { title: "Stripe Customers", value: formatNumber(d.totalCustomers), change: 12.5, icon: User, accent: "brand" as const },
    { title: "HubSpot Contacts", value: formatNumber(d.connectedCustomers), change: 8.2, icon: Users, accent: "brand" as const },
    { title: "Monthly Revenue (MRR)", value: formatCurrency(d.mrr), change: 15.3, icon: Wallet, accent: "success" as const },
    { title: "Active Subscriptions", value: formatNumber(d.activeSubscriptions), change: 5.7, icon: CreditCard, accent: "brand" as const },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
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
              className="h-8 appearance-none rounded border border-line bg-base-200 pl-3 pr-8 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Year to date</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          </div>
          <button className="flex h-8 items-center gap-1 rounded border border-line px-3 text-sm text-ink-muted transition-colors hover:bg-base-300 hover:text-ink">
            <Download className="h-4 w-4" /> Export
          </button>
          <button className="flex h-8 items-center gap-1 rounded bg-primary px-3 text-sm font-medium text-primary-content transition-colors hover:bg-brand-hover">
            <RefreshCw className="h-4 w-4" /> Sync
          </button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <KpiCard key={k.title} {...k} animationDelay={i * 75} />
        ))}
      </div>

      {/* Tabs */}
      <div>
        <div className="inline-flex items-center gap-1 rounded-lg border border-line bg-base-200 p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tab === t ? "bg-base-300 text-ink" : "text-ink-muted hover:text-ink"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Overview" ? (
          <div className="mt-4 space-y-6">
            <RevenueChart
              data={d.revenueSubscriberData}
              totalRevenue={d.totalRevenue}
              mrr={d.mrr}
              subscribers={d.subscribedUsers}
            />
            <NewsletterAnalytics data={d.newsletter} />
          </div>
        ) : (
          <div className="mt-4 p-8 text-center text-sm text-ink-muted">
            {tab} analytics coming soon...
          </div>
        )}
      </div>
    </div>
  );
}
