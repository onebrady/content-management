'use client';

import { Box, Text, useMantineColorScheme } from '@mantine/core';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { ContentStatusCount } from '@/lib/analytics';

interface StatusChartProps {
  data: ContentStatusCount[];
}

export function StatusChart({ data }: StatusChartProps) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  // Define colors for different statuses using our theme colors
  const COLORS = {
    DRAFT: 'var(--muted-foreground)',
    IN_REVIEW: 'var(--primary)',
    APPROVED: 'var(--secondary)',
    REJECTED: 'var(--destructive)',
    PUBLISHED: 'var(--chart-1)',
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
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
            {payload[0].name}: {payload[0].value} (
            {payload[0].payload.percentage}%)
          </Text>
        </Box>
      );
    }

    return null;
  };

  // Calculate percentages
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const chartData = data.map((item) => ({
    name: item.status,
    value: item.count,
    percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
  }));

  return (
    <Box style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percentage }) => `${name}: ${percentage}%`}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  COLORS[entry.name as keyof typeof COLORS] || 'var(--muted)'
                }
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
}
