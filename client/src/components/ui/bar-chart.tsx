import {
  Bar,
  BarChart as RechartBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  Cell,
} from "recharts";

export interface BarChartData {
  name: string;
  [key: string]: number | string;
}

interface BarChartProps {
  data: BarChartData[];
  height?: number;
  bars: Array<{
    dataKey: string;
    fill: string;
    name?: string;
    radius?: number;
  }>;
  valueFormatter?: (value: number) => string;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  layout?: 'vertical' | 'horizontal';
  stacked?: boolean;
}

export function BarChart({
  data,
  height = 300,
  bars,
  valueFormatter = (value) => value.toLocaleString(),
  showXAxis = true,
  showYAxis = true,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  layout = 'horizontal',
  stacked = false,
}: BarChartProps) {
  const isVertical = layout === 'vertical';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartBarChart 
        data={data} 
        layout={layout}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        {showGrid && (
          <CartesianGrid 
            strokeDasharray="3 3" 
            horizontal={!isVertical}
            vertical={isVertical}
            stroke="#23252a"
          />
        )}
        
        {isVertical ? (
          <>
            {showYAxis && (
              <YAxis 
                dataKey="name" 
                type="category"
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#8a8f98', fontSize: 11 }}
                tickMargin={8}
                width={100}
              />
            )}
            {showXAxis && (
              <XAxis
                type="number"
                tickFormatter={valueFormatter}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#8a8f98', fontSize: 11 }}
                tickMargin={8}
              />
            )}
          </>
        ) : (
          <>
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
          </>
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
              const matchingBar = bars.find((bar) => bar.dataKey === name);
              return [valueFormatter(value), matchingBar?.name || name];
            }}
            cursor={{ fill: 'rgba(94, 106, 210, 0.1)' }}
          />
        )}

        {showLegend && (
          <Legend 
            wrapperStyle={{ fontSize: '12px', color: '#8a8f98' }}
          />
        )}
        
        {bars.map((bar, index) => (
          <Bar
            key={index}
            dataKey={bar.dataKey}
            fill={bar.fill}
            name={bar.name || bar.dataKey}
            radius={bar.radius || 4}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </RechartBarChart>
    </ResponsiveContainer>
  );
}

interface SimpleBarChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  height?: number;
  color?: string;
  valueFormatter?: (value: number) => string;
  showXAxis?: boolean;
  showYAxis?: boolean;
  layout?: 'vertical' | 'horizontal';
}

export function SimpleBarChart({
  data,
  height = 200,
  color = '#5e6ad2',
  valueFormatter = (value) => value.toLocaleString(),
  showXAxis = true,
  showYAxis = false,
  layout = 'horizontal',
}: SimpleBarChartProps) {
  const isVertical = layout === 'vertical';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartBarChart 
        data={data} 
        layout={layout}
        margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
      >
        {isVertical ? (
          <>
            {showYAxis && (
              <YAxis 
                dataKey="name" 
                type="category"
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#8a8f98', fontSize: 11 }}
                width={80}
              />
            )}
            {showXAxis && (
              <XAxis
                type="number"
                tickFormatter={valueFormatter}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#8a8f98', fontSize: 11 }}
                hide
              />
            )}
          </>
        ) : (
          <>
            {showXAxis && (
              <XAxis 
                dataKey="name" 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#8a8f98', fontSize: 11 }}
              />
            )}
            {showYAxis && (
              <YAxis
                tickFormatter={valueFormatter}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#8a8f98', fontSize: 11 }}
                hide
              />
            )}
          </>
        )}
        
        <Tooltip
          contentStyle={{
            backgroundColor: '#17181a',
            border: '1px solid #23252a',
            borderRadius: '6px',
            fontSize: '12px',
          }}
          labelStyle={{ color: '#f7f8f8', fontWeight: 500 }}
          itemStyle={{ color: '#8a8f98' }}
          formatter={(value: number) => [valueFormatter(value), 'Value']}
          cursor={{ fill: 'rgba(94, 106, 210, 0.1)' }}
        />
        
        <Bar dataKey="value" radius={4}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || color} />
          ))}
        </Bar>
      </RechartBarChart>
    </ResponsiveContainer>
  );
}
