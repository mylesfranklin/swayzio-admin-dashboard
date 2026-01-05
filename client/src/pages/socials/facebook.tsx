import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ThumbsUp, Share2, Eye, TrendingUp, FileText } from "lucide-react";
import { SiFacebook } from "react-icons/si";

export default function FacebookPage() {
  return (
    <div className="space-y-6" data-testid="facebook-page">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-600">
          <SiFacebook className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Facebook</h1>
          <p className="text-linear-text-secondary">Page analytics and performance</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-linear-card border-linear-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Page Likes</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">8,420</div>
            <p className="text-xs text-linear-success mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +1.2% this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Post Reach</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">24.5K</div>
            <p className="text-xs text-linear-text-tertiary mt-1">Last 28 days</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Engagement</CardTitle>
            <ThumbsUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">3.8%</div>
            <p className="text-xs text-linear-text-tertiary mt-1">Avg. rate</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Shares</CardTitle>
            <Share2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">842</div>
            <p className="text-xs text-linear-text-tertiary mt-1">Last 28 days</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-linear-card border-linear-border">
        <CardHeader>
          <CardTitle className="text-white">Page Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-linear-base border border-linear-border">
            <FileText className="h-8 w-8 text-linear-text-tertiary" />
            <div className="flex-1">
              <p className="text-sm text-linear-text-secondary">
                Connect Facebook Graph API to view detailed page insights, 
                post analytics, and audience demographics.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
