"use client";

import { ExternalLink, Eye, Heart, Images, MessageCircle, MousePointerClick, Radio, Users } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { FreshnessBadge } from "@/components/dashboard/freshness-badge";
import { MetricTile } from "@/components/dashboard/metric-tile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarList } from "@/components/charts/bar-list";
import { ComboTrendChart } from "@/components/charts/combo-trend-chart";
import { formatNumber } from "@/lib/utils";
import type { InstagramDashboard } from "@/server/os/social-dashboard";

function compact(n: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

function label(metric: string) {
  return metric.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function date(value: string | null) {
  return value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";
}

function insightValue(data: InstagramDashboard, metric: string) {
  return data.accountInsights.find((row) => row.metric === metric)?.value ?? 0;
}

export function InstagramClient({ data, error }: { data: InstagramDashboard | null; error: string | null }) {
  if (error || !data) {
    return (
      <div className="rounded-box border border-error/30 bg-error/10 p-6 text-sm text-error">
        Couldn’t load Instagram data{error ? `: ${error}` : ""}.
      </div>
    );
  }

  const account = data.accounts[0];
  const mediaTotals = data.mediaInsightTotals.map((row) => ({ label: label(row.metric), value: row.value }));
  const trendCategories = data.accountInsightTrend.map((row) => row.label);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <SiInstagram className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold text-ink">Instagram</h1>
          </div>
          <p className="mt-1 text-sm text-ink-muted">Professional account growth, media performance, and insight signals.</p>
        </div>
        <FreshnessBadge label="Instagram" updatedAt={data.freshness.updatedAt} stale={data.freshness.stale} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Followers" value={formatNumber(data.snapshot.followers)} subtitle={`${formatNumber(data.snapshot.follows)} following`} icon={Users} accent="brand" />
        <KpiCard title="Synced Media" value={formatNumber(data.snapshot.syncedMedia)} subtitle={`${formatNumber(data.snapshot.totalMediaOnProfile)} on profile`} icon={Images} accent="info" animationDelay={75} />
        <KpiCard title="Profile Views" value={formatNumber(insightValue(data, "profile_views"))} subtitle="latest insight window" icon={Eye} accent="success" animationDelay={150} />
        <KpiCard title="Interactions" value={formatNumber(insightValue(data, "total_interactions"))} subtitle={`${formatNumber(insightValue(data, "accounts_engaged"))} accounts engaged`} icon={Radio} accent="warning" animationDelay={225} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-ink">Account Insight Trend</h2>
              <p className="text-xs text-ink-faint">Reach and follower count from the latest synced insight window.</p>
            </div>
            <Badge tone="info">live insights</Badge>
          </div>
          <ComboTrendChart
            categories={trendCategories}
            series={[
              { name: "Reach", type: "area", data: data.accountInsightTrend.map((row) => row.reach) },
            ]}
            format={compact}
          />
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-medium text-ink">Profile</h2>
          <div className="mt-4 flex items-center gap-3">
            {account?.profilePictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={account.profilePictureUrl} alt="" className="h-14 w-14 rounded-full border border-line object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-line bg-base-300 text-ink-faint">
                <SiInstagram className="h-6 w-6" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-ink">@{account?.username ?? "instagram"}</p>
              <p className="truncate text-xs text-ink-muted">{account?.name ?? account?.facebookPageName ?? "Connected account"}</p>
            </div>
          </div>
          {account?.biography && <p className="mt-4 line-clamp-4 text-sm text-ink-muted">{account.biography}</p>}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <MetricTile label="Media" value={formatNumber(account?.mediaCount ?? 0)} tone="brand" />
            <MetricTile label="Website Clicks" value={formatNumber(insightValue(data, "website_clicks"))} tone="success" />
          </div>
          {account?.website && (
            <a href={account.website} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs text-primary hover:text-base-content">
              Open website <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5">
          <h2 className="text-sm font-medium text-ink">Media Insight Totals</h2>
          <p className="mb-4 text-xs text-ink-faint">Summed across synced media insight rows.</p>
          <BarList data={mediaTotals.slice(0, 8)} />
        </Card>
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between gap-4 border-b border-line p-4">
            <div>
              <h2 className="text-sm font-medium text-ink">Top Media</h2>
              <p className="text-xs text-ink-faint">Ranked by visible likes plus comments.</p>
            </div>
            <Badge>{formatNumber(data.topMedia.length)} shown</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-2 font-medium">Media</th>
                  <th className="px-4 py-2 font-medium">Type</th>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Engagement</th>
                  <th className="px-4 py-2 font-medium">Link</th>
                </tr>
              </thead>
              <tbody>
                {data.topMedia.map((row) => (
                  <tr key={row.id} className="border-t border-line/60 transition-colors hover:bg-base-300/40">
                    <td className="max-w-[28rem] px-4 py-2 text-ink">
                      <p className="line-clamp-2">{row.preview || "No caption"}</p>
                      <p className="mt-1 text-xs text-ink-faint">@{row.accountUsername}</p>
                    </td>
                    <td className="px-4 py-2 text-ink-muted">
                      <Badge>{row.mediaProductType ?? row.mediaType ?? "media"}</Badge>
                    </td>
                    <td className="px-4 py-2 text-ink-muted">{date(row.timestamp)}</td>
                    <td className="px-4 py-2 tabular-nums text-ink">
                      <span className="font-medium">{formatNumber(row.engagement)}</span>
                      <span className="ml-2 text-xs text-ink-faint">{formatNumber(row.likes)} likes · {formatNumber(row.comments)} comments</span>
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
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Reach" value={formatNumber(insightValue(data, "reach"))} detail="latest account insight row" icon={<Eye className="h-4 w-4" />} />
        <MetricTile label="Likes" value={formatNumber(insightValue(data, "likes"))} detail="account-level interaction insight" icon={<Heart className="h-4 w-4" />} tone="success" />
        <MetricTile label="Comments" value={formatNumber(insightValue(data, "comments"))} detail="account-level interaction insight" icon={<MessageCircle className="h-4 w-4" />} tone="info" />
        <MetricTile label="Shares" value={formatNumber(insightValue(data, "shares"))} detail="account-level interaction insight" icon={<MousePointerClick className="h-4 w-4" />} tone="warning" />
      </div>
    </div>
  );
}
