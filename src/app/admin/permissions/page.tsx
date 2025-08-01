'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PermissionGuard, RoleGuard, MinimumRoleGuard } from '@/components/auth/PermissionGuard';
import { PermissionError } from '@/components/auth/PermissionError';
import { useAuth } from '@/hooks/useAuth';
import { PERMISSIONS, CONTENT_PERMISSIONS, APPROVAL_PERMISSIONS, USER_PERMISSIONS } from '@/lib/permissions';
import { UserRole } from '@/types/database';

export default function PermissionsTestPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [apiResponse, setApiResponse] = useState<string>('');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const testApiCall = async (method: string) => {
    try {
      const response = await fetch('/api/test-permissions', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setApiResponse(`Error: ${error}`);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'MODERATOR':
        return 'warning';
      case 'CONTRIBUTOR':
        return 'info';
      case 'VIEWER':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Breadcrumbs />
        
        <Typography variant="h4" component="h1" gutterBottom>
          Permissions Test Page
        </Typography>

        <Grid container spacing={3}>
          {/* User Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current User
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="body1">
                    {user?.name} ({user?.email})
                  </Typography>
                  <Chip
                    label={user?.role}
                    color={getRoleColor(user?.role || '')}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Permission Tests */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Permission Guards
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Content View Permission"
                      secondary="Should be visible to all users"
                    />
                    <PermissionGuard permission={PERMISSIONS.CONTENT_VIEW}>
                      <Chip label="Visible" color="success" size="small" />
                    </PermissionGuard>
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="Content Create Permission"
                      secondary="Should be visible to CONTRIBUTOR+"
                    />
                    <PermissionGuard permission={PERMISSIONS.CONTENT_CREATE}>
                      <Chip label="Visible" color="success" size="small" />
                    </PermissionGuard>
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="User Management Permission"
                      secondary="Should be visible to ADMIN only"
                    />
                    <PermissionGuard permission={PERMISSIONS.USER_ROLE_MANAGE}>
                      <Chip label="Visible" color="success" size="small" />
                    </PermissionGuard>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Role Tests */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Role Guards
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Admin Only Content"
                      secondary="Should be visible to ADMIN only"
                    />
                    <RoleGuard roles={[UserRole.ADMIN]}>
                      <Chip label="Visible" color="success" size="small" />
                    </RoleGuard>
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="Moderator+ Content"
                      secondary="Should be visible to MODERATOR and ADMIN"
                    />
                    <RoleGuard roles={[UserRole.MODERATOR, UserRole.ADMIN]}>
                      <Chip label="Visible" color="success" size="small" />
                    </RoleGuard>
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="Minimum Role Test"
                      secondary="Should be visible to CONTRIBUTOR+"
                    />
                    <MinimumRoleGuard minimumRole={UserRole.CONTRIBUTOR}>
                      <Chip label="Visible" color="success" size="small" />
                    </MinimumRoleGuard>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* API Test */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  API Permission Tests
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => testApiCall('GET')}
                  >
                    Test GET (Content View)
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => testApiCall('POST')}
                  >
                    Test POST (Content Create)
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => testApiCall('PUT')}
                  >
                    Test PUT (Moderator+)
                  </Button>
                </Box>

                {apiResponse && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                      {apiResponse}
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Permission Error Test */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Permission Error Component
                </Typography>
                
                <PermissionGuard
                  permission={PERMISSIONS.USER_ROLE_MANAGE}
                  fallback={
                    <PermissionError
                      title="Access Restricted"
                      message="This section is only available to administrators."
                      showBackButton={false}
                    />
                  }
                >
                  <Alert severity="success">
                    This content is only visible to users with USER_ROLE_MANAGE permission.
                  </Alert>
                </PermissionGuard>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
} 