'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
} from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { UserProfile } from '@/components/user/UserProfile';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useNavigation } from '@/hooks/useNavigation';

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { analytics, loading: analyticsLoading } = useAnalytics();
  const { quickActions, dashboardStats } = useNavigation();
  const router = useRouter();
  const [stats, setStats] = useState(
    dashboardStats.map(stat => ({
      ...stat,
      value: '0',
    }))
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (analytics) {
      // Update stats with real data
      setStats([
        {
          ...dashboardStats[0], // Total Content
          value: analytics.totalContent?.toString() || '0',
        },
        {
          ...dashboardStats[1], // Pending Approvals
          value:
            analytics.contentByStatus
              ?.find((status) => status.status === 'PENDING')
              ?.count?.toString() || '0',
        },
        {
          ...dashboardStats[2], // Active Users
          value: analytics.totalUsers?.toString() || '0',
        },
        {
          ...dashboardStats[3], // Recent Activity
          value: (
            (analytics.recentActivity?.newContent || 0) +
            (analytics.recentActivity?.updatedContent || 0)
          ).toString(),
        },
      ]);
    }
  }, [analytics, dashboardStats]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppLayout>
      <Box p="md">
        <Breadcrumbs />

        <Title order={1} mb="lg">
          Dashboard
        </Title>

        <Grid>
          {/* User Profile */}
          <Grid.Col span={12}>
            <UserProfile />
          </Grid.Col>

          {/* Quick Stats */}
          <Grid.Col span={12}>
            <Title order={3} mb="md">
              Overview
            </Title>
            <Grid>
              {stats.map((stat) => (
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }} key={stat.title}>
                  <Paper p="md" withBorder>
                    <Group>
                      <ThemeIcon size="lg" color={stat.color} variant="light">
                        <stat.icon size={20} />
                      </ThemeIcon>
                      <div>
                        {analyticsLoading ? (
                          <Loader size="sm" />
                        ) : (
                          <>
                            <Text size="xl" fw={700}>
                              {stat.value}
                            </Text>
                            <Text size="sm" c="dimmed">
                              {stat.title}
                            </Text>
                          </>
                        )}
                      </div>
                    </Group>
                  </Paper>
                </Grid.Col>
              ))}
            </Grid>
          </Grid.Col>

          {/* Quick Actions */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder>
              <Card.Section p="md">
                <Title order={3}>Quick Actions</Title>
              </Card.Section>
              <Card.Section p="md">
                <Stack gap="xs">
                  {quickActions.map((action) => (
                    <Button
                      key={action.title}
                      variant="light"
                      leftSection={<action.icon size={16} />}
                      onClick={() => router.push(action.href)}
                      justify="start"
                      fullWidth
                    >
                      <div style={{ textAlign: 'left' }}>
                        <Text size="sm" fw={500}>
                          {action.title}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {action.description}
                        </Text>
                      </div>
                    </Button>
                  ))}
                </Stack>
              </Card.Section>
            </Card>
          </Grid.Col>

          {/* Recent Activity */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder>
              <Card.Section p="md">
                <Title order={3}>Recent Activity</Title>
              </Card.Section>
              <Card.Section p="md">
                {analyticsLoading ? (
                  <Box ta="center" p="md">
                    <Loader size="md" />
                  </Box>
                ) : analytics ? (
                  <Stack gap="xs">
                    {(analytics.recentActivity?.newContent || 0) > 0 && (
                      <Group>
                        <ThemeIcon color="blue" variant="light">
                          <IconBell size={16} />
                        </ThemeIcon>
                        <div>
                          <Text size="sm">
                            {analytics.recentActivity.newContent} new content items created
                          </Text>
                          <Text size="xs" c="dimmed">
                            Last 30 days
                          </Text>
                        </div>
                      </Group>
                    )}
                    {(analytics.recentActivity?.updatedContent || 0) > 0 && (
                      <Group>
                        <ThemeIcon color="blue" variant="light">
                          <IconBell size={16} />
                        </ThemeIcon>
                        <div>
                          <Text size="sm">
                            {analytics.recentActivity.updatedContent} content items updated
                          </Text>
                          <Text size="xs" c="dimmed">
                            Last 30 days
                          </Text>
                        </div>
                      </Group>
                    )}
                    {(analytics.recentActivity?.newComments || 0) > 0 && (
                      <Group>
                        <ThemeIcon color="yellow" variant="light">
                          <IconBell size={16} />
                        </ThemeIcon>
                        <div>
                          <Text size="sm">
                            {analytics.recentActivity.newComments} new comments added
                          </Text>
                          <Text size="xs" c="dimmed">
                            Last 30 days
                          </Text>
                        </div>
                      </Group>
                    )}
                    {(analytics.recentActivity?.newApprovals || 0) > 0 && (
                      <Group>
                        <ThemeIcon color="green" variant="light">
                          <IconBell size={16} />
                        </ThemeIcon>
                        <div>
                          <Text size="sm">
                            {analytics.recentActivity.newApprovals} content approvals processed
                          </Text>
                          <Text size="xs" c="dimmed">
                            Last 30 days
                          </Text>
                        </div>
                      </Group>
                    )}
                    {(analytics.totalUsers || 0) > 0 && (
                      <Group>
                        <ThemeIcon color="cyan" variant="light">
                          <IconBell size={16} />
                        </ThemeIcon>
                        <div>
                          <Text size="sm">
                            {analytics.totalUsers} active users
                          </Text>
                          <Text size="xs" c="dimmed">
                            Total
                          </Text>
                        </div>
                      </Group>
                    )}
                    {(!analytics.recentActivity?.newContent || analytics.recentActivity.newContent === 0) &&
                      (!analytics.recentActivity?.updatedContent || analytics.recentActivity.updatedContent === 0) &&
                      (!analytics.recentActivity?.newComments || analytics.recentActivity.newComments === 0) &&
                      (!analytics.recentActivity?.newApprovals || analytics.recentActivity.newApprovals === 0) && (
                        <Text size="sm" c="dimmed">
                          No recent activity
                        </Text>
                      )}
                  </Stack>
                ) : (
                  <Text c="dimmed">Unable to load recent activity</Text>
                )}
              </Card.Section>
            </Card>
          </Grid.Col>
        </Grid>
      </Box>
    </AppLayout>
  );
}
