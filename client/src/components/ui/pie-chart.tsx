import React from "react";
import {
  PieChart as RechartPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export interface PieChartData {
  name: string;
  value: number;
}

interface PieChartProps {
  data: PieChartData[];
  height?: number;
  colors?: string[];
  showTooltip?: boolean;
  showLegend?: boolean;
  valueFormatter?: (value: number) => string;
}

export function PieChart({
  data,
  height = 300,
  colors = ["#4F46E5", "#10B981", "#F59E0B", "#6366F1", "#EC4899"],
  showTooltip = true,
  showLegend = true,
  valueFormatter = (value) => `${value.toLocaleString()}`,
}: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={0}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
            />
          ))}
        </Pie>
        
        {showTooltip && (
          <Tooltip
            formatter={(value: number) => [valueFormatter(value), "Value"]}
          />
        )}
        
        {showLegend && (
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            formatter={(value, entry, index) => (
              <span style={{ color: "#374151", fontSize: "0.875rem" }}>
                {value} ({((data[index].value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(0)}%)
              </span>
            )}
          />
        )}
      </RechartPieChart>
    </ResponsiveContainer>
  );
}
