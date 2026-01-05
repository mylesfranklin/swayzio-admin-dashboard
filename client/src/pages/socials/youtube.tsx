import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Eye, Clock, ThumbsUp, TrendingUp, Video } from "lucide-react";
import { SiYoutube } from "react-icons/si";

export default function YouTubePage() {
  return (
    <div className="space-y-6" data-testid="youtube-page">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-red-600">
          <SiYoutube className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">YouTube</h1>
          <p className="text-linear-text-secondary">Channel analytics and performance</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-linear-card border-linear-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">12.8K</div>
            <p className="text-xs text-linear-success mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +3.2% this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">1.2M</div>
            <p className="text-xs text-linear-text-tertiary mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Watch Time</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">48.2K</div>
            <p className="text-xs text-linear-text-tertiary mt-1">Hours (last 28 days)</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Avg. Likes</CardTitle>
            <ThumbsUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">892</div>
            <p className="text-xs text-linear-text-tertiary mt-1">Per video</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-linear-card border-linear-border">
        <CardHeader>
          <CardTitle className="text-white">Channel Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-linear-base border border-linear-border">
            <Video className="h-8 w-8 text-linear-text-tertiary" />
            <div className="flex-1">
              <p className="text-sm text-linear-text-secondary">
                Connect YouTube Analytics API to view detailed channel metrics, 
                video performance, revenue data, and audience retention.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
