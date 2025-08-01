'use client';

import { Box, Typography, useTheme } from '@mui/material';
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
  const theme = useTheme();

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
            {label}: {payload[0].value}
          </Typography>
        </Box>
      );
    }

    return null;
  };

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill={theme.palette.primary.main} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
