'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, isLoading, router]);

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

  const stats = [
    {
      title: 'Total Content',
      value: '24',
      icon: <Article />,
      color: 'primary.main',
    },
    {
      title: 'Pending Approvals',
      value: '3',
      icon: <Approval />,
      color: 'warning.main',
    },
    {
      title: 'Active Users',
      value: '12',
      icon: <People />,
      color: 'success.main',
    },
    {
      title: 'Growth Rate',
      value: '+15%',
      icon: <TrendingUp />,
      color: 'info.main',
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
                      <Typography variant="h4" component="div">
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
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
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Notifications />
                    </ListItemIcon>
                    <ListItemText
                      primary="New content submitted for review"
                      secondary="2 hours ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Article />
                    </ListItemIcon>
                    <ListItemText
                      primary="Blog post published"
                      secondary="4 hours ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <People />
                    </ListItemIcon>
                    <ListItemText
                      primary="New user registered"
                      secondary="1 day ago"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}
