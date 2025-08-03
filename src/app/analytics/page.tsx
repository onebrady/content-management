'use client';

import { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Grid,
  Paper,
  Box,
  Button,
  Breadcrumbs,
  Anchor,
  Divider,
  Loader,
  Alert,
  Group,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconDownload,
  IconHome,
  IconDashboard,
  IconArticle,
  IconMessage,
  IconCheck,
  IconClock,
} from '@tabler/icons-react';
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
import { AppLayout } from '@/components/layout/AppLayout';
import NextLink from 'next/link';

export default function AnalyticsDashboard() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

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

  const breadcrumbItems = [
    { label: '', href: '/dashboard', icon: <IconHome size={16} /> },
    { label: 'Analytics', href: '/analytics' },
  ];

  return (
    <PermissionGuard permission={PERMISSIONS.ANALYTICS_VIEW}>
      <AppLayout>
        <Container size="xl" py="xl">
          {/* Breadcrumbs */}
          <Breadcrumbs mb="lg">
            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1;

              if (isLast) {
                return (
                  <Text key={item.href} size="sm" c="dimmed">
                    {item.icon} {item.label}
                  </Text>
                );
              }

              return (
                <Anchor
                  key={item.href}
                  component={NextLink}
                  href={item.href}
                  size="sm"
                  c="blue"
                >
                  {item.icon} {item.label}
                </Anchor>
              );
            })}
          </Breadcrumbs>

          <Group justify="space-between" mb="lg">
            <Title order={1}>Analytics Dashboard</Title>
            <Button
              variant="outline"
              leftSection={<IconDownload size={16} />}
              onClick={() => handleExport('csv')}
            >
              Export Data
            </Button>
          </Group>

          {/* Time Range Selector */}
          <TimeRangeSelector
            timeRange={timeRange}
            onTimeRangeChange={updateTimeRange}
          />

          {/* Loading and Error States */}
          {loading && (
            <Box ta="center" py="xl">
              <Loader size="lg" />
            </Box>
          )}

          {error && (
            <Alert color="red" mb="lg">
              {error}
            </Alert>
          )}

          {/* Dashboard Content */}
          {!loading && analytics && (
            <>
              {/* Summary Stats */}
              <Grid mb="xl">
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <StatCard
                    title="Total Content"
                    value={analytics.totalContent}
                    icon={<IconArticle />}
                    color="blue"
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
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <StatCard
                    title="Total Users"
                    value={analytics.totalUsers}
                    icon={<IconDashboard />}
                    color="green"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <StatCard
                    title="Comments"
                    value={analytics.totalComments}
                    icon={<IconMessage />}
                    color="cyan"
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
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <StatCard
                    title="Approvals"
                    value={analytics.totalApprovals}
                    icon={<IconCheck />}
                    color="teal"
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
                </Grid.Col>
              </Grid>

              {/* Content Creation Over Time */}
              <Paper
                p="lg"
                mb="xl"
                style={{
                  backgroundColor: isDark
                    ? 'var(--mantine-color-dark-7)'
                    : 'var(--mantine-color-white)',
                  borderColor: isDark
                    ? 'var(--mantine-color-dark-4)'
                    : 'var(--mantine-color-gray-3)',
                }}
              >
                <TimeSeriesChart
                  data={analytics.contentCreationOverTime}
                  title="Content Creation Over Time"
                />
              </Paper>

              {/* Content Distribution */}
              <Title order={2} mb="md">
                Content Distribution
              </Title>
              <Grid mb="xl">
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Paper
                    p="lg"
                    style={{
                      backgroundColor: isDark
                        ? 'var(--mantine-color-dark-7)'
                        : 'var(--mantine-color-white)',
                      borderColor: isDark
                        ? 'var(--mantine-color-dark-4)'
                        : 'var(--mantine-color-gray-3)',
                    }}
                  >
                    <Title order={3} mb="md">
                      By Status
                    </Title>
                    <StatusChart data={analytics.contentByStatus} />
                  </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Paper
                    p="lg"
                    style={{
                      backgroundColor: isDark
                        ? 'var(--mantine-color-dark-7)'
                        : 'var(--mantine-color-white)',
                      borderColor: isDark
                        ? 'var(--mantine-color-dark-4)'
                        : 'var(--mantine-color-gray-3)',
                    }}
                  >
                    <Title order={3} mb="md">
                      By Type
                    </Title>
                    <TypeChart data={analytics.contentByType} />
                  </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Paper
                    p="lg"
                    style={{
                      backgroundColor: isDark
                        ? 'var(--mantine-color-dark-7)'
                        : 'var(--mantine-color-white)',
                      borderColor: isDark
                        ? 'var(--mantine-color-dark-4)'
                        : 'var(--mantine-color-gray-3)',
                    }}
                  >
                    <Title order={3} mb="md">
                      By Priority
                    </Title>
                    <PriorityChart data={analytics.contentByPriority} />
                  </Paper>
                </Grid.Col>
              </Grid>

              {/* Approval Time */}
              <Paper
                p="lg"
                mb="xl"
                style={{
                  backgroundColor: isDark
                    ? 'var(--mantine-color-dark-7)'
                    : 'var(--mantine-color-white)',
                  borderColor: isDark
                    ? 'var(--mantine-color-dark-4)'
                    : 'var(--mantine-color-gray-3)',
                }}
              >
                <Title order={3} mb="md">
                  Average Approval Time
                </Title>
                <Group align="center" mb="md">
                  <IconClock size={24} color="var(--mantine-color-blue-6)" />
                  <Title order={2}>
                    {analytics.averageApprovalTime !== null
                      ? `${analytics.averageApprovalTime.toFixed(2)} hours`
                      : 'No data available'}
                  </Title>
                </Group>
              </Paper>

              {/* Top Contributors */}
              <Paper
                p="lg"
                mb="xl"
                style={{
                  backgroundColor: isDark
                    ? 'var(--mantine-color-dark-7)'
                    : 'var(--mantine-color-white)',
                  borderColor: isDark
                    ? 'var(--mantine-color-dark-4)'
                    : 'var(--mantine-color-gray-3)',
                }}
              >
                <Title order={3} mb="md">
                  Top Contributors
                </Title>
                <ContributorChart data={analytics.topContributors} />
              </Paper>
            </>
          )}
        </Container>
      </AppLayout>
    </PermissionGuard>
  );
}
