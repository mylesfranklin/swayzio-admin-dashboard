import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, DollarSign } from "lucide-react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface RevenueSubscriberData {
  name: string;
  mrr: number;
  subscribers: number;
}

interface ChartSectionProps {
  revenueData: RevenueSubscriberData[];
  totalRevenue: number;
  mrr: number;
  subscribedUsers: number;
  isLoading?: boolean;
}

export function ChartSection({
  revenueData,
  totalRevenue,
  mrr,
  subscribedUsers,
  isLoading = false
}: ChartSectionProps) {
  const maxMrr = Math.max(...revenueData.map(d => d.mrr), 1);
  const maxSubs = Math.max(...revenueData.map(d => d.subscribers), 1);
  
  return (
    <Card className="w-full">
      <CardHeader className="p-4 border-b border-linear-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-white">Revenue & Subscriber Growth</CardTitle>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-linear-purple"></div>
              <span className="text-linear-text-secondary">MRR</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span className="text-linear-text-secondary">Subscribers</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <>
            <Skeleton className="h-72 w-full mb-4 bg-linear-hover" />
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-linear-hover/50 rounded-lg border border-linear-border p-3">
                  <Skeleton className="h-3 w-20 mb-2 bg-linear-hover" />
                  <Skeleton className="h-5 w-24 bg-linear-hover" />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="h-72 relative">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={revenueData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5e6ad2" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#5e6ad2" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="subsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis
                    yAxisId="mrr"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    domain={[0, 'auto']}
                  />
                  <YAxis
                    yAxisId="subscribers"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    tickFormatter={(value) => value.toLocaleString()}
                    domain={[0, 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1f",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    }}
                    labelStyle={{ color: "#fff", fontWeight: 500, marginBottom: 4 }}
                    formatter={(value: number, name: string) => {
                      if (name === "MRR") return [formatCurrency(value), "MRR"];
                      return [value.toLocaleString(), "Subscribers"];
                    }}
                  />
                  <Area
                    yAxisId="mrr"
                    type="monotone"
                    dataKey="mrr"
                    name="MRR"
                    stroke="#5e6ad2"
                    strokeWidth={2}
                    fill="url(#mrrGradient)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, fill: "#5e6ad2" }}
                  />
                  <Line
                    yAxisId="subscribers"
                    type="monotone"
                    dataKey="subscribers"
                    name="Subscribers"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, fill: "#10b981" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-linear-hover/50 rounded-lg border border-linear-border p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <DollarSign className="h-3 w-3 text-linear-text-tertiary" />
                  <span className="text-[10px] uppercase tracking-wide text-linear-text-tertiary font-medium">Total Revenue</span>
                </div>
                <p className="text-base font-semibold text-white">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              
              <div className="bg-linear-hover/50 rounded-lg border border-linear-border p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-linear-purple"></div>
                  <span className="text-[10px] uppercase tracking-wide text-linear-text-tertiary font-medium">MRR</span>
                </div>
                <p className="text-base font-semibold text-white">
                  {formatCurrency(mrr)}
                </p>
              </div>
              
              <div className="bg-linear-hover/50 rounded-lg border border-linear-border p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Users className="h-3 w-3 text-emerald-500" />
                  <span className="text-[10px] uppercase tracking-wide text-linear-text-tertiary font-medium">Subscribers</span>
                </div>
                <p className="text-base font-semibold text-white">
                  {subscribedUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
