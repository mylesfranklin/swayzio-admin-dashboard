import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart } from "@/components/ui/area-chart";
import { BarChart, SimpleBarChart } from "@/components/ui/bar-chart";
import { DonutChart, DonutLegend } from "@/components/ui/donut-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  Heart,
  Eye,
  Share2,
  MessageCircle,
  Play,
} from "lucide-react";
import { SiInstagram, SiYoutube, SiFacebook, SiX, SiLinkedin, SiTiktok } from "react-icons/si";

interface PlatformMetrics {
  platform: string;
  followers: number;
  followersGrowth: number;
  engagement: number;
  engagementRate: number;
  reach: number;
  impressions: number;
}

interface SocialMetricsProps {
  platforms?: PlatformMetrics[];
  followerHistory?: Array<{ name: string; [key: string]: number | string }>;
  engagementByPlatform?: Array<{ name: string; value: number; color?: string }>;
  isLoading?: boolean;
}

const platformConfig: Record<string, { icon: any; color: string; gradient: string }> = {
  instagram: { 
    icon: SiInstagram, 
    color: '#f178b6',
    gradient: 'from-pink-500 to-purple-500',
  },
  youtube: { 
    icon: SiYoutube, 
    color: '#eb5757',
    gradient: 'from-red-500 to-red-600',
  },
  facebook: { 
    icon: SiFacebook, 
    color: '#5e6ad2',
    gradient: 'from-blue-500 to-blue-600',
  },
  twitter: { 
    icon: SiX, 
    color: '#56ccf2',
    gradient: 'from-sky-400 to-blue-500',
  },
  linkedin: { 
    icon: SiLinkedin, 
    color: '#2f80ed',
    gradient: 'from-blue-600 to-blue-700',
  },
  tiktok: { 
    icon: SiTiktok, 
    color: '#f7f8f8',
    gradient: 'from-gray-800 to-black',
  },
};

interface PlatformCardProps {
  metrics: PlatformMetrics;
  isLoading?: boolean;
}

function PlatformCard({ metrics, isLoading = false }: PlatformCardProps) {
  const config = platformConfig[metrics.platform.toLowerCase()] || platformConfig.instagram;
  const Icon = config.icon;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-8 w-8 rounded-full bg-linear-hover" />
          <Skeleton className="h-6 w-24 bg-linear-hover" />
          <Skeleton className="h-4 w-16 bg-linear-hover" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <div 
        className="absolute top-0 right-0 w-24 h-24 opacity-5"
        style={{ background: `radial-gradient(circle at 100% 0%, ${config.color}, transparent 70%)` }}
      />
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${config.color}20` }}
          >
            <Icon className="h-5 w-5" style={{ color: config.color }} />
          </div>
          <Badge 
            variant="outline" 
            className={`text-xs ${metrics.followersGrowth >= 0 ? 'text-linear-success border-linear-success/30' : 'text-linear-error border-linear-error/30'}`}
          >
            {metrics.followersGrowth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {metrics.followersGrowth >= 0 ? '+' : ''}{metrics.followersGrowth}%
          </Badge>
        </div>
        
        <div className="space-y-1">
          <h4 className="text-xs text-linear-text-secondary capitalize">{metrics.platform}</h4>
          <p className="text-2xl font-semibold text-white">
            {metrics.followers >= 1000000 
              ? `${(metrics.followers / 1000000).toFixed(1)}M`
              : metrics.followers >= 1000 
                ? `${(metrics.followers / 1000).toFixed(1)}K`
                : metrics.followers.toLocaleString()
            }
          </p>
          <p className="text-xs text-linear-text-tertiary">followers</p>
        </div>

        <div className="mt-4 pt-3 border-t border-linear-border grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-linear-text-tertiary">Engagement</p>
            <p className="text-sm font-medium text-white">{metrics.engagementRate.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-linear-text-tertiary">Reach</p>
            <p className="text-sm font-medium text-white">
              {metrics.reach >= 1000 ? `${(metrics.reach / 1000).toFixed(0)}K` : metrics.reach}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SocialMetrics({
  platforms = [],
  followerHistory = [],
  engagementByPlatform = [],
  isLoading = false,
}: SocialMetricsProps) {
  const totalFollowers = platforms.reduce((sum, p) => sum + p.followers, 0);
  const avgEngagement = platforms.length > 0 
    ? platforms.reduce((sum, p) => sum + p.engagementRate, 0) / platforms.length 
    : 0;

  const followerDistribution = platforms.map(p => ({
    name: p.platform,
    value: p.followers,
    color: platformConfig[p.platform.toLowerCase()]?.color,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <PlatformCard key={i} metrics={{} as PlatformMetrics} isLoading />
          ))
        ) : (
          platforms.map((platform) => (
            <PlatformCard key={platform.platform} metrics={platform} />
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 border-b border-linear-border">
            <CardTitle className="text-sm font-medium text-white">Follower Growth</CardTitle>
            <CardDescription className="text-xs">Followers over time by platform</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-48 w-full bg-linear-hover" />
            ) : (
              <AreaChart
                data={followerHistory}
                height={200}
                lines={platforms.map(p => ({
                  dataKey: p.platform.toLowerCase(),
                  stroke: platformConfig[p.platform.toLowerCase()]?.color || '#5e6ad2',
                  fill: platformConfig[p.platform.toLowerCase()]?.color || '#5e6ad2',
                  name: p.platform,
                }))}
                valueFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v.toString()}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 border-b border-linear-border">
            <CardTitle className="text-sm font-medium text-white">Follower Distribution</CardTitle>
            <CardDescription className="text-xs">Audience by platform</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-48 w-full bg-linear-hover" />
            ) : (
              <div className="space-y-4">
                <DonutChart
                  data={followerDistribution}
                  height={140}
                  innerRadius={40}
                  outerRadius={55}
                  centerValue={totalFollowers >= 1000000 
                    ? `${(totalFollowers / 1000000).toFixed(1)}M`
                    : totalFollowers >= 1000 
                      ? `${(totalFollowers / 1000).toFixed(0)}K`
                      : totalFollowers.toString()
                  }
                  centerLabel="Total"
                />
                <DonutLegend 
                  data={followerDistribution} 
                  valueFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toString()}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 border-b border-linear-border">
          <CardTitle className="text-sm font-medium text-white">Engagement by Platform</CardTitle>
          <CardDescription className="text-xs">Likes, comments, shares, and saves</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <Skeleton className="h-48 w-full bg-linear-hover" />
          ) : (
            <BarChart
              data={engagementByPlatform.length > 0 ? engagementByPlatform : platforms.map(p => ({
                name: p.platform,
                engagement: p.engagement,
              }))}
              height={200}
              bars={[{ 
                dataKey: engagementByPlatform.length > 0 ? "value" : "engagement", 
                fill: "#5e6ad2",
                radius: 4,
              }]}
              valueFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toString()}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
