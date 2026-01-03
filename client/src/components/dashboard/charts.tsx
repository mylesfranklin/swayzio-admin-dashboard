import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, AreaChartData } from "@/components/ui/area-chart";
import { PieChart, PieChartData } from "@/components/ui/pie-chart";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";

interface ChartSectionProps {
  revenueData: AreaChartData[];
  subscriptionData: PieChartData[];
  isLoading?: boolean;
}

export function ChartSection({
  revenueData,
  subscriptionData,
  isLoading = false
}: ChartSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader className="p-4 border-b border-linear-border">
          <CardTitle className="text-sm font-medium text-white">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <>
              <Skeleton className="h-64 w-full mb-4 bg-linear-hover" />
              <div className="grid grid-cols-2 gap-4">
                <div className="border-t border-linear-border pt-3">
                  <Skeleton className="h-4 w-24 mb-2 bg-linear-hover" />
                  <Skeleton className="h-6 w-32 bg-linear-hover" />
                </div>
                <div className="border-t border-linear-border pt-3">
                  <Skeleton className="h-4 w-24 mb-2 bg-linear-hover" />
                  <Skeleton className="h-6 w-32 bg-linear-hover" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="h-64 relative">
                <AreaChart
                  data={revenueData}
                  lines={[
                    {
                      dataKey: "total",
                      stroke: "#5e6ad2",
                      fill: "#5e6ad2",
                      name: "Total Revenue"
                    },
                    {
                      dataKey: "recurring",
                      stroke: "#59a200",
                      fill: "#59a200",
                      name: "Recurring Revenue"
                    }
                  ]}
                  valueFormatter={(value) => formatCurrency(value)}
                />
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="border-t border-linear-border pt-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-linear-purple"></div>
                    <p className="text-xs text-linear-text-secondary">Total Revenue</p>
                  </div>
                  <p className="mt-1 text-xl font-semibold text-white">
                    {formatCurrency(278492)}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-linear-success">
                    <TrendingUp className="h-3 w-3" />
                    <span>15.3%</span>
                    <span className="text-linear-text-tertiary">vs previous</span>
                  </div>
                </div>
                
                <div className="border-t border-linear-border pt-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-linear-success"></div>
                    <p className="text-xs text-linear-text-secondary">Recurring Revenue</p>
                  </div>
                  <p className="mt-1 text-xl font-semibold text-white">
                    {formatCurrency(214875)}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-linear-success">
                    <TrendingUp className="h-3 w-3" />
                    <span>12.8%</span>
                    <span className="text-linear-text-tertiary">vs previous</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="p-4 border-b border-linear-border">
          <CardTitle className="text-sm font-medium text-white">Subscription Plans</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <>
              <Skeleton className="h-48 w-full mb-4 bg-linear-hover" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-2 w-2 rounded-full bg-linear-hover" />
                    <Skeleton className="h-3 w-24 bg-linear-hover" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 relative">
              <PieChart
                data={subscriptionData}
                colors={["#5e6ad2", "#59a200", "#f2c94c", "#f2994a", "#eb5757"]}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
