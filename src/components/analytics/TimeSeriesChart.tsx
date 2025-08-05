'use client';

import { Box, Text, Title, useMantineColorScheme } from '@mantine/core';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ContentCreationData } from '@/lib/analytics';

interface TimeSeriesChartProps {
  data: ContentCreationData[];
  title?: string;
}

export function TimeSeriesChart({ data, title }: TimeSeriesChartProps) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          style={{
            backgroundColor: 'var(--card)',
            padding: '8px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <Text
            size="sm"
            style={{
              color: 'var(--foreground)',
            }}
          >
            Date: {label}
          </Text>
          {payload.map((entry: any, index: number) => (
            <Text
              key={index}
              size="sm"
              style={{
                color: entry.color,
              }}
            >
              {entry.name}: {entry.value}
            </Text>
          ))}
        </Box>
      );
    }

    return null;
  };

  return (
    <Box>
      {title && (
        <Title order={3} mb="md">
          {title}
        </Title>
      )}
      <Box style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tick={{
                fill: 'var(--foreground)',
              }}
            />
            <YAxis
              tick={{
                fill: 'var(--foreground)',
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={{
                fill: 'var(--primary)',
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
                stroke: 'var(--primary)',
                strokeWidth: 2,
                fill: 'var(--accent)',
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
