'use client';

import { Box, Typography, useTheme } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { UserActivityData } from '@/lib/analytics';

interface ContributorChartProps {
  data: UserActivityData[];
}

export function ContributorChart({ data }: ContributorChartProps) {
  const theme = useTheme();

  // Transform data for the chart
  const chartData = data.map((user) => ({
    name: user.userName,
    content: user.contentCreated,
    comments: user.commentsAdded,
    approvals: user.approvalsGiven,
  }));

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
          <Typography variant="body2" fontWeight="bold">
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography key={index} variant="body2" color={entry.color}>
              {entry.name}: {entry.value}
            </Typography>
          ))}
        </Box>
      );
    }

    return null;
  };

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="content"
            name="Content Created"
            fill={theme.palette.primary.main}
          />
          <Bar
            dataKey="comments"
            name="Comments Added"
            fill={theme.palette.secondary.main}
          />
          <Bar
            dataKey="approvals"
            name="Approvals Given"
            fill={theme.palette.success.main}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
