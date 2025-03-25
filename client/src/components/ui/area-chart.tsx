import React from "react";
import {
  Area,
  AreaChart as RechartAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

export interface AreaChartData {
  name: string;
  [key: string]: number | string;
}

interface AreaChartProps {
  data: AreaChartData[];
  height?: number;
  lines: Array<{
    dataKey: string;
    stroke: string;
    fill: string;
    name?: string;
  }>;
  valueFormatter?: (value: number) => string;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
}

export function AreaChart({
  data,
  height = 400,
  lines,
  valueFormatter = (value) => formatCurrency(value),
  showXAxis = true,
  showYAxis = true,
  showGrid = true,
  showTooltip = true,
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartAreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
        
        {showXAxis && <XAxis dataKey="name" tickLine={false} axisLine={false} />}
        
        {showYAxis && (
          <YAxis
            tickFormatter={valueFormatter}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
        )}
        
        {showTooltip && (
          <Tooltip
            formatter={(value: number, name: string) => {
              const matchingLine = lines.find((line) => line.dataKey === name);
              return [valueFormatter(value), matchingLine?.name || name];
            }}
          />
        )}
        
        {lines.map((line, index) => (
          <Area
            key={index}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.stroke}
            fill={line.fill}
            fillOpacity={0.2}
            activeDot={{ r: 5 }}
            strokeWidth={2}
            name={line.name || line.dataKey}
          />
        ))}
      </RechartAreaChart>
    </ResponsiveContainer>
  );
}
