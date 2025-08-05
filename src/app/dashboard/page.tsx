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
  Skeleton,
  Badge,
  ActionIcon,
  Tooltip,
  TextInput,
  Menu,
  Avatar,
  Image,
  Divider,
  useMantineColorScheme,
} from '@mantine/core';
import { getAppVersion, formatVersion } from '@/lib/version';
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
} from '@tabler/icons-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useNavigation } from '@/hooks/useNavigation';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface RecentContent {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  author: string | { id: string; name: string; email: string; role: string };
  updatedAt: string;
  heroImage?: string;
}

export default function DashboardPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { analytics, loading: analyticsLoading } = useAnalytics();
  const { quickActions, dashboardStats } = useNavigation();
  const { colorScheme } = useMantineColorScheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentContent, setRecentContent] = useState<RecentContent[]>([]);
  const [contentLoading, setContentLoading] = useState(true);
  const [stats, setStats] = useState(
    dashboardStats.map((stat) => ({
      ...stat,
      value: '0',
      trend: 0, // Add trend data
    }))
  );

  useEffect(() => {
    if (analytics) {
      // Update stats with real data
      setStats([
        {
          ...dashboardStats[0], // Total Content
          value: analytics.totalContent?.toString() || '0',
          trend: 5, // Mock trend data - would come from analytics
        },
        {
          ...dashboardStats[1], // Pending Approvals
          value:
            analytics.contentByStatus
              ?.find((status) => status.status === 'IN_REVIEW')
              ?.count?.toString() || '0',
          trend: -2,
        },
        {
          ...dashboardStats[2], // Active Users
          value: analytics.topContributors?.length?.toString() || '0',
          trend: 8,
        },
        {
          ...dashboardStats[3], // Recent Activity
          value: analytics.recentActivity?.newContent?.toString() || '0',
          trend: 12,
        },
      ]);
    }
  }, [analytics, dashboardStats]);

  useEffect(() => {
    fetchRecentContent();
  }, []);

  const fetchRecentContent = async () => {
    try {
      const response = await fetch(
        '/api/content?limit=5&sort=updatedAt&order=desc'
      );
      if (response.ok) {
        const data = await response.json();
        setRecentContent(data.content || []);
      }
    } catch (error) {
      console.error('Failed to fetch recent content:', error);
    } finally {
      setContentLoading(false);
    }
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getDashboardSubtitle = () => {
    return `Welcome back, ${user?.name || 'User'}. Here's what's happening with your content.`;
  };

  const getTrendIcon = (trend: number) => {
    return trend > 0 ? IconTrendingUp : IconTrendingDown;
  };

  const getTrendColor = (trend: number) => {
    return trend > 0 ? 'green' : 'red';
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DRAFT':
        return 'gray';
      case 'IN_REVIEW':
        return 'yellow';
      case 'APPROVED':
        return 'green';
      case 'PUBLISHED':
        return 'blue';
      case 'REJECTED':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const quickSearchItems = [
    {
      icon: IconFileText,
      label: 'Search Content',
      description: 'Find articles, blog posts, and documents',
      action: () => router.push('/search?type=content'),
    },
    {
      icon: IconUsers,
      label: 'Search Users',
      description: 'Find team members and contributors',
      action: () => router.push('/search?type=users'),
    },
    {
      icon: IconSettings,
      label: 'System Settings',
      description: 'Access configuration options',
      action: () => router.push('/admin/settings'),
    },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthGuard>
      <AppLayout>
        <Box p="xl">
          {/* Welcome Section */}
          <Box mb="xl">
            <Group justify="space-between" align="flex-start">
              <div>
                <Title order={1} size="h2" mb="xs">
                  {getWelcomeMessage()}
                </Title>
                <Text size="lg" c="dimmed">
                  {getDashboardSubtitle()}
                </Text>
              </div>

              {/* Quick Search */}
              <Paper
                withBorder
                p="md"
                style={{
                  minWidth: 300,
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <Group gap="sm">
                  <TextInput
                    placeholder="Quick search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch(searchQuery);
                      }
                    }}
                    leftSection={<IconSearch size={16} />}
                    style={{ flex: 1 }}
                    size="sm"
                  />
                  <Menu shadow="md" width={300}>
                    <Menu.Target>
                      <ActionIcon
                        variant="light"
                        size="md"
                        color="primary"
                        style={{
                          backgroundColor: 'var(--accent)',
                          color: 'var(--primary)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        <IconSearch size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Label>Quick Search</Menu.Label>
                      {quickSearchItems.map((item) => (
                        <Menu.Item
                          key={item.label}
                          leftSection={<item.icon size={16} />}
                          onClick={item.action}
                        >
                          <div>
                            <Text size="sm" fw={500}>
                              {item.label}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {item.description}
                            </Text>
                          </div>
                        </Menu.Item>
                      ))}
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Paper>
            </Group>
          </Box>

          {/* Quick Stats */}
          <Box mb="xl">
            <Group justify="space-between" mb="md">
              <Title order={3}>Overview</Title>
              <Tooltip label="Refresh data">
                <ActionIcon
                  variant="light"
                  size="md"
                  color="primary"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--primary)',
                    borderColor: 'var(--border)',
                  }}
                  onClick={() => window.location.reload()}
                >
                  <IconRefresh size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
            <Grid>
              {stats.map((stat) => (
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }} key={stat.title}>
                  <Paper
                    p="lg"
                    withBorder
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    }}
                    onClick={() => {
                      // Navigate based on stat type
                      if (stat.title === 'In Review') router.push('/approvals');
                      else if (stat.title === 'Total Content')
                        router.push('/content');
                      else if (stat.title === 'Active Users')
                        router.push('/admin/users');
                    }}
                  >
                    <Group justify="space-between" align="flex-start">
                      <Group gap="md">
                        <ThemeIcon
                          size="xl"
                          color="primary"
                          variant="light"
                          radius="md"
                          style={{
                            backgroundColor: 'var(--accent)',
                            color: 'var(--primary)',
                          }}
                        >
                          <stat.icon size={24} />
                        </ThemeIcon>
                        <div>
                          {analyticsLoading ? (
                            <Skeleton height={28} width={60} />
                          ) : (
                            <Text size="xl" fw={700} lh={1}>
                              {stat.value}
                            </Text>
                          )}
                          <Text size="sm" c="dimmed" mt={4}>
                            {stat.title}
                          </Text>
                        </div>
                      </Group>
                      <Group gap="xs" align="center">
                        <Badge
                          size="sm"
                          color={getTrendColor(stat.trend)}
                          variant="light"
                          leftSection={(() => {
                            const IconComponent = getTrendIcon(stat.trend);
                            return <IconComponent size={12} />;
                          })()}
                        >
                          {Math.abs(stat.trend)}%
                        </Badge>
                      </Group>
                    </Group>
                  </Paper>
                </Grid.Col>
              ))}
            </Grid>
          </Box>

          {/* Quick Actions and Recent Activity */}
          <Grid>
            {/* Quick Actions */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card
                withBorder
                shadow="sm"
                h={{ base: 'auto', md: 400 }}
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  boxShadow: 'var(--shadow)',
                }}
              >
                <Card.Section p="lg">
                  <Group justify="space-between">
                    <Title order={3}>Quick Actions</Title>
                    <Badge variant="light" color="primary">
                      {quickActions.length} available
                    </Badge>
                  </Group>
                </Card.Section>
                <Card.Section p="lg" pt={0} style={{ flex: 1 }}>
                  <Stack gap="sm">
                    {quickActions.map((action) => (
                      <Button
                        key={action.title}
                        variant="light"
                        leftSection={<action.icon size={18} />}
                        rightSection={<IconArrowUpRight size={16} />}
                        onClick={() => router.push(action.href)}
                        justify="space-between"
                        fullWidth
                        size="md"
                        py="xs"
                        px="md"
                        color="primary"
                        style={{
                          transition: 'all 0.2s ease',
                          height: 'auto',
                          minHeight: '50px',
                          backgroundColor: 'var(--accent)',
                          borderColor: 'var(--border)',
                          color: 'var(--primary)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateX(4px)';
                          e.currentTarget.style.backgroundColor =
                            'var(--secondary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.backgroundColor =
                            'var(--accent)';
                        }}
                      >
                        <div>
                          <Text size="sm" fw={500} mb={1}>
                            {action.title}
                          </Text>
                          <Text size="xs" c="dimmed" lineClamp={1}>
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
              <Card
                withBorder
                shadow="sm"
                h={{ base: 'auto', md: 400 }}
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  boxShadow: 'var(--shadow)',
                }}
              >
                <Card.Section p="lg">
                  <Group justify="space-between">
                    <Title order={3}>Recent Activity</Title>
                    <Group gap="xs">
                      <IconClock size={16} />
                      <Text size="xs" c="dimmed">
                        Last 30 days
                      </Text>
                    </Group>
                  </Group>
                </Card.Section>
                <Card.Section p="lg" pt={0} style={{ flex: 1 }}>
                  {analyticsLoading ? (
                    <Stack gap="md">
                      {[1, 2, 3].map((i) => (
                        <Group key={i}>
                          <Skeleton height={32} width={32} radius="xl" />
                          <div style={{ flex: 1 }}>
                            <Skeleton height={16} width="60%" />
                            <Skeleton height={12} width="40%" mt={4} />
                          </div>
                        </Group>
                      ))}
                    </Stack>
                  ) : analytics ? (
                    <Stack gap="md">
                      {(analytics.recentActivity?.newContent || 0) > 0 && (
                        <Group>
                          <ThemeIcon color="primary" variant="light" size="lg">
                            <IconBell size={18} />
                          </ThemeIcon>
                          <div style={{ flex: 1 }}>
                            <Text size="sm" fw={500}>
                              {analytics.recentActivity.newContent} new content
                              items created
                            </Text>
                            <Text size="xs" c="dimmed">
                              Content creation activity
                            </Text>
                          </div>
                          <Badge size="xs" color="primary" variant="light">
                            New
                          </Badge>
                        </Group>
                      )}
                      {(analytics.recentActivity?.updatedContent || 0) > 0 && (
                        <Group>
                          <ThemeIcon color="green" variant="light" size="lg">
                            <IconBell size={18} />
                          </ThemeIcon>
                          <div style={{ flex: 1 }}>
                            <Text size="sm" fw={500}>
                              {analytics.recentActivity.updatedContent} content
                              items updated
                            </Text>
                            <Text size="xs" c="dimmed">
                              Content modification activity
                            </Text>
                          </div>
                          <Badge size="xs" color="green" variant="light">
                            Updated
                          </Badge>
                        </Group>
                      )}
                      {(analytics.recentActivity?.newComments || 0) > 0 && (
                        <Group>
                          <ThemeIcon color="yellow" variant="light" size="lg">
                            <IconBell size={18} />
                          </ThemeIcon>
                          <div style={{ flex: 1 }}>
                            <Text size="sm" fw={500}>
                              {analytics.recentActivity.newComments} new
                              comments added
                            </Text>
                            <Text size="xs" c="dimmed">
                              User engagement activity
                            </Text>
                          </div>
                          <Badge size="xs" color="yellow" variant="light">
                            Comments
                          </Badge>
                        </Group>
                      )}
                      {(analytics.recentActivity?.newApprovals || 0) > 0 && (
                        <Group>
                          <ThemeIcon color="green" variant="light" size="lg">
                            <IconBell size={18} />
                          </ThemeIcon>
                          <div style={{ flex: 1 }}>
                            <Text size="sm" fw={500}>
                              {analytics.recentActivity.newApprovals} content
                              approvals processed
                            </Text>
                            <Text size="xs" c="dimmed">
                              Approval workflow activity
                            </Text>
                          </div>
                          <Badge size="xs" color="green" variant="light">
                            Approved
                          </Badge>
                        </Group>
                      )}
                      {(analytics.totalUsers || 0) > 0 && (
                        <Group>
                          <ThemeIcon color="cyan" variant="light" size="lg">
                            <IconBell size={18} />
                          </ThemeIcon>
                          <div style={{ flex: 1 }}>
                            <Text size="sm" fw={500}>
                              {analytics.totalUsers} active users
                            </Text>
                            <Text size="xs" c="dimmed">
                              System user count
                            </Text>
                          </div>
                          <Badge size="xs" color="cyan" variant="light">
                            Active
                          </Badge>
                        </Group>
                      )}
                      {(!analytics.recentActivity?.newContent ||
                        analytics.recentActivity.newContent === 0) &&
                        (!analytics.recentActivity?.updatedContent ||
                          analytics.recentActivity.updatedContent === 0) &&
                        (!analytics.recentActivity?.newComments ||
                          analytics.recentActivity.newComments === 0) &&
                        (!analytics.recentActivity?.newApprovals ||
                          analytics.recentActivity.newApprovals === 0) && (
                          <Box ta="center" py="md">
                            <IconBell
                              size={32}
                              style={{ color: 'var(--muted-foreground4)' }}
                            />
                            <Text size="sm" c="dimmed" mt="xs">
                              No recent activity
                            </Text>
                            <Text size="xs" c="dimmed">
                              Start creating content to see activity here
                            </Text>
                          </Box>
                        )}
                    </Stack>
                  ) : (
                    <Box ta="center" py="md">
                      <IconBell
                        size={32}
                        style={{ color: 'var(--mantine-color-red-4)' }}
                      />
                      <Text size="sm" c="dimmed" mt="xs">
                        Unable to load recent activity
                      </Text>
                    </Box>
                  )}
                </Card.Section>
              </Card>
            </Grid.Col>
          </Grid>

          {/* Recent Content */}
          <Box mt="xl">
            <Group justify="space-between" mb="md">
              <Title order={3}>Recent Content</Title>
              <Button
                variant="light"
                size="sm"
                color="primary"
                onClick={() => router.push('/content')}
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--primary)',
                  borderColor: 'var(--border)',
                }}
              >
                View All
              </Button>
            </Group>
            <Card
              withBorder
              shadow="sm"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow)',
              }}
            >
              <Card.Section p="lg">
                {contentLoading ? (
                  <Stack gap="md">
                    {[1, 2, 3].map((i) => (
                      <Group key={i} align="flex-start">
                        <Skeleton height={60} width={80} radius="md" />
                        <div style={{ flex: 1 }}>
                          <Skeleton height={18} width="70%" mb="xs" />
                          <Skeleton height={14} width="40%" mb="xs" />
                          <Group gap="md">
                            <Skeleton height={20} width={60} />
                            <Skeleton height={20} width={80} />
                          </Group>
                        </div>
                      </Group>
                    ))}
                  </Stack>
                ) : recentContent.length > 0 ? (
                  <Stack gap="md">
                    {recentContent.map((content) => (
                      <Group key={content.id} align="flex-start">
                        <Paper
                          w={80}
                          h={60}
                          withBorder
                          style={{
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'var(--muted)',
                            borderColor: 'var(--border)',
                            boxShadow: 'var(--shadow-xs)',
                          }}
                        >
                          {content.heroImage ? (
                            <Image
                              src={content.heroImage}
                              alt={content.title}
                              fit="cover"
                              w="100%"
                              h="100%"
                            />
                          ) : (
                            <IconFileText
                              size={24}
                              style={{ color: 'var(--muted-foreground5)' }}
                            />
                          )}
                        </Paper>
                        <div style={{ flex: 1 }}>
                          <Text size="sm" fw={500} mb={4}>
                            {content.title}
                          </Text>
                          <Group gap="xs" mb={8}>
                            <Group gap={4}>
                              <IconUser size={12} />
                              <Text size="xs" c="dimmed">
                                {typeof content.author === 'string'
                                  ? content.author
                                  : content.author?.name || 'Unknown'}
                              </Text>
                            </Group>
                            <Group gap={4}>
                              <IconCalendar size={12} />
                              <Text size="xs" c="dimmed">
                                {formatDate(content.updatedAt)}
                              </Text>
                            </Group>
                          </Group>
                          <Group gap="xs">
                            <Badge
                              size="xs"
                              color={getStatusColor(content.status)}
                              variant="light"
                            >
                              {content.status}
                            </Badge>
                            <Badge size="xs" color="primary" variant="light">
                              {content.type}
                            </Badge>
                          </Group>
                        </div>
                        <Group gap="xs">
                          <Tooltip label="View content">
                            <ActionIcon
                              variant="light"
                              size="sm"
                              color="primary"
                              style={{
                                backgroundColor: 'var(--accent)',
                                color: 'var(--primary)',
                                borderColor: 'var(--border)',
                              }}
                              onClick={() =>
                                router.push(`/content/${content.slug}`)
                              }
                            >
                              <IconEye size={14} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Edit content">
                            <ActionIcon
                              variant="light"
                              size="sm"
                              color="secondary"
                              style={{
                                backgroundColor: 'var(--secondary)',
                                color: 'var(--secondary-foreground)',
                                borderColor: 'var(--border)',
                              }}
                              onClick={() =>
                                router.push(`/content/${content.slug}/edit`)
                              }
                            >
                              <IconEdit size={14} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Group>
                    ))}
                  </Stack>
                ) : (
                  <Box ta="center" py="md">
                    <IconFileText
                      size={32}
                      style={{ color: 'var(--muted-foreground4)' }}
                    />
                    <Text size="sm" c="dimmed" mt="xs">
                      No recent content
                    </Text>
                    <Text size="xs" c="dimmed">
                      Start creating content to see it here
                    </Text>
                  </Box>
                )}
              </Card.Section>
            </Card>
          </Box>
        </Box>
      </AppLayout>
    </AuthGuard>
  );
}
