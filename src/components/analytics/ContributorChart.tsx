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
import { TopContributor } from '@/lib/analytics';

interface ContributorChartProps {
  data: TopContributor[];
}

export function ContributorChart({ data }: ContributorChartProps) {
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
            {label}: {payload[0].value} contributions
          </Text>
        </Box>
      );
    }

    return null;
  };

  return (
    <Box style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            type="number"
            tick={{
              fill: 'var(--foreground)',
            }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{
              fill: 'var(--foreground)',
            }}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="contributions"
            fill="var(--chart-2)"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
