import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, Eye, Play, TrendingUp, Video } from "lucide-react";
import { SiTiktok } from "react-icons/si";

export default function TikTokPage() {
  return (
    <div className="space-y-6" data-testid="tiktok-page">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-black border border-linear-border">
          <SiTiktok className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">TikTok</h1>
          <p className="text-linear-text-secondary">Video performance and analytics</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-linear-card border-linear-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Followers</CardTitle>
            <Users className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">28.9K</div>
            <p className="text-xs text-linear-success mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +5.4% this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">2.4M</div>
            <p className="text-xs text-linear-text-tertiary mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Avg. Likes</CardTitle>
            <Heart className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">4,850</div>
            <p className="text-xs text-linear-text-tertiary mt-1">Per video</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Videos</CardTitle>
            <Play className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">142</div>
            <p className="text-xs text-linear-text-tertiary mt-1">Published</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-linear-card border-linear-border">
        <CardHeader>
          <CardTitle className="text-white">Video Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-linear-base border border-linear-border">
            <Video className="h-8 w-8 text-linear-text-tertiary" />
            <div className="flex-1">
              <p className="text-sm text-linear-text-secondary">
                Connect TikTok API to view detailed video analytics, 
                trending content performance, and audience insights.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
