"use client";

import { ExternalLink, Megaphone, MousePointerClick, Radio, Share2, ThumbsUp, Users } from "lucide-react";
import { SiFacebook } from "react-icons/si";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { FreshnessBadge } from "@/components/dashboard/freshness-badge";
import { MetricTile } from "@/components/dashboard/metric-tile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarList } from "@/components/charts/bar-list";
import { ComboTrendChart } from "@/components/charts/combo-trend-chart";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { FacebookDashboard } from "@/server/os/social-dashboard";

function compact(n: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

function pct(n: number) {
  return `${Number(n ?? 0).toFixed(2)}%`;
}

function money(n: number, digits = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

function date(value: string | null) {
  return value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";
}

export function FacebookClient({ data, error }: { data: FacebookDashboard | null; error: string | null }) {
  if (error || !data) {
    return (
      <div className="rounded-box border border-error/30 bg-error/10 p-6 text-sm text-error">
        Couldn’t load Facebook data{error ? `: ${error}` : ""}.
      </div>
    );
  }

  const totalEngagement = data.snapshot.reactions + data.snapshot.comments + data.snapshot.shares;
  const spend = data.adsSummary.spend;
  const clicks = data.adsSummary.clicks;
  const impressions = data.adsSummary.impressions;
  const campaignBars = data.campaigns.slice(0, 8).map((row) => ({ label: row.name, value: row.spend }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <SiFacebook className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold text-ink">Facebook</h1>
          </div>
          <p className="mt-1 text-sm text-ink-muted">Organic Page performance and Meta campaign intelligence.</p>
        </div>
        <FreshnessBadge label="Facebook" updatedAt={data.freshness.updatedAt} stale={data.freshness.stale} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Followers" value={formatNumber(data.snapshot.followers)} subtitle={`${formatNumber(data.snapshot.fans)} fans`} icon={Users} accent="brand" />
        <KpiCard title="Synced Posts" value={formatNumber(data.snapshot.posts)} subtitle={`latest ${date(data.snapshot.latestPostAt)}`} icon={Megaphone} accent="info" animationDelay={75} />
        <KpiCard title="Organic Engagement" value={formatNumber(totalEngagement)} subtitle={`${formatNumber(data.snapshot.shares)} shares`} icon={Radio} accent="success" animationDelay={150} />
        <KpiCard title="Ad Spend" value={formatCurrency(spend)} subtitle={`${formatNumber(clicks)} clicks · ${compact(impressions)} impressions`} icon={MousePointerClick} accent="warning" animationDelay={225} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-ink">Paid Performance</h2>
              <p className="text-xs text-ink-faint">Daily spend, clicks, and reach from campaign-level Meta Ads insights.</p>
            </div>
            <Badge tone="info">{formatNumber(data.adsDaily.length)} days</Badge>
          </div>
          <ComboTrendChart
            categories={data.adsDaily.map((row) => row.label)}
            series={[
              { name: "Spend", type: "column", data: data.adsDaily.map((row) => row.spend) },
              { name: "Clicks", type: "line", data: data.adsDaily.map((row) => row.clicks) },
            ]}
            format={compact}
          />
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-medium text-ink">Campaign Spend</h2>
          <p className="mb-4 text-xs text-ink-faint">Top campaigns in the synced lookback window.</p>
          <BarList data={campaignBars} barClassName="bg-brand/20" />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between gap-4 border-b border-line p-4">
            <div>
              <h2 className="text-sm font-medium text-ink">Top Organic Posts</h2>
              <p className="text-xs text-ink-faint">Ranked by reactions, comments, and shares.</p>
            </div>
            <Badge>{formatNumber(data.topPosts.length)} shown</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-2 font-medium">Post</th>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Engagement</th>
                  <th className="px-4 py-2 font-medium">Link</th>
                </tr>
              </thead>
              <tbody>
                {data.topPosts.map((row) => (
                  <tr key={row.id} className="border-t border-line/60 transition-colors hover:bg-base-300/40">
                    <td className="max-w-[32rem] px-4 py-2">
                      <p className="line-clamp-2 text-ink">{row.preview || "No post text"}</p>
                      <p className="mt-1 text-xs text-ink-faint">{row.pageName}</p>
                    </td>
                    <td className="px-4 py-2 text-ink-muted">{date(row.createdAt)}</td>
                    <td className="px-4 py-2 tabular-nums text-ink">
                      <span className="font-medium">{formatNumber(row.engagement)}</span>
                      <span className="ml-2 text-xs text-ink-faint">{formatNumber(row.reactions)} reactions · {formatNumber(row.comments)} comments · {formatNumber(row.shares)} shares</span>
                    </td>
                    <td className="px-4 py-2">
                      {row.permalink ? (
                        <a href={row.permalink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:text-base-content">
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

        <div className="grid grid-cols-1 gap-4">
          <MetricTile label="CTR" value={impressions > 0 ? pct((clicks / impressions) * 100) : "—"} detail="clicks divided by impressions" tone="success" icon={<MousePointerClick className="h-4 w-4" />} />
          <MetricTile label="Reactions" value={formatNumber(data.snapshot.reactions)} detail="visible organic post reactions" icon={<ThumbsUp className="h-4 w-4" />} />
          <MetricTile label="Shares" value={formatNumber(data.snapshot.shares)} detail="organic post distribution signal" tone="warning" icon={<Share2 className="h-4 w-4" />} />
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-4 border-b border-line p-4">
          <div>
            <h2 className="text-sm font-medium text-ink">Campaign Summary</h2>
            <p className="text-xs text-ink-faint">Campaign economics across the synced Meta Ads window.</p>
          </div>
          <Badge tone="info">Meta Ads</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-2 font-medium">Campaign</th>
                <th className="px-4 py-2 font-medium">Spend</th>
                <th className="px-4 py-2 font-medium">Impressions</th>
                <th className="px-4 py-2 font-medium">Clicks</th>
                <th className="px-4 py-2 font-medium">CTR</th>
                <th className="px-4 py-2 font-medium">CPC</th>
                <th className="px-4 py-2 font-medium">CPM</th>
              </tr>
            </thead>
            <tbody>
              {data.campaigns.map((row) => (
                <tr key={row.id} className="border-t border-line/60 transition-colors hover:bg-base-300/40">
                  <td className="max-w-[22rem] px-4 py-2">
                    <p className="truncate font-medium text-ink">{row.name}</p>
                    <p className="text-xs text-ink-faint">{row.accountName ?? "Ad account"} · {date(row.firstSeen)} – {date(row.lastSeen)}</p>
                  </td>
                  <td className="px-4 py-2 tabular-nums text-ink">{formatCurrency(row.spend)}</td>
                  <td className="px-4 py-2 tabular-nums text-ink-muted">{formatNumber(row.impressions)}</td>
                  <td className="px-4 py-2 tabular-nums text-ink-muted">{formatNumber(row.clicks)}</td>
                  <td className="px-4 py-2 tabular-nums text-ink-muted">{pct(row.ctr)}</td>
                  <td className="px-4 py-2 tabular-nums text-ink-muted">{money(row.cpc, 2)}</td>
                  <td className="px-4 py-2 tabular-nums text-ink-muted">{money(row.cpm, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
