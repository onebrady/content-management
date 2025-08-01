'use client';

import { Box, Grid, Paper, Typography, Skeleton, Chip } from '@mui/material';
import {
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  HourglassEmpty as PendingIcon,
  Assessment as TotalIcon,
} from '@mui/icons-material';

interface ApprovalStatsProps {
  stats: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
    averageApprovalTime?: string;
    approvalRate?: number;
  };
  loading: boolean;
}

export function ApprovalStats({ stats, loading }: ApprovalStatsProps) {
  const statItems = [
    {
      label: 'Pending Review',
      value: stats.pending,
      icon: <PendingIcon fontSize="large" color="warning" />,
      color: 'warning.light',
    },
    {
      label: 'Approved',
      value: stats.approved,
      icon: <ApprovedIcon fontSize="large" color="success" />,
      color: 'success.light',
    },
    {
      label: 'Rejected',
      value: stats.rejected,
      icon: <RejectedIcon fontSize="large" color="error" />,
      color: 'error.light',
    },
    {
      label: 'Total',
      value: stats.total,
      icon: <TotalIcon fontSize="large" color="primary" />,
      color: 'primary.light',
    },
  ];

  return (
    <Box sx={{ width: '100%', mb: 3 }}>
      <Grid container spacing={3}>
        {statItems.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1,
                }}
              >
                {item.icon}
              </Box>
              {loading ? (
                <Skeleton width={60} height={40} />
              ) : (
                <Typography variant="h4" component="div" fontWeight="bold">
                  {item.value}
                </Typography>
              )}
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                {item.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Additional Stats */}
      {(stats.averageApprovalTime || stats.approvalRate) && (
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {stats.averageApprovalTime && (
            <Chip
              label={`Avg. Approval Time: ${stats.averageApprovalTime}`}
              color="primary"
              variant="outlined"
            />
          )}
          {stats.approvalRate !== undefined && (
            <Chip
              label={`Approval Rate: ${stats.approvalRate}%`}
              color={stats.approvalRate > 70 ? 'success' : 'warning'}
              variant="outlined"
            />
          )}
        </Box>
      )}
    </Box>
  );
}
