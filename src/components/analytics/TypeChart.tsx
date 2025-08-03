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

  return (
    <Box style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'}
          />
          <XAxis 
            dataKey="type" 
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
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
