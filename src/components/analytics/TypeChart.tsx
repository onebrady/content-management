'use client';

import { Box, Text, useMantineColorScheme } from '@mantine/core';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ContentTypeCount } from '@/lib/analytics';

interface TypeChartProps {
  data: ContentTypeCount[];
}

export function TypeChart({ data }: TypeChartProps) {
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
            {label}: {payload[0].value}
          </Text>
        </Box>
      );
    }

    return null;
  };

  return (
    <Box style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="type"
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
          <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
