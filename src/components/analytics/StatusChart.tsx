'use client';

import { Box, Typography, useTheme } from '@mui/material';
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
  const theme = useTheme();

  // Define colors for different statuses
  const COLORS = {
    DRAFT: theme.palette.grey[500],
    IN_REVIEW: theme.palette.info.main,
    APPROVED: theme.palette.success.main,
    REJECTED: theme.palette.error.main,
    PUBLISHED: theme.palette.primary.main,
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
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
            {payload[0].name}: {payload[0].value} (
            {payload[0].payload.percentage}%)
          </Typography>
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
    <Box sx={{ width: '100%', height: 300 }}>
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
                  theme.palette.grey[300]
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
