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

  // Define colors for different statuses using Mantine color system
  const COLORS = {
    DRAFT: isDark ? 'var(--mantine-color-gray-5)' : 'var(--mantine-color-gray-6)',
    IN_REVIEW: isDark ? 'var(--mantine-color-blue-5)' : 'var(--mantine-color-blue-6)',
    APPROVED: isDark ? 'var(--mantine-color-green-5)' : 'var(--mantine-color-green-6)',
    REJECTED: isDark ? 'var(--mantine-color-red-5)' : 'var(--mantine-color-red-6)',
    PUBLISHED: isDark ? 'var(--mantine-color-indigo-5)' : 'var(--mantine-color-indigo-6)',
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          style={{
            backgroundColor: isDark ? 'var(--mantine-color-dark-7)' : 'var(--mantine-color-white)',
            padding: '8px',
            border: `1px solid ${isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'}`,
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Text size="sm" style={{ 
            color: isDark ? 'var(--mantine-color-gray-0)' : 'var(--mantine-color-dark-9)' 
          }}>
            {payload[0].name}: {payload[0].value} ({payload[0].payload.percentage}%)
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
                  COLORS[entry.name as keyof typeof COLORS] ||
                  (isDark ? 'var(--mantine-color-gray-4)' : 'var(--mantine-color-gray-3)')
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
