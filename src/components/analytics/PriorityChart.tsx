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
  Cell,
} from 'recharts';
import { ContentPriorityCount } from '@/lib/analytics';

interface PriorityChartProps {
  data: ContentPriorityCount[];
}

export function PriorityChart({ data }: PriorityChartProps) {
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

  // Define colors for different priorities using our theme colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'var(--secondary)';
      case 'MEDIUM':
        return 'var(--primary)';
      case 'HIGH':
        return 'var(--chart-1)';
      case 'URGENT':
        return 'var(--destructive)';
      default:
        return 'var(--muted-foreground)';
    }
  };

  return (
    <Box style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="priority"
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
          <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getPriorityColor(entry.priority)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
