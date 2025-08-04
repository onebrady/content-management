'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  Text,
  Button,
  Grid,
  Paper,
  Group,
  Title,
  Stack,
  Loader,
  ThemeIcon,
  Skeleton,
  Badge,
  ActionIcon,
  Tooltip,
  Select,
  DatePickerInput,
  NumberInput,
  Switch,
  Divider,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconBell,
  IconRefresh,
  IconTrendingUp,
  IconTrendingDown,
  IconArrowUpRight,
  IconClock,
  IconSearch,
  IconFileText,
  IconUsers,
  IconSettings,
  IconEye,
  IconEdit,
  IconCalendar,
  IconUser,
  IconDownload,
  IconChartBar,
  IconChartLine,
  IconChartPie,
  IconChartArea,
  IconHome,
  IconChecklist,
} from '@tabler/icons-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useNavigation } from '@/hooks/useNavigation';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { StatusChart } from '@/components/analytics/StatusChart';
import { TypeChart } from '@/components/analytics/TypeChart';
import { PriorityChart } from '@/components/analytics/PriorityChart';
import { TimeSeriesChart } from '@/components/analytics/TimeSeriesChart';
import { ContributorChart } from '@/components/analytics/ContributorChart';
import { StatCard } from '@/components/analytics/StatCard';
import { TimeRangeSelector } from '@/components/analytics/TimeRangeSelector';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';
import { NextLink } from 'next/link';

export default function AnalyticsDashboard() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [exporting, setExporting] = useState(false);

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
    setExporting(true);
    try {
      await exportAnalytics(format);
    } finally {
      setExporting(false);
    }
  };

  const breadcrumbItems = [
    { label: '', href: '/dashboard', icon: <IconHome size={16} /> },
    { label: 'Analytics', href: '/analytics' },
  ];

  return (
    <AuthGuard>
      <PermissionGuard permission={PERMISSIONS.ANALYTICS_VIEW}>
        <AppLayout>
          <Box p="xl">
            {/* Header */}
            <Group justify="space-between" align="flex-start" mb="xl">
              <div>
                <Title order={1} size="h2" mb="xs">
                  Analytics Dashboard
                </Title>
                <Text size="lg" c="dimmed">
                  Track content performance and user engagement
                </Text>
              </div>

              {/* Export Controls */}
              <Group>
                <Button
                  variant="light"
                  leftSection={<IconDownload size={16} />}
                  onClick={() => handleExport('csv')}
                  loading={exporting}
                >
                  Export CSV
                </Button>
                <Button
                  variant="light"
                  leftSection={<IconDownload size={16} />}
                  onClick={() => handleExport('json')}
                  loading={exporting}
                >
                  Export JSON
                </Button>
              </Group>
            </Group>

            {/* Loading State */}
            {loading && (
              <Box>
                <Skeleton height={200} mb="md" />
                <Skeleton height={200} mb="md" />
                <Skeleton height={200} />
              </Box>
            )}

            {/* Analytics Content */}
            {!loading && analytics && (
              <>
                {/* Summary Cards */}
                <Grid mb="xl">
                  <Grid.Col span={{ base: 12, md: 3 }}>
                    <Card p="lg">
                      <Group>
                        <ThemeIcon size="lg" color="blue">
                          <IconFileText size={20} />
                        </ThemeIcon>
                        <div>
                          <Text size="xs" c="dimmed" tt="uppercase">
                            Total Content
                          </Text>
                          <Text size="xl" fw={700}>
                            {analytics.totalContent}
                          </Text>
                        </div>
                      </Group>
                    </Card>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 3 }}>
                    <Card p="lg">
                      <Group>
                        <ThemeIcon size="lg" color="green">
                          <IconChecklist size={20} />
                        </ThemeIcon>
                        <div>
                          <Text size="xs" c="dimmed" tt="uppercase">
                            Pending Approvals
                          </Text>
                          <Text size="xl" fw={700}>
                            {analytics.pendingApprovals}
                          </Text>
                        </div>
                      </Group>
                    </Card>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 3 }}>
                    <Card p="lg">
                      <Group>
                        <ThemeIcon size="lg" color="orange">
                          <IconUsers size={20} />
                        </ThemeIcon>
                        <div>
                          <Text size="xs" c="dimmed" tt="uppercase">
                            Active Users
                          </Text>
                          <Text size="xl" fw={700}>
                            {analytics.totalUsers}
                          </Text>
                        </div>
                      </Group>
                    </Card>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 3 }}>
                    <Card p="lg">
                      <Group>
                        <ThemeIcon size="lg" color="purple">
                          <IconChartBar size={20} />
                        </ThemeIcon>
                        <div>
                          <Text size="xs" c="dimmed" tt="uppercase">
                            Recent Activity
                          </Text>
                          <Text size="xl" fw={700}>
                            {analytics.recentActivity?.newContent || 0}
                          </Text>
                        </div>
                      </Group>
                    </Card>
                  </Grid.Col>
                </Grid>

                {/* Charts */}
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
          </Box>
        </AppLayout>
      </PermissionGuard>
    </AuthGuard>
  );
}
