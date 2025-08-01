'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  Breadcrumbs,
  Link,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Article as ArticleIcon,
  Comment as CommentIcon,
  Approval as ApprovalIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useAnalytics } from '@/hooks/useAnalytics';
import { StatusChart } from '@/components/analytics/StatusChart';
import { TypeChart } from '@/components/analytics/TypeChart';
import { PriorityChart } from '@/components/analytics/PriorityChart';
import { TimeSeriesChart } from '@/components/analytics/TimeSeriesChart';
import { ContributorChart } from '@/components/analytics/ContributorChart';
import { StatCard } from '@/components/analytics/StatCard';
import { TimeRangeSelector } from '@/components/analytics/TimeRangeSelector';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';

export default function AnalyticsDashboard() {
  const {
    analytics,
    timeRange,
    loading,
    error,
    updateTimeRange,
    exportAnalytics,
    setLastDays,
  } = useAnalytics();

  // Handle export
  const handleExport = async (format: 'csv' | 'json') => {
    await exportAnalytics(format);
  };

  return (
    <PermissionGuard permission={PERMISSIONS.ANALYTICS_VIEW}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            underline="hover"
            color="inherit"
            href="/dashboard"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Dashboard
          </Link>
          <Typography color="text.primary">Analytics</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Analytics Dashboard
          </Typography>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('csv')}
          >
            Export Data
          </Button>
        </Box>

        {/* Time Range Selector */}
        <TimeRangeSelector
          timeRange={timeRange}
          onTimeRangeChange={updateTimeRange}
        />

        {/* Loading and Error States */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Dashboard Content */}
        {!loading && analytics && (
          <>
            {/* Summary Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Content"
                  value={analytics.totalContent}
                  icon={<ArticleIcon />}
                  color="primary"
                  trend={{
                    value:
                      analytics.recentActivity.newContent > 0
                        ? Math.round(
                            (analytics.recentActivity.newContent /
                              analytics.totalContent) *
                              100
                          )
                        : 0,
                    label: 'new in selected period',
                    positive: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Users"
                  value={analytics.totalUsers}
                  icon={<DashboardIcon />}
                  color="secondary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Comments"
                  value={analytics.totalComments}
                  icon={<CommentIcon />}
                  color="info"
                  trend={{
                    value:
                      analytics.recentActivity.newComments > 0
                        ? Math.round(
                            (analytics.recentActivity.newComments /
                              analytics.totalComments) *
                              100
                          )
                        : 0,
                    label: 'new in selected period',
                    positive: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Approvals"
                  value={analytics.totalApprovals}
                  icon={<ApprovalIcon />}
                  color="success"
                  trend={{
                    value:
                      analytics.recentActivity.newApprovals > 0
                        ? Math.round(
                            (analytics.recentActivity.newApprovals /
                              analytics.totalApprovals) *
                              100
                          )
                        : 0,
                    label: 'new in selected period',
                    positive: true,
                  }}
                />
              </Grid>
            </Grid>

            {/* Content Creation Over Time */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <TimeSeriesChart
                data={analytics.contentCreationOverTime}
                title="Content Creation Over Time"
              />
            </Paper>

            {/* Content Distribution */}
            <Typography variant="h5" sx={{ mb: 2 }}>
              Content Distribution
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    By Status
                  </Typography>
                  <StatusChart data={analytics.contentByStatus} />
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    By Type
                  </Typography>
                  <TypeChart data={analytics.contentByType} />
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    By Priority
                  </Typography>
                  <PriorityChart data={analytics.contentByPriority} />
                </Paper>
              </Grid>
            </Grid>

            {/* Approval Time */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Average Approval Time
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ScheduleIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h4">
                  {analytics.averageApprovalTime !== null
                    ? `${analytics.averageApprovalTime.toFixed(2)} hours`
                    : 'No data available'}
                </Typography>
              </Box>
            </Paper>

            {/* Top Contributors */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Top Contributors
              </Typography>
              <ContributorChart data={analytics.topContributors} />
            </Paper>
          </>
        )}
      </Container>
    </PermissionGuard>
  );
}
