import {
  Area,
  AreaChart as RechartAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

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
  showLegend?: boolean;
  gradientOpacity?: number;
}

export function AreaChart({
  data,
  height = 300,
  lines,
  valueFormatter = (value) => value.toLocaleString(),
  showXAxis = true,
  showYAxis = true,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  gradientOpacity = 0.15,
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartAreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          {lines.map((line, index) => (
            <linearGradient key={index} id={`gradient-${line.dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={line.fill} stopOpacity={gradientOpacity} />
              <stop offset="100%" stopColor={line.fill} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        
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
          <Area
            key={index}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.stroke}
            fill={`url(#gradient-${line.dataKey})`}
            strokeWidth={2}
            activeDot={{ 
              r: 5, 
              fill: line.stroke, 
              stroke: '#17181a', 
              strokeWidth: 2,
              style: { 
                filter: `drop-shadow(0 0 6px ${line.stroke}40)` 
              }
            }}
            dot={false}
            name={line.name || line.dataKey}
            animationDuration={240}
            animationEasing="ease-out"
          />
        ))}
      </RechartAreaChart>
    </ResponsiveContainer>
  );
}
