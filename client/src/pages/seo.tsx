import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Search, TrendingUp, Globe, FileText, Link2 } from "lucide-react";

export default function SEOPage() {
  return (
    <div className="space-y-6" data-testid="seo-page">
      <div>
        <h1 className="text-2xl font-bold text-white">SEO Analytics</h1>
        <p className="text-linear-text-secondary mt-1">Search engine optimization and rankings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-linear-card border-linear-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Organic Traffic</CardTitle>
            <TrendingUp className="h-4 w-4 text-linear-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">—</div>
            <p className="text-xs text-linear-text-tertiary mt-1">Connect analytics to view</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Keywords Ranking</CardTitle>
            <Search className="h-4 w-4 text-linear-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">—</div>
            <p className="text-xs text-linear-text-tertiary mt-1">Connect analytics to view</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Backlinks</CardTitle>
            <Link2 className="h-4 w-4 text-linear-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">—</div>
            <p className="text-xs text-linear-text-tertiary mt-1">Connect analytics to view</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-card border-linear-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-linear-text-secondary">Domain Authority</CardTitle>
            <Globe className="h-4 w-4 text-linear-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">—</div>
            <p className="text-xs text-linear-text-tertiary mt-1">Connect analytics to view</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-linear-card border-linear-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-linear-purple/10">
              <BarChart3 className="h-5 w-5 text-linear-purple" />
            </div>
            <div>
              <CardTitle className="text-white">SEO Insights</CardTitle>
              <p className="text-sm text-linear-text-secondary mt-1">
                Track your search engine rankings and organic performance.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-linear-base border border-linear-border">
            <FileText className="h-8 w-8 text-linear-text-tertiary" />
            <div className="flex-1">
              <p className="text-sm text-linear-text-secondary">
                SEO analytics integration coming soon. You'll be able to track keyword rankings, 
                organic traffic, and search visibility metrics.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
