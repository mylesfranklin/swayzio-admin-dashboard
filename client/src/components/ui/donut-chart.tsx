import {
  PieChart as RechartPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export interface DonutChartData {
  name: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  height?: number;
  colors?: string[];
  showTooltip?: boolean;
  valueFormatter?: (value: number) => string;
  innerRadius?: number;
  outerRadius?: number;
  centerLabel?: string;
  centerValue?: string;
}

const LINEAR_COLORS = [
  '#5e6ad2',
  '#59a200', 
  '#f2c94c',
  '#f2994a',
  '#eb5757',
  '#56ccf2',
  '#f178b6',
  '#9b51e0',
];

export function DonutChart({
  data,
  height = 200,
  colors = LINEAR_COLORS,
  showTooltip = true,
  valueFormatter = (value) => value.toLocaleString(),
  innerRadius = 60,
  outerRadius = 80,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || colors[index % colors.length]}
              />
            ))}
          </Pie>
          
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: '#17181a',
                border: '1px solid #23252a',
                borderRadius: '6px',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#f7f8f8', fontWeight: 500 }}
              formatter={(value: number, name: string) => [
                `${valueFormatter(value)} (${((value / total) * 100).toFixed(1)}%)`,
                name
              ]}
            />
          )}
        </RechartPieChart>
      </ResponsiveContainer>
      
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && (
            <span className="text-xl font-semibold text-white">{centerValue}</span>
          )}
          {centerLabel && (
            <span className="text-xs text-linear-text-secondary">{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

interface DonutLegendProps {
  data: DonutChartData[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
}

export function DonutLegend({
  data,
  colors = LINEAR_COLORS,
  valueFormatter = (value) => value.toLocaleString(),
  className = '',
}: DonutLegendProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={`space-y-2 ${className}`}>
      {data.map((item, index) => (
        <div key={item.name} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div 
              className="h-2 w-2 rounded-full" 
              style={{ backgroundColor: item.color || colors[index % colors.length] }}
            />
            <span className="text-linear-text-secondary">{item.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">{valueFormatter(item.value)}</span>
            <span className="text-linear-text-tertiary text-xs">
              {((item.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
