'use client';

import { Box, Typography, useTheme } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TimeSeriesDataPoint } from '@/lib/analytics';

interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
  title: string;
  color?: string;
}

export function TimeSeriesChart({ data, title, color }: TimeSeriesChartProps) {
  const theme = useTheme();
  const lineColor = color || theme.palette.primary.main;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            p: 1,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" color="text.primary">
            {new Date(label).toLocaleDateString()}: {payload[0].value}
          </Typography>
        </Box>
      );
    }

    return null;
  };

  // Format date for x-axis
  const formatXAxis = (tickItem: string) => {
    return new Date(tickItem).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={formatXAxis} minTickGap={30} />
          <YAxis allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="count"
            stroke={lineColor}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
