'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Approval,
  People,
  Settings,
  TrendingUp,
  Article,
  Notifications,
} from '@mui/icons-material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { UserProfile } from '@/components/user/UserProfile';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { analytics, loading: analyticsLoading } = useAnalytics();
  const router = useRouter();
  const [stats, setStats] = useState([
    {
      title: 'Total Content',
      value: '0',
      icon: <Article />,
      color: 'primary.main',
    },
    {
      title: 'Pending Approvals',
      value: '0',
      icon: <Approval />,
      color: 'warning.main',
    },
    {
      title: 'Active Users',
      value: '0',
      icon: <People />,
      color: 'success.main',
    },
    {
      title: 'Recent Activity',
      value: '0',
      icon: <TrendingUp />,
      color: 'info.main',
    },
  ]);

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
          title: 'Total Content',
          value: analytics.totalContent.toString(),
          icon: <Article />,
          color: 'primary.main',
        },
        {
          title: 'Pending Approvals',
          value:
            analytics.contentByStatus
              .find((status) => status.status === 'PENDING')
              ?.count.toString() || '0',
          icon: <Approval />,
          color: 'warning.main',
        },
        {
          title: 'Active Users',
          value: analytics.totalUsers.toString(),
          icon: <People />,
          color: 'success.main',
        },
        {
          title: 'Recent Activity',
          value: (
            analytics.recentActivity.newContent +
            analytics.recentActivity.updatedContent
          ).toString(),
          icon: <TrendingUp />,
          color: 'info.main',
        },
      ]);
    }
  }, [analytics]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const quickActions = [
    {
      title: 'Create Content',
      description: 'Create new articles, blog posts, and documents',
      icon: <Add />,
      href: '/content/create',
      roles: ['CONTRIBUTOR', 'MODERATOR', 'ADMIN'],
    },
    {
      title: 'Review Approvals',
      description: 'Review and approve pending content',
      icon: <Approval />,
      href: '/approvals',
      roles: ['MODERATOR', 'ADMIN'],
    },
    {
      title: 'Manage Users',
      description: 'Manage user roles and permissions',
      icon: <People />,
      href: '/admin/users',
      roles: ['ADMIN'],
    },
    {
      title: 'System Settings',
      description: 'Configure system settings and preferences',
      icon: <Settings />,
      href: '/admin/settings',
      roles: ['ADMIN'],
    },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Breadcrumbs />

        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>

        <Grid container spacing={3}>
          {/* User Profile */}
          <Grid item xs={12}>
            <UserProfile />
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Overview
            </Typography>
            <Grid container spacing={2}>
              {stats.map((stat) => (
                <Grid item xs={12} sm={6} md={3} key={stat.title}>
                  <Paper
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      minHeight: '100px',
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        bgcolor: stat.color,
                        color: 'white',
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box>
                      {analyticsLoading ? (
                        <CircularProgress size={24} />
                      ) : (
                        <>
                          <Typography variant="h4" component="div">
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {stat.title}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <List>
                  {quickActions
                    .filter((action) => action.roles.includes(user?.role || ''))
                    .map((action) => (
                      <ListItem key={action.title} disablePadding>
                        <ListItemButton
                          onClick={() => router.push(action.href)}
                          sx={{ borderRadius: 1, mb: 1 }}
                        >
                          <ListItemIcon>{action.icon}</ListItemIcon>
                          <ListItemText
                            primary={action.title}
                            secondary={action.description}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                {analyticsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : analytics ? (
                  <List>
                    {analytics.recentActivity.newContent > 0 && (
                      <ListItem>
                        <ListItemIcon>
                          <Article />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${analytics.recentActivity.newContent} new content items created`}
                          secondary="Last 30 days"
                        />
                      </ListItem>
                    )}
                    {analytics.recentActivity.updatedContent > 0 && (
                      <ListItem>
                        <ListItemIcon>
                          <Article />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${analytics.recentActivity.updatedContent} content items updated`}
                          secondary="Last 30 days"
                        />
                      </ListItem>
                    )}
                    {analytics.recentActivity.newComments > 0 && (
                      <ListItem>
                        <ListItemIcon>
                          <Notifications />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${analytics.recentActivity.newComments} new comments added`}
                          secondary="Last 30 days"
                        />
                      </ListItem>
                    )}
                    {analytics.recentActivity.newApprovals > 0 && (
                      <ListItem>
                        <ListItemIcon>
                          <Approval />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${analytics.recentActivity.newApprovals} content approvals processed`}
                          secondary="Last 30 days"
                        />
                      </ListItem>
                    )}
                    {analytics.totalUsers > 0 && (
                      <ListItem>
                        <ListItemIcon>
                          <People />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${analytics.totalUsers} active users`}
                          secondary="Total"
                        />
                      </ListItem>
                    )}
                    {analytics.recentActivity.newContent === 0 &&
                      analytics.recentActivity.updatedContent === 0 &&
                      analytics.recentActivity.newComments === 0 &&
                      analytics.recentActivity.newApprovals === 0 && (
                        <ListItem>
                          <ListItemText
                            primary="No recent activity"
                            secondary="Last 30 days"
                          />
                        </ListItem>
                      )}
                  </List>
                ) : (
                  <Typography color="text.secondary">
                    Unable to load recent activity
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}
