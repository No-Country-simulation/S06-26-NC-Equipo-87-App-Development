import React from 'react';
import { Typography } from '../../shared/components/atoms/Typography';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell
} from 'recharts';

interface HorizontalBarChartWidgetProps<T> {
  title: string;
  data: T[];
  xAxisKey: string;
  yAxisKey: string;
  yAxisWidth?: number;
  barSize?: number;
  valueFormatter?: (val: unknown) => string;
  style?: React.CSSProperties;
  backgroundFill?: string;
  labelFontWeight?: number | string;
  yAxisFontColor?: string;
  yAxisFontWeight?: number | string;
}

export const HorizontalBarChartWidget = <T,>({
  title,
  data,
  xAxisKey,
  yAxisKey,
  yAxisWidth = 100,
  barSize = 8,
  valueFormatter,
  style,
  backgroundFill = '#f1efe8',
  labelFontWeight = 500,
  yAxisFontColor = 'var(--colors-text-primary)',
  yAxisFontWeight = 500
}: HorizontalBarChartWidgetProps<T>) => {
  const empty = data.length === 0;

  const maxValue = Math.max(...data.map(d => Number((d as unknown as Record<string, unknown>)[xAxisKey]) || 0), 1);
  const emptyBarFraction = maxValue * 0.003;

  const chartData = data.map(d => {
    const realValue = Number((d as unknown as Record<string, unknown>)[xAxisKey]) || 0;
    return {
      ...d,
      _displayValue: realValue,
      [xAxisKey]: realValue === 0 ? emptyBarFraction : realValue,
      _isEmpty: realValue === 0,
    };
  });

  return (
    <div style={{
      backgroundColor: 'var(--colors-surface-card)',
      border: '1.25px solid #dcdad4',
      borderRadius: 'var(--rounded-md)',
      padding: 'var(--spacing-4)',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-4)',
      ...style
    }}>
      <Typography variant="heading" style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--colors-text-primary)' }}>
        {title}
      </Typography>
      <div style={{ height: `${empty ? 180 : (data.length * 40 + 10)}px`, width: '100%', position: 'relative' }}>
        {empty ? (
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}>
            <span style={{ fontSize: '20px', opacity: 0.3 }}>📊</span>
            <Typography variant="caption" style={{ color: 'var(--colors-text-tertiary)', fontSize: '12px', margin: 0 }}>
              Sin actividad registrada
            </Typography>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 10, right: 40, left: 0, bottom: 10 }}
            >
              <XAxis type="number" hide domain={[0, maxValue]} />
              <YAxis
                type="category"
                dataKey={yAxisKey}
                axisLine={false}
                tickLine={false}
                width={yAxisWidth}
                tick={(props: unknown) => {
                  const { y, payload } = props as { y: number; payload: { value: string | number } };
                  return (
                    <text
                      x={0}
                      y={y}
                      dy={4}
                      textAnchor="start"
                      fill={yAxisFontColor}
                      fontSize={12}
                      fontWeight={yAxisFontWeight}
                    >
                      {payload.value}
                    </text>
                  );
                }}
              />
              <Tooltip cursor={{ fill: 'rgba(27, 30, 34, 0.03)' }} contentStyle={{ borderRadius: 'var(--rounded-md)', border: '1px solid #dcdad4', backgroundColor: 'var(--colors-surface-card)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
              <Bar dataKey={xAxisKey} radius={[4, 4, 4, 4]} barSize={barSize} background={{ fill: backgroundFill, radius: 4 }}>
                <LabelList
                  dataKey="_displayValue"
                  position="right"
                  formatter={valueFormatter ?? ((v: unknown) => String(v))}
                  style={{ fontSize: 12, fill: 'var(--colors-text-primary)', fontWeight: labelFontWeight }}
                />
                {chartData.map((entry, index) => {
                  const colors = [
                    'var(--colors-background-dark)',
                    '#3E3D3A',
                    'var(--colors-text-secondary)',
                    '#7D7C77',
                    'var(--colors-text-tertiary)',
                    '#9E9D96',
                    '#B4B3AC',
                    '#C9C8C1',
                    '#DFDDD7',
                    '#ECEAE3'
                  ];
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry._isEmpty ? '#c8c5be' : colors[index % colors.length]}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

