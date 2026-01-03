import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart } from "@/components/ui/line-chart";
import { BarChart } from "@/components/ui/bar-chart";
import { DonutChart, DonutLegend } from "@/components/ui/donut-chart";
import { DataTable, StatusBadge, getStatusVariant } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  GitBranch, 
  GitPullRequest, 
  GitCommit, 
  AlertCircle,
  Users,
  Activity,
  Clock,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";

interface GitHubStats {
  totalCommits: number;
  totalPRs: number;
  openIssues: number;
  contributors: number;
  commitsGrowth: number;
  prsGrowth: number;
}

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
  additions: number;
  deletions: number;
}

interface PullRequest {
  id: number;
  title: string;
  author: string;
  status: string;
  createdAt: string;
  reviewers: number;
}

interface GitHubDashboardProps {
  stats?: GitHubStats;
  commits?: Commit[];
  pullRequests?: PullRequest[];
  commitHistory?: Array<{ name: string; commits: number }>;
  languageDistribution?: Array<{ name: string; value: number }>;
  isLoading?: boolean;
}

const prColumns: ColumnDef<PullRequest>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate font-medium text-white">
        {row.getValue("title")}
      </div>
    ),
  },
  {
    accessorKey: "author",
    header: "Author",
    cell: ({ row }) => (
      <span className="text-linear-text-secondary">{row.getValue("author")}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return <StatusBadge status={status} variant={getStatusVariant(status)} />;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-linear-text-tertiary text-xs">
        {formatDistanceToNow(new Date(row.getValue("createdAt")), { addSuffix: true })}
      </span>
    ),
  },
];

export function GitHubDashboard({
  stats,
  commits = [],
  pullRequests = [],
  commitHistory = [],
  languageDistribution = [],
  isLoading = false,
}: GitHubDashboardProps) {
  const statCards = [
    {
      title: "Total Commits",
      value: stats?.totalCommits ?? 0,
      change: stats?.commitsGrowth ?? 0,
      icon: GitCommit,
    },
    {
      title: "Pull Requests",
      value: stats?.totalPRs ?? 0,
      change: stats?.prsGrowth ?? 0,
      icon: GitPullRequest,
    },
    {
      title: "Open Issues",
      value: stats?.openIssues ?? 0,
      icon: AlertCircle,
    },
    {
      title: "Contributors",
      value: stats?.contributors ?? 0,
      icon: Users,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((stat, index) => (
          <Card key={index}>
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
                    <span className="text-xl font-semibold text-white">
                      {stat.value.toLocaleString()}
                    </span>
                    {stat.change !== undefined && (
                      <span className={`text-xs ${stat.change >= 0 ? 'text-linear-success' : 'text-linear-error'}`}>
                        {stat.change >= 0 ? '+' : ''}{stat.change}%
                      </span>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 border-b border-linear-border">
            <CardTitle className="text-sm font-medium text-white">Commit Activity</CardTitle>
            <CardDescription className="text-xs">Commits over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-48 w-full bg-linear-hover" />
            ) : (
              <BarChart
                data={commitHistory}
                height={200}
                bars={[{ dataKey: "commits", fill: "#5e6ad2", radius: 4 }]}
                showYAxis={false}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 border-b border-linear-border">
            <CardTitle className="text-sm font-medium text-white">Languages</CardTitle>
            <CardDescription className="text-xs">Code distribution by language</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-48 w-full bg-linear-hover" />
            ) : (
              <div className="space-y-4">
                <DonutChart
                  data={languageDistribution}
                  height={120}
                  innerRadius={35}
                  outerRadius={50}
                />
                <DonutLegend data={languageDistribution} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 border-b border-linear-border">
          <CardTitle className="text-sm font-medium text-white">Recent Pull Requests</CardTitle>
          <CardDescription className="text-xs">Latest PRs across repositories</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <DataTable
            columns={prColumns}
            data={pullRequests}
            isLoading={isLoading}
            pageSize={5}
            emptyMessage="No pull requests found"
          />
        </CardContent>
      </Card>
    </div>
  );
}
