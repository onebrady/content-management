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

  const isDark = colorScheme === 'dark';

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
          value: analytics.totalUsers?.toString() || '0',
          trend: 8,
        },
        {
          ...dashboardStats[3], // Recent Activity
          value: (
            (analytics.recentActivity?.newContent || 0) +
            (analytics.recentActivity?.updatedContent || 0)
          ).toString(),
          trend: 12,
        },
      ]);
    }
  }, [analytics, dashboardStats]);

  // Fetch recent content
  useEffect(() => {
    const fetchRecentContent = async () => {
      setContentLoading(true);
      try {
        const response = await fetch(
          '/api/content?limit=5&sort=updatedAt&order=desc'
        );
        if (response.ok) {
          const data = await response.json();
          setRecentContent(data.content || []);
        }
      } catch (error) {
        console.error('Error fetching recent content:', error);
      } finally {
        setContentLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchRecentContent();
    }
  }, [isAuthenticated]);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17) greeting = 'Good evening';
    return `${greeting}, ${user?.name || 'User'}!`;
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0)
      return <IconTrendingUp size={16} color="var(--mantine-color-green-6)" />;
    if (trend < 0)
      return <IconTrendingDown size={16} color="var(--mantine-color-red-6)" />;
    return null;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'green';
    if (trend < 0) return 'red';
    return 'gray';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'green';
      case 'DRAFT':
        return 'gray';
      case 'IN_REVIEW':
        return 'orange';
      case 'ARCHIVED':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
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

  if (!isAuthenticated) {
    return null;
  }

  return (
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
                Here's what's happening with your content today
              </Text>
            </div>

            {/* Quick Search */}
            <Paper 
              withBorder 
              p="md" 
              style={{ 
                minWidth: 300,
                backgroundColor: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)',
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
                    <ActionIcon variant="light" size="md">
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
                    backgroundColor: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-white)',
                    borderColor: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = isDark 
                      ? '0 4px 12px rgba(0,0,0,0.3)' 
                      : '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = isDark 
                      ? '0 1px 3px rgba(0,0,0,0.2)' 
                      : '0 1px 3px rgba(0,0,0,0.1)';
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
                        color={stat.color}
                        variant="light"
                        radius="md"
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
                    {stat.trend !== 0 && (
                      <Group gap={4}>
                        {getTrendIcon(stat.trend)}
                        <Badge
                          size="xs"
                          color={getTrendColor(stat.trend)}
                          variant="light"
                        >
                          {Math.abs(stat.trend)}%
                        </Badge>
                      </Group>
                    )}
                  </Group>
                </Paper>
              </Grid.Col>
            ))}
          </Grid>
        </Box>

        <Grid>
          {/* Quick Actions */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card 
              withBorder 
              shadow="sm" 
              h={{ base: 'auto', md: 400 }}
              style={{
                backgroundColor: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-white)',
                borderColor: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)',
              }}
            >
              <Card.Section p="lg">
                <Group justify="space-between">
                  <Title order={3}>Quick Actions</Title>
                  <Badge variant="light" color="blue">
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
                      style={{
                        transition: 'all 0.2s ease',
                        height: 'auto',
                        minHeight: '50px',
                        backgroundColor: isDark ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-gray-0)',
                        borderColor: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-2)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(4px)';
                        e.currentTarget.style.backgroundColor = isDark 
                          ? 'var(--mantine-color-dark-4)' 
                          : 'var(--mantine-color-gray-1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.backgroundColor = isDark 
                          ? 'var(--mantine-color-dark-5)' 
                          : 'var(--mantine-color-gray-0)';
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
                backgroundColor: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-white)',
                borderColor: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)',
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
                        <ThemeIcon color="blue" variant="light" size="lg">
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
                        <Badge size="xs" color="blue" variant="light">
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
                            {analytics.recentActivity.newComments} new comments
                            added
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
                            color="var(--mantine-color-gray-4)"
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
                    <IconBell size={32} color="var(--mantine-color-red-4)" />
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
              rightSection={<IconArrowUpRight size={14} />}
              onClick={() => router.push('/content')}
            >
              View All
            </Button>
          </Group>
          <Card 
            withBorder 
            shadow="sm"
            style={{
              backgroundColor: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-white)',
              borderColor: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)',
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
                          backgroundColor: isDark ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-gray-1)',
                          borderColor: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-2)',
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
                            color="var(--mantine-color-gray-5)"
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
                          <Badge size="xs" color="blue" variant="light">
                            {content.type}
                          </Badge>
                        </Group>
                      </div>
                      <Group gap="xs">
                        <Tooltip label="View content">
                          <ActionIcon
                            variant="light"
                            size="sm"
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
                  <IconFileText size={32} color="var(--mantine-color-gray-4)" />
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
  );
}
