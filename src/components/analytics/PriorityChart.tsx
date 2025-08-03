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
            {label}: {payload[0].value}
          </Text>
        </Box>
      );
    }

    return null;
  };

  // Define colors for different priorities
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return isDark ? 'var(--mantine-color-green-5)' : 'var(--mantine-color-green-6)';
      case 'MEDIUM':
        return isDark ? 'var(--mantine-color-yellow-5)' : 'var(--mantine-color-yellow-6)';
      case 'HIGH':
        return isDark ? 'var(--mantine-color-orange-5)' : 'var(--mantine-color-orange-6)';
      case 'URGENT':
        return isDark ? 'var(--mantine-color-red-5)' : 'var(--mantine-color-red-6)';
      default:
        return isDark ? 'var(--mantine-color-gray-5)' : 'var(--mantine-color-gray-6)';
    }
  };

  return (
    <Box style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'}
          />
          <XAxis 
            dataKey="priority" 
            tick={{ 
              fill: isDark ? 'var(--mantine-color-gray-2)' : 'var(--mantine-color-dark-6)' 
            }}
          />
          <YAxis 
            tick={{ 
              fill: isDark ? 'var(--mantine-color-gray-2)' : 'var(--mantine-color-dark-6)' 
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="count" 
            fill={isDark ? 'var(--mantine-color-blue-5)' : 'var(--mantine-color-blue-6)'}
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getPriorityColor(entry.priority)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
