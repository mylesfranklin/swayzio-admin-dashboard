import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, MessageCircle, Eye, TrendingUp, Image } from "lucide-react";
import { SiInstagram } from "react-icons/si";

export default function InstagramPage() {
  return (
    <div className="space-y-6" data-testid="instagram-page">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
          <SiInstagram className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Instagram</h1>
          <p className="text-linear-text-secondary">Analytics and performance metrics</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-linear-card border-linear-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Followers</CardTitle>
            <Users className="h-4 w-4 text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">52.4K</div>
            <p className="text-xs text-linear-success mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +2.1% this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Engagement Rate</CardTitle>
            <Heart className="h-4 w-4 text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">4.2%</div>
            <p className="text-xs text-linear-text-tertiary mt-1">Avg. per post</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Avg. Likes</CardTitle>
            <Heart className="h-4 w-4 text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">2,180</div>
            <p className="text-xs text-linear-text-tertiary mt-1">Per post</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Reach</CardTitle>
            <Eye className="h-4 w-4 text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">128K</div>
            <p className="text-xs text-linear-text-tertiary mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-linear-card border-linear-border">
        <CardHeader>
          <CardTitle className="text-white">Recent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-linear-base border border-linear-border">
            <Image className="h-8 w-8 text-linear-text-tertiary" />
            <div className="flex-1">
              <p className="text-sm text-linear-text-secondary">
                Connect Instagram API to view detailed analytics, post performance, 
                story insights, and audience demographics.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
