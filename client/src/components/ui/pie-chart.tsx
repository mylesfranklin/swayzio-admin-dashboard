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
  color?: string;
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

interface PieChartProps {
  data: PieChartData[];
  height?: number;
  colors?: string[];
  showTooltip?: boolean;
  showLegend?: boolean;
  valueFormatter?: (value: number) => string;
  innerRadius?: number;
  outerRadius?: number;
}

export function PieChart({
  data,
  height = 300,
  colors = LINEAR_COLORS,
  showTooltip = true,
  showLegend = true,
  valueFormatter = (value) => value.toLocaleString(),
  innerRadius = 0,
  outerRadius = 80,
}: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ResponsiveContainer width="100%" height={height}>
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
        
        {showLegend && (
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px' }}
            formatter={(value, entry, index) => (
              <span className="text-linear-text-secondary">
                {value} <span className="text-linear-text-tertiary">({((data[index].value / total) * 100).toFixed(0)}%)</span>
              </span>
            )}
          />
        )}
      </RechartPieChart>
    </ResponsiveContainer>
  );
}
