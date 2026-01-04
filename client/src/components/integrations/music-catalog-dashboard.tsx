import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DonutChart, DonutLegend } from "@/components/ui/donut-chart";
import { BarChart } from "@/components/ui/bar-chart";
import { DataTable, StatusBadge } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Music,
  Tag,
  UserCheck,
  UserX,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";

interface MusicCatalogContact {
  id: string;
  name: string;
  artistName: string;
  email: string;
  taggedTracks: number;
  untaggedTracks: number;
  pro: string;
  lastActivity: string;
  subscribed: boolean;
  signedToDeal: boolean;
}

interface MusicCatalogDashboardProps {
  totalUsers: number;
  subscribedUsers: number;
  signedToDeals: number;
  totalTracks: number;
  taggedTracks: number;
  untaggedTracks: number;
  catalogHealth: number;
  proDistribution: Record<string, number>;
  subscribedContacts: MusicCatalogContact[];
  unsubscribedContacts: MusicCatalogContact[];
  isLoading?: boolean;
}

const contactColumns: ColumnDef<MusicCatalogContact>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-linear-purple/20 flex items-center justify-center">
          <span className="text-xs font-medium text-linear-purple">
            {(row.getValue("name") as string).charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="font-medium text-white">{row.getValue("name")}</span>
      </div>
    ),
  },
  {
    accessorKey: "artistName",
    header: "Artist Name",
    cell: ({ row }) => (
      <span className="text-linear-text-secondary">{row.getValue("artistName") || "-"}</span>
    ),
  },
  {
    accessorKey: "taggedTracks",
    header: "Tagged",
    cell: ({ row }) => (
      <span className="text-linear-success font-medium">{row.getValue("taggedTracks")}</span>
    ),
  },
  {
    accessorKey: "untaggedTracks",
    header: "Untagged",
    cell: ({ row }) => (
      <span className="text-linear-warning font-medium">{row.getValue("untaggedTracks")}</span>
    ),
  },
  {
    accessorKey: "pro",
    header: "PRO",
    cell: ({ row }) => {
      const pro = row.getValue("pro") as string;
      return pro ? (
        <StatusBadge status={pro} variant="default" />
      ) : (
        <span className="text-linear-text-tertiary">-</span>
      );
    },
  },
  {
    accessorKey: "lastActivity",
    header: "Last Activity",
    cell: ({ row }) => (
      <span className="text-linear-text-tertiary text-xs">
        {formatDistanceToNow(new Date(row.getValue("lastActivity")), { addSuffix: true })}
      </span>
    ),
  },
  {
    accessorKey: "signedToDeal",
    header: "Deal",
    cell: ({ row }) => {
      const signed = row.getValue("signedToDeal") as boolean;
      return signed ? (
        <StatusBadge status="Signed" variant="success" />
      ) : (
        <span className="text-linear-text-tertiary">-</span>
      );
    },
  },
];

export function MusicCatalogDashboard({
  totalUsers,
  subscribedUsers,
  signedToDeals,
  totalTracks,
  taggedTracks,
  untaggedTracks,
  catalogHealth,
  proDistribution,
  subscribedContacts,
  unsubscribedContacts,
  isLoading = false,
}: MusicCatalogDashboardProps) {
  const [showSubscribed, setShowSubscribed] = useState(true);
  
  const unsubscribeRate = totalUsers > 0 ? Math.round((unsubscribedContacts.length / totalUsers) * 100) : 0;
  
  const statCards = [
    {
      title: "Subscribed Users",
      value: subscribedUsers,
      icon: UserCheck,
      format: (v: number) => v.toLocaleString(),
      color: "text-linear-success",
    },
    {
      title: "Tagged Tracks",
      value: taggedTracks,
      icon: Tag,
      format: (v: number) => v.toLocaleString(),
      color: "text-linear-success",
    },
    {
      title: "Untagged Tracks",
      value: untaggedTracks,
      icon: Music,
      format: (v: number) => v.toLocaleString(),
      color: "text-linear-warning",
    },
    {
      title: "Unsubscribe Rate",
      value: unsubscribeRate,
      icon: UserX,
      format: (v: number) => `${v}%`,
      color: unsubscribeRate <= 30 ? "text-linear-success" : unsubscribeRate <= 60 ? "text-linear-warning" : "text-linear-error",
    },
  ];

  const proData = Object.entries(proDistribution).map(([name, count]) => ({
    name,
    value: count,
    count,
  }));

  const catalogHealthData = [
    { name: "Tagged", value: taggedTracks, count: taggedTracks },
    { name: "Untagged", value: untaggedTracks, count: untaggedTracks },
  ];

  const funnelData = [
    { name: "Total Users", value: totalUsers },
    { name: "Subscribed", value: subscribedUsers },
    { name: "Signed to Deal", value: signedToDeals },
  ];

  const currentContacts = showSubscribed ? subscribedContacts : unsubscribedContacts;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((stat, index) => (
          <Card key={index} data-testid={`stat-card-${index}`}>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 bg-linear-hover" />
                  <Skeleton className="h-6 w-16 bg-linear-hover" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-linear-text-secondary">{stat.title}</span>
                    <stat.icon className="h-4 w-4 text-linear-text-tertiary" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-xl font-semibold ${stat.color || 'text-white'}`}>
                      {stat.format(stat.value)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="p-4 border-b border-linear-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium text-white">
                {showSubscribed ? "Subscribed Users" : "Unsubscribed Users"}
              </CardTitle>
              <CardDescription className="text-xs">
                Sorted by total tracks (highest first)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={showSubscribed ? "default" : "outline"}
                size="sm"
                onClick={() => setShowSubscribed(true)}
                className="gap-1"
                data-testid="button-show-subscribed"
              >
                <UserCheck className="h-3 w-3" />
                Subscribed ({subscribedContacts.length})
              </Button>
              <Button
                variant={!showSubscribed ? "default" : "outline"}
                size="sm"
                onClick={() => setShowSubscribed(false)}
                className="gap-1"
                data-testid="button-show-unsubscribed"
              >
                <UserX className="h-3 w-3" />
                Unsubscribed ({unsubscribedContacts.length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <DataTable
            columns={contactColumns}
            data={currentContacts}
            isLoading={isLoading}
            pageSize={10}
            emptyMessage={showSubscribed ? "No subscribed users found" : "No unsubscribed users found"}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="p-4 border-b border-linear-border">
            <CardTitle className="text-sm font-medium text-white">PRO Distribution</CardTitle>
            <CardDescription className="text-xs">Users by Performance Rights Organization</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-48 w-full bg-linear-hover" />
            ) : proData.length > 0 ? (
              <div className="space-y-4">
                <DonutChart
                  data={proData}
                  height={140}
                  innerRadius={40}
                  outerRadius={55}
                  centerValue={proData.length.toString()}
                  centerLabel="PROs"
                />
                <DonutLegend data={proData} />
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-linear-text-tertiary text-sm">
                No PRO data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 border-b border-linear-border">
            <CardTitle className="text-sm font-medium text-white">Catalog Health</CardTitle>
            <CardDescription className="text-xs">Tagged vs Untagged tracks</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-48 w-full bg-linear-hover" />
            ) : (
              <div className="space-y-4">
                <DonutChart
                  data={catalogHealthData}
                  height={140}
                  innerRadius={40}
                  outerRadius={55}
                  centerValue={`${catalogHealth}%`}
                  centerLabel="Tagged"
                  colors={["#59a200", "#f2994a"]}
                />
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-linear-text-secondary flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-linear-success" />
                      Tagged
                    </span>
                    <span className="text-white font-medium">{taggedTracks.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-linear-text-secondary flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-linear-warning" />
                      Untagged
                    </span>
                    <span className="text-white font-medium">{untaggedTracks.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 border-b border-linear-border">
            <CardTitle className="text-sm font-medium text-white">Conversion Funnel</CardTitle>
            <CardDescription className="text-xs">Users → Subscribed → Signed</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-48 w-full bg-linear-hover" />
            ) : (
              <BarChart
                data={funnelData}
                height={180}
                bars={[
                  { dataKey: "value", fill: "#5e6ad2", name: "Users" },
                ]}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
