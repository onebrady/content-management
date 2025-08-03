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
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'}
          />
          <XAxis 
            type="number"
            tick={{ 
              fill: isDark ? 'var(--mantine-color-gray-2)' : 'var(--mantine-color-dark-6)' 
            }}
          />
          <YAxis 
            type="category"
            dataKey="name"
            tick={{ 
              fill: isDark ? 'var(--mantine-color-gray-2)' : 'var(--mantine-color-dark-6)' 
            }}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="contributions" 
            fill={isDark ? 'var(--mantine-color-teal-5)' : 'var(--mantine-color-teal-6)'}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
