import {
  Line,
  LineChart as RechartLineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

export interface LineChartData {
  name: string;
  [key: string]: number | string;
}

interface LineChartProps {
  data: LineChartData[];
  height?: number;
  lines: Array<{
    dataKey: string;
    stroke: string;
    name?: string;
    strokeDasharray?: string;
  }>;
  valueFormatter?: (value: number) => string;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
}

export function LineChart({
  data,
  height = 300,
  lines,
  valueFormatter = (value) => value.toLocaleString(),
  showXAxis = true,
  showYAxis = true,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartLineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        {showGrid && (
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="#23252a"
          />
        )}
        
        {showXAxis && (
          <XAxis 
            dataKey="name" 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: '#8a8f98', fontSize: 11 }}
            tickMargin={8}
          />
        )}
        
        {showYAxis && (
          <YAxis
            tickFormatter={valueFormatter}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#8a8f98', fontSize: 11 }}
            tickMargin={8}
            width={60}
          />
        )}
        
        {showTooltip && (
          <Tooltip
            contentStyle={{
              backgroundColor: '#17181a',
              border: '1px solid #23252a',
              borderRadius: '6px',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#f7f8f8', fontWeight: 500 }}
            itemStyle={{ color: '#8a8f98' }}
            formatter={(value: number, name: string) => {
              const matchingLine = lines.find((line) => line.dataKey === name);
              return [valueFormatter(value), matchingLine?.name || name];
            }}
          />
        )}

        {showLegend && (
          <Legend 
            wrapperStyle={{ fontSize: '12px', color: '#8a8f98' }}
          />
        )}
        
        {lines.map((line, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.stroke}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: line.stroke }}
            name={line.name || line.dataKey}
            strokeDasharray={line.strokeDasharray}
          />
        ))}
      </RechartLineChart>
    </ResponsiveContainer>
  );
}
