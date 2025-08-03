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
            Date: {label}
          </Text>
          {payload.map((entry: any, index: number) => (
            <Text key={index} size="sm" style={{ 
              color: entry.color 
            }}>
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
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'}
            />
            <XAxis 
              dataKey="date" 
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
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke={isDark ? 'var(--mantine-color-blue-5)' : 'var(--mantine-color-blue-6)'}
              strokeWidth={2}
              dot={{ 
                fill: isDark ? 'var(--mantine-color-blue-5)' : 'var(--mantine-color-blue-6)',
                strokeWidth: 2,
                r: 4
              }}
              activeDot={{ 
                r: 6,
                stroke: isDark ? 'var(--mantine-color-blue-5)' : 'var(--mantine-color-blue-6)',
                strokeWidth: 2,
                fill: isDark ? 'var(--mantine-color-blue-3)' : 'var(--mantine-color-blue-1)'
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
