"use client";

import { Users, UserCheck, Music, Building2, ExternalLink, CreditCard } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { CompanyLogo } from "@/components/ui/company-logo";
import { Donut } from "@/components/charts/donut";
import { ReacquireCard } from "@/components/hubspot/reacquire-card";
import { TracksUploadedCard } from "@/components/hubspot/tracks-uploaded-card";
import { PowerUsersTable } from "@/components/hubspot/power-users-table";
import { BarList } from "@/components/charts/bar-list";
import type { MonthlyUploads } from "@/server/integrations/app-tracks";
import { formatNumber } from "@/lib/utils";
import type { HubspotDashboard } from "@/server/integrations/hubspot-dashboard";

export function HubspotClient({
  data,
  error,
  payingSubscribers,
  tracksUploaded,
}: {
  data: HubspotDashboard | null;
  error: string | null;
  payingSubscribers: number | null;
  tracksUploaded: MonthlyUploads[] | null;
}) {
  if (error || !data) {
    return (
      <div className="rounded-box border border-error/30 bg-error/10 p-6 text-sm text-error">
        Couldn’t load HubSpot data{error ? `: ${error}` : ""}.
      </div>
    );
  }

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
        <KpiCard
          title="Paying Subscribers"
          value={payingSubscribers != null ? formatNumber(payingSubscribers) : "—"}
          subtitle="Stripe · source of truth"
          icon={CreditCard}
          accent="success"
          animationDelay={75}
          hint="Active Stripe subscriptions whose latest invoice is paid — the authoritative paying-subscriber count, independent of HubSpot's subscribed flag."
        />
        <KpiCard
          title="Active Subscribers"
          value={formatNumber(data.activeSubscribers.last30)}
          subtitle={`${formatNumber(data.activeSubscribers.last60)} active in 60d`}
          icon={UserCheck}
          accent="brand"
          animationDelay={150}
          hint="HubSpot subscribed contacts who logged in within 30 days (value) / 60 days (subtitle), from last_login. Caveat: HubSpot's last_login is synced from the app and currently lags (newest value ~Jun 3), so this undercounts — the app DB is the true activity source."
        />
        <KpiCard title="Total Tracks" value={formatNumber(data.totalTracks)} subtitle={`${formatNumber(data.taggedTracksTotal)} tagged · ${formatNumber(data.untaggedTracksTotal)} untagged`} icon={Music} accent="brand" animationDelay={225} />
      </div>

      {/* Reacquire candidates — catalog-builders who aren't subscribed, by recency */}
      <ReacquireCard data={data.reacquire} />

      {/* Audience & acquisition breakdowns — ranked bar lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-medium text-ink-muted">Acquisition Channels</h3>
          <BarList data={data.acquisitionChannels} />
        </Card>
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-medium text-ink-muted">Roles</h3>
          <BarList data={data.roleDistribution} />
        </Card>
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-medium text-ink-muted">Company Types</h3>
          <BarList data={data.companyTypeDistribution} />
        </Card>
      </div>

      {/* PRO donut + tracks uploaded */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5">
          <h3 className="mb-2 text-sm font-medium text-ink-muted">PRO Distribution</h3>
          <p className="mb-2 text-xs text-ink-faint">{formatNumber(data.hasPro)} contacts registered</p>
          <Donut data={data.proDistribution} centerLabel="Registered" />
        </Card>
        <div className="lg:col-span-2">
          <TracksUploadedCard data={tracksUploaded} />
        </div>
      </div>

      {/* Power users */}
      <PowerUsersTable users={data.powerUsers} />

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
