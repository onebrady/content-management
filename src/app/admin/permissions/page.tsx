'use client';

import { useState } from 'react';
import {
  Box,
  Text,
  Paper,
  Button,
  Alert,
  Grid,
  List,
  Badge,
  Group,
  Stack,
  Title,
} from '@mantine/core';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  PermissionGuard,
  RoleGuard,
  MinimumRoleGuard,
} from '@/components/auth/PermissionGuard';
import { PermissionError } from '@/components/auth/PermissionError';
import { useAuth } from '@/hooks/useAuth';
import {
  PERMISSIONS,
  CONTENT_PERMISSIONS,
  APPROVAL_PERMISSIONS,
  USER_PERMISSIONS,
} from '@/lib/permissions';
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
        return 'red';
      case 'MODERATOR':
        return 'yellow';
      case 'CONTRIBUTOR':
        return 'blue';
      case 'VIEWER':
        return 'gray';
      default:
        return 'gray';
    }
  };

  return (
    <AppLayout>
      <Box p="md">
        <Breadcrumbs />

        <Title order={1} mb="lg">
          Permissions Test Page
        </Title>

        <Grid>
          {/* User Information */}
          <Grid.Col span={12}>
            <Paper p="md">
              <Title order={2} mb="md">
                Current User
              </Title>
              <Group gap="md" mb="md">
                <Text>
                  {user?.name} ({user?.email})
                </Text>
                <Badge color={getRoleColor(user?.role || '')} size="sm">
                  {user?.role}
                </Badge>
              </Group>
            </Paper>
          </Grid.Col>

          {/* Permission Tests */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="md">
              <Title order={2} mb="md">
                Permission Guards
              </Title>

              <Stack gap="md">
                <Group justify="space-between">
                  <Box>
                    <Text fw={500}>Content View Permission</Text>
                    <Text size="sm" c="dimmed">
                      Should be visible to all users
                    </Text>
                  </Box>
                  <PermissionGuard permission={PERMISSIONS.CONTENT_VIEW}>
                    <Badge color="green" size="sm">
                      Visible
                    </Badge>
                  </PermissionGuard>
                </Group>

                <Group justify="space-between">
                  <Box>
                    <Text fw={500}>Content Create Permission</Text>
                    <Text size="sm" c="dimmed">
                      Should be visible to CONTRIBUTOR+
                    </Text>
                  </Box>
                  <PermissionGuard permission={PERMISSIONS.CONTENT_CREATE}>
                    <Badge color="green" size="sm">
                      Visible
                    </Badge>
                  </PermissionGuard>
                </Group>

                <Group justify="space-between">
                  <Box>
                    <Text fw={500}>User Management Permission</Text>
                    <Text size="sm" c="dimmed">
                      Should be visible to ADMIN only
                    </Text>
                  </Box>
                  <PermissionGuard permission={PERMISSIONS.USER_ROLE_MANAGE}>
                    <Badge color="green" size="sm">
                      Visible
                    </Badge>
                  </PermissionGuard>
                </Group>
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Role Tests */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="md">
              <Title order={2} mb="md">
                Role Guards
              </Title>

              <Stack gap="md">
                <Group justify="space-between">
                  <Box>
                    <Text fw={500}>Admin Only Content</Text>
                    <Text size="sm" c="dimmed">
                      Should be visible to ADMIN only
                    </Text>
                  </Box>
                  <RoleGuard roles={[UserRole.ADMIN]}>
                    <Badge color="green" size="sm">
                      Visible
                    </Badge>
                  </RoleGuard>
                </Group>

                <Group justify="space-between">
                  <Box>
                    <Text fw={500}>Moderator+ Content</Text>
                    <Text size="sm" c="dimmed">
                      Should be visible to MODERATOR and ADMIN
                    </Text>
                  </Box>
                  <RoleGuard roles={[UserRole.MODERATOR, UserRole.ADMIN]}>
                    <Badge color="green" size="sm">
                      Visible
                    </Badge>
                  </RoleGuard>
                </Group>

                <Group justify="space-between">
                  <Box>
                    <Text fw={500}>Minimum Role Test</Text>
                    <Text size="sm" c="dimmed">
                      Should be visible to CONTRIBUTOR+
                    </Text>
                  </Box>
                  <MinimumRoleGuard minimumRole={UserRole.CONTRIBUTOR}>
                    <Badge color="green" size="sm">
                      Visible
                    </Badge>
                  </MinimumRoleGuard>
                </Group>
              </Stack>
            </Paper>
          </Grid.Col>

          {/* API Test */}
          <Grid.Col span={12}>
            <Paper p="md">
              <Title order={2} mb="md">
                API Permission Tests
              </Title>

              <Group gap="md" mb="md">
                <Button variant="outline" onClick={() => testApiCall('GET')}>
                  Test GET (Content View)
                </Button>
                <Button variant="outline" onClick={() => testApiCall('POST')}>
                  Test POST (Content Create)
                </Button>
                <Button variant="outline" onClick={() => testApiCall('PUT')}>
                  Test PUT (Moderator+)
                </Button>
              </Group>

              {apiResponse && (
                <Alert color="blue" title="API Response">
                  <Text component="pre" style={{ whiteSpace: 'pre-wrap' }}>
                    {apiResponse}
                  </Text>
                </Alert>
              )}
            </Paper>
          </Grid.Col>

          {/* Permission Error Test */}
          <Grid.Col span={12}>
            <Paper p="md">
              <Title order={2} mb="md">
                Permission Error Component
              </Title>

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
                <Alert color="green">
                  This content is only visible to users with USER_ROLE_MANAGE
                  permission.
                </Alert>
              </PermissionGuard>
            </Paper>
          </Grid.Col>
        </Grid>
      </Box>
    </AppLayout>
  );
}
