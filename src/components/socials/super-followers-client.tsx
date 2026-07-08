"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Filter, MessageCircle, Search, Sparkles, Users } from "lucide-react";
import { SiFacebook, SiInstagram } from "react-icons/si";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { FreshnessBadge } from "@/components/dashboard/freshness-badge";
import { MetricTile } from "@/components/dashboard/metric-tile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import type { SuperFollower, SuperFollowersDashboard } from "@/server/os/social-dashboard";

type Recency = "all" | "7" | "30" | "90";
type Sort = "impact" | "recent" | "followers" | "engagements" | "comments";

const tiers = ["all", "major", "high", "emerging", "niche", "unknown"] as const;
const sources = ["all", "comment", "dm", "mention"] as const;
const actions = ["all", "Partnership lead", "Warm engager", "Recent touch", "DM follow-up", "Monitor"] as const;

function compact(n: number | null) {
  if (n == null) return "N/A";
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

function date(value: string | null | undefined) {
  return value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }) : "N/A";
}

function platformIcon(platform: string) {
  if (platform === "instagram") return <SiInstagram className="h-3.5 w-3.5 text-primary" />;
  if (platform === "facebook") return <SiFacebook className="h-3.5 w-3.5 text-primary" />;
  return <Users className="h-3.5 w-3.5 text-ink-faint" />;
}

function sourceMatches(row: SuperFollower, source: (typeof sources)[number]) {
  if (source === "all") return true;
  if (source === "comment") return row.commentCount > 0;
  if (source === "dm") return row.dmCount > 0;
  return row.mentionCount > 0;
}

function recencyMatches(row: SuperFollower, recency: Recency) {
  if (recency === "all") return true;
  if (!row.latestEngagementAt) return false;
  const days = Number(recency);
  return Date.now() - new Date(row.latestEngagementAt).getTime() <= days * 24 * 60 * 60 * 1000;
}

export function SuperFollowersClient({ data, error }: { data: SuperFollowersDashboard | null; error: string | null }) {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<(typeof tiers)[number]>("all");
  const [source, setSource] = useState<(typeof sources)[number]>("all");
  const [action, setAction] = useState<(typeof actions)[number]>("all");
  const [recency, setRecency] = useState<Recency>("all");
  const [minFollowers, setMinFollowers] = useState(0);
  const [sort, setSort] = useState<Sort>("impact");

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.followers
      .filter((row) => {
        const text = [row.username, row.displayName, row.biography, row.website, row.suggestedAction].filter(Boolean).join(" ").toLowerCase();
        return !q || text.includes(q);
      })
      .filter((row) => tier === "all" || row.followerTier === tier)
      .filter((row) => sourceMatches(row, source))
      .filter((row) => action === "all" || row.suggestedAction === action)
      .filter((row) => recencyMatches(row, recency))
      .filter((row) => (row.followerCount ?? 0) >= minFollowers)
      .sort((a, b) => {
        if (sort === "recent") return new Date(b.latestEngagementAt ?? 0).getTime() - new Date(a.latestEngagementAt ?? 0).getTime();
        if (sort === "followers") return (b.followerCount ?? -1) - (a.followerCount ?? -1);
        if (sort === "engagements") return b.totalEngagements - a.totalEngagements;
        if (sort === "comments") return b.commentCount - a.commentCount;
        return b.impactScore - a.impactScore;
      });
  }, [action, data, minFollowers, query, recency, sort, source, tier]);

  if (error || !data) {
    return (
      <div className="rounded-box border border-error/30 bg-error/10 p-6 text-sm text-error">
        Couldn't load super followers{error ? `: ${error}` : ""}.
      </div>
    );
  }

  const visibleEngagements = filtered.reduce((sum, row) => sum + row.totalEngagements, 0);
  const visibleHighImpact = filtered.filter((row) => (row.followerCount ?? 0) >= 5000).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold text-ink">Super Followers</h1>
          </div>
          <p className="mt-1 text-sm text-ink-muted">High-impact engaged accounts ranked by reach, recency, frequency, and relationship depth.</p>
        </div>
        <FreshnessBadge label="Social engagement" updatedAt={data.freshness.updatedAt} stale={data.freshness.stale} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Known Engagers" value={formatNumber(data.summary.actors)} subtitle={`${formatNumber(data.summary.enriched)} enriched`} icon={Users} accent="brand" />
        <KpiCard title="High Impact" value={formatNumber(data.summary.highImpact)} subtitle={`${formatNumber(data.summary.major)} major accounts`} icon={Sparkles} accent="success" animationDelay={75} />
        <KpiCard title="Recent 30d" value={formatNumber(data.summary.recent30d)} subtitle="latest known touch" icon={MessageCircle} accent="info" animationDelay={150} />
        <KpiCard title="Engagements" value={formatNumber(data.summary.totalEngagements)} subtitle="comments, DMs, mentions" icon={Filter} accent="warning" animationDelay={225} />
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.4fr_repeat(6,minmax(0,1fr))]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search username, bio, website, action..."
              className="h-9 w-full rounded-field border border-line bg-base-300 pl-8 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand"
            />
          </label>
          <Select label="Tier" value={tier} onChange={(v) => setTier(v as typeof tier)} options={tiers} />
          <Select label="Source" value={source} onChange={(v) => setSource(v as typeof source)} options={sources} />
          <Select label="Recency" value={recency} onChange={(v) => setRecency(v as Recency)} options={["all", "7", "30", "90"]} />
          <Select label="Action" value={action} onChange={(v) => setAction(v as typeof action)} options={actions} />
          <Select label="Sort" value={sort} onChange={(v) => setSort(v as Sort)} options={["impact", "recent", "followers", "engagements", "comments"]} />
          <label className="flex h-9 items-center gap-2 rounded-field border border-line bg-base-300 px-2.5">
            <span className="text-[0.625rem] uppercase tracking-wide text-ink-faint">Min</span>
            <input
              type="number"
              min={0}
              step={1000}
              value={minFollowers}
              onChange={(e) => setMinFollowers(Number(e.target.value || 0))}
              className="min-w-0 flex-1 bg-transparent text-sm tabular-nums text-ink outline-none"
            />
          </label>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricTile label="Visible Rows" value={formatNumber(filtered.length)} detail={`${formatNumber(visibleHighImpact)} high-impact in current filter`} tone="brand" />
        <MetricTile label="Visible Touches" value={formatNumber(visibleEngagements)} detail="sum of comments, DMs, and mentions after filters" tone="success" />
        <MetricTile label="Minimum Followers" value={formatNumber(minFollowers)} detail={minFollowers ? "active threshold" : "all known accounts included"} tone="info" />
      </div>

      <Card>
        <div className="flex items-center justify-between gap-4 border-b border-line p-4">
          <div>
            <h2 className="text-sm font-medium text-ink">Ranked Engagement Table</h2>
            <p className="text-xs text-ink-faint">Designed for influencer, customer-love, and partnership follow-up workflows.</p>
          </div>
          <Badge tone="info">{formatNumber(filtered.length)} matched</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-2 font-medium">Account</th>
                <th className="px-4 py-2 font-medium">Impact</th>
                <th className="px-4 py-2 font-medium">Followers</th>
                <th className="px-4 py-2 font-medium">Touches</th>
                <th className="px-4 py-2 font-medium">Latest</th>
                <th className="px-4 py-2 font-medium">Recent Context</th>
                <th className="px-4 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 250).map((row) => (
                <tr key={row.id} className="border-t border-line/60 align-top transition-colors hover:bg-base-300/40">
                  <td className="min-w-[18rem] px-4 py-3">
                    <div className="flex items-start gap-3">
                      {row.profilePictureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.profilePictureUrl} alt="" className="h-10 w-10 rounded-full border border-line object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-base-300">
                          {platformIcon(row.platform)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          {platformIcon(row.platform)}
                          <p className="truncate font-medium text-ink">@{row.username ?? "unknown"}</p>
                          {row.profileUrl && (
                            <a href={row.profileUrl} target="_blank" rel="noreferrer" className="text-primary hover:text-base-content">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                        <p className="truncate text-xs text-ink-muted">{row.displayName ?? row.website ?? row.platform}</p>
                        {row.biography && <p className="mt-1 line-clamp-2 max-w-[24rem] text-xs text-ink-faint">{row.biography}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold tabular-nums text-ink">{row.impactScore.toFixed(1)}</p>
                    <Badge tone={row.followerTier === "major" || row.followerTier === "high" ? "success" : row.followerTier === "unknown" ? "neutral" : "info"}>
                      {row.followerTier}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-ink">
                    <p className="font-medium">{compact(row.followerCount)}</p>
                    <p className="text-xs text-ink-faint">{row.mediaCount != null ? `${formatNumber(row.mediaCount)} media` : row.isEnriched ? "enriched" : "not enriched"}</p>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-ink-muted">
                    <p><span className="font-medium text-ink">{formatNumber(row.totalEngagements)}</span> total</p>
                    <p className="text-xs text-ink-faint">{formatNumber(row.commentCount)} comments / {formatNumber(row.dmCount)} DMs / {formatNumber(row.mentionCount)} mentions</p>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{date(row.latestEngagementAt)}</td>
                  <td className="min-w-[22rem] px-4 py-3">
                    <div className="space-y-1.5">
                      {row.recentEngagements.slice(0, 2).map((engagement, i) => (
                        <div key={`${row.id}-${i}`} className="rounded-md border border-line/60 bg-base-300/30 px-2.5 py-2">
                          <div className="mb-1 flex items-center justify-between gap-3">
                            <span className="text-[0.625rem] uppercase tracking-wide text-ink-faint">{engagement.type?.replaceAll("_", " ") ?? "touch"}</span>
                            <span className="text-[0.625rem] text-ink-faint">{date(engagement.occurred_at)}</span>
                          </div>
                          <p className="line-clamp-2 text-xs text-ink-muted">{engagement.message || "No message text"}</p>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={row.suggestedAction === "Partnership lead" ? "success" : row.suggestedAction === "Warm engager" ? "info" : "neutral"}>
                      {row.suggestedAction}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}) {
  return (
    <label className="flex h-9 items-center gap-2 rounded-field border border-line bg-base-300 px-2.5">
      <span className="text-[0.625rem] uppercase tracking-wide text-ink-faint">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-base-200 text-ink">
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
