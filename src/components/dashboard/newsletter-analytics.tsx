import { ExternalLink } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import type { DashboardData } from "@/lib/fixtures/dashboard";

export function NewsletterAnalytics({ data }: { data: DashboardData["newsletter"] }) {
  const tiles = [
    { label: "Total Subscribers", value: formatNumber(data.totalSubscribers), sub: "Active" },
    { label: "Net New (90d)", value: formatNumber(data.netNew90d), sub: "Growth", up: true },
    { label: "Open Rate", value: `${data.openRate}%`, sub: `${formatNumber(data.opens)} opens` },
    { label: "Click Rate", value: `${data.clickRate}%`, sub: `${formatNumber(data.clicks)} clicks` },
  ];

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-ink">Newsletter Analytics</h2>
      <div className="rounded-box border border-line bg-base-200">
        <div className="flex items-center justify-between border-b border-line p-4">
          <span className="text-sm font-semibold text-ink">Kit Newsletter</span>
          <button className="flex items-center gap-1.5 text-xs text-ink-muted transition-colors hover:text-ink">
            Go to subscribers <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-b-box bg-line lg:grid-cols-4">
          {tiles.map((t) => (
            <div key={t.label} className="bg-base-200 p-4">
              <p className="text-xs text-ink-muted">{t.label}</p>
              <p className="mt-1 text-2xl font-bold text-ink">
                {t.value}
                {t.up && <span className="ml-1 align-middle text-xs text-success">↗</span>}
              </p>
              <p className="mt-0.5 text-[0.6875rem] text-ink-faint">{t.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
