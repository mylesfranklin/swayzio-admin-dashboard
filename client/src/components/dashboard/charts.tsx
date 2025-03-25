import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, AreaChartData } from "@/components/ui/area-chart";
import { PieChart, PieChartData } from "@/components/ui/pie-chart";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Revenue Chart */}
      <Card className="lg:col-span-2 shadow hover:shadow-md transition-all duration-200">
        <CardHeader className="px-6 py-5 border-b border-gray-200">
          <CardTitle className="text-lg font-medium text-gray-900">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <>
              <Skeleton className="h-80 w-full mb-6" />
              <div className="grid grid-cols-2 gap-6">
                <div className="border-t border-gray-200 pt-4">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-8 w-40 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-8 w-40 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="h-80 relative">
                <AreaChart
                  data={revenueData}
                  lines={[
                    {
                      dataKey: "total",
                      stroke: "#4F46E5",
                      fill: "#4F46E5",
                      name: "Total Revenue"
                    },
                    {
                      dataKey: "recurring",
                      stroke: "#10B981",
                      fill: "#10B981",
                      name: "Recurring Revenue"
                    }
                  ]}
                  valueFormatter={(value) => formatCurrency(value)}
                />
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-6">
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-4 w-4 rounded-full bg-primary-500"></div>
                    <p className="ml-2 text-sm font-medium text-gray-900">Total Revenue</p>
                  </div>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">
                    {formatCurrency(278492)}
                  </p>
                  <div className="mt-1 flex items-baseline text-sm">
                    <span className="text-accent-600 font-semibold">▲ 15.3%</span>
                    <span className="ml-2 text-gray-500">vs previous period</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-4 w-4 rounded-full bg-accent-500"></div>
                    <p className="ml-2 text-sm font-medium text-gray-900">Recurring Revenue</p>
                  </div>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">
                    {formatCurrency(214875)}
                  </p>
                  <div className="mt-1 flex items-baseline text-sm">
                    <span className="text-accent-600 font-semibold">▲ 12.8%</span>
                    <span className="ml-2 text-gray-500">vs previous period</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Subscription Distribution Chart */}
      <Card className="shadow hover:shadow-md transition-all duration-200">
        <CardHeader className="px-6 py-5 border-b border-gray-200">
          <CardTitle className="text-lg font-medium text-gray-900">Subscription Plans</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <>
              <Skeleton className="h-64 w-full mb-6" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="h-64 relative">
                <PieChart
                  data={subscriptionData}
                  colors={["#4F46E5", "#10B981", "#F59E0B", "#6366F1", "#EC4899"]}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
