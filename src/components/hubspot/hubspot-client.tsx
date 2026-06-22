"use client";

import { Users, UserCheck, Handshake, Music, Building2, ExternalLink } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { CompanyLogo } from "@/components/ui/company-logo";
import { Donut } from "@/components/charts/donut";
import { AreaTrend } from "@/components/charts/area-trend";
import { formatNumber } from "@/lib/utils";
import type { HubspotDashboard } from "@/server/integrations/hubspot-dashboard";

export function HubspotClient({ data, error }: { data: HubspotDashboard | null; error: string | null }) {
  if (error || !data) {
    return (
      <div className="rounded-box border border-error/30 bg-error/10 p-6 text-sm text-error">
        Couldn’t load HubSpot data{error ? `: ${error}` : ""}.
      </div>
    );
  }

  const allEmails = data.powerUsers.map((u) => u.email).filter(Boolean).join(", ");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">HubSpot</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Artist catalog & subscriber intelligence
          {data.updatedAt && (
            <span className="text-ink-faint"> · updated {new Date(data.updatedAt).toLocaleString()}{data.stale ? " (refreshing…)" : ""}</span>
          )}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Contacts" value={formatNumber(data.totalContacts)} subtitle={`${formatNumber(data.artists)} artists`} icon={Users} accent="brand" />
        <KpiCard title="Subscribed" value={formatNumber(data.subscribed)} subtitle={`${data.subscribedConvPct}% of artists`} icon={UserCheck} accent="success" animationDelay={75} />
        <KpiCard title="Signed to Deal" value={formatNumber(data.signedToDeal)} icon={Handshake} accent="brand" animationDelay={150} />
        <KpiCard title="Total Tracks" value={formatNumber(data.totalTracks)} subtitle={`${formatNumber(data.taggedTracksTotal)} tagged · ${formatNumber(data.untaggedTracksTotal)} untagged`} icon={Music} accent="brand" animationDelay={225} />
      </div>

      {/* PRO donut + contact growth */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5">
          <h3 className="mb-2 text-sm font-medium text-ink-muted">PRO Distribution</h3>
          <p className="mb-2 text-xs text-ink-faint">{formatNumber(data.hasPro)} contacts registered</p>
          <Donut data={data.proDistribution} centerLabel="Registered" />
        </Card>
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-sm font-medium text-ink-muted">Contact Growth</h3>
          <p className="mt-1 text-3xl font-bold tracking-tight text-ink">{formatNumber(data.totalContacts)}</p>
          <p className="mb-4 text-xs text-ink-faint">new contacts per month · last 12 months</p>
          <AreaTrend data={data.growthByMonth.map((m) => ({ label: m.month, value: m.contacts }))} label="New contacts" />
        </Card>
      </div>

      {/* Power users */}
      <Card>
        <div className="flex items-center justify-between border-b border-line p-4">
          <div>
            <h3 className="text-sm font-medium text-ink">Power Users</h3>
            <p className="text-xs text-ink-faint">top artists by catalog size + recent activity</p>
          </div>
          <CopyButton label={`Copy ${data.powerUsers.length} emails`} value={allEmails} title="Copy all power-user emails" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-2 font-medium">Artist</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Tracks</th>
                <th className="px-4 py-2 font-medium">PRO</th>
                <th className="px-4 py-2 font-medium">Subscribed</th>
                <th className="px-4 py-2 font-medium">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {data.powerUsers.map((u) => (
                <tr key={u.id} className="border-t border-line/60 transition-colors hover:bg-base-300/40">
                  <td className="max-w-[180px] truncate px-4 py-2 font-medium text-ink">{u.name}</td>
                  <td className="px-4 py-2">
                    <span className="flex items-center gap-1.5">
                      <span className="max-w-[200px] truncate text-ink-muted">{u.email || "—"}</span>
                      {u.email && <CopyButton value={u.email} />}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-medium text-ink">{formatNumber(u.tracks)}</td>
                  <td className="px-4 py-2 text-ink-muted">{u.pro ?? "—"}</td>
                  <td className="px-4 py-2">{u.subscribed ? <Badge tone="success">Yes</Badge> : <Badge tone="error">No</Badge>}</td>
                  <td className="px-4 py-2 text-ink-muted">{u.lastActivity ? new Date(u.lastActivity).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Companies */}
      <Card>
        <div className="flex items-center gap-2 border-b border-line p-4">
          <Building2 className="h-4 w-4 text-ink-faint" />
          <div>
            <h3 className="text-sm font-medium text-ink">Top Companies</h3>
            <p className="text-xs text-ink-faint">business domains by catalog size (excludes personal & internal email)</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-2 font-medium">Company</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Tracks</th>
                <th className="px-4 py-2 font-medium">Users</th>
                <th className="px-4 py-2 font-medium">Subscribed</th>
                <th className="px-4 py-2 font-medium">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {data.companies.map((co) => (
                <tr key={co.domain} className="border-t border-line/60 transition-colors hover:bg-base-300/40">
                  <td className="px-4 py-2">
                    <span className="flex items-center gap-2">
                      <CompanyLogo domain={co.domain} />
                      <span className="max-w-[180px] truncate font-medium text-ink">{co.domain}</span>
                      <a
                        href={`https://${co.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Open ${co.domain}`}
                        className="p-1 text-ink-faint transition-colors hover:text-ink"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="flex items-center gap-1.5">
                      <span className="max-w-[200px] truncate text-ink-muted">{co.email || "—"}</span>
                      {co.email && <CopyButton value={co.email} />}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-medium text-ink">{formatNumber(co.tracks)}</td>
                  <td className="px-4 py-2 text-ink-muted">{co.users}</td>
                  <td className="px-4 py-2">{co.subscribed > 0 ? <Badge tone="success">Yes</Badge> : <Badge tone="error">No</Badge>}</td>
                  <td className="px-4 py-2 text-ink-muted">{co.lastActivity ? new Date(co.lastActivity).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
