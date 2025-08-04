'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Text,
  Button,
  Table,
  Badge,
  ActionIcon,
  Modal,
  Select,
  TextInput,
  Alert,
  Group,
  Stack,
  Title,
} from '@mantine/core';
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconUser,
  IconShieldLock,
  IconUserCheck,
  IconPencil,
  IconEye,
} from '@tabler/icons-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
}

export default function UsersPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
  });
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated, user, isLoading]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data || []); // API returns users directly, not in a users property
      } else {
        console.error('Failed to fetch users:', response.status);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false); // Always set loading to false when the request completes
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setNotification({
          open: true,
          message: 'User updated successfully',
          severity: 'success',
        });
        setEditDialogOpen(false);
        fetchUsers();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update user:', response.status, errorData);
        setNotification({
          open: true,
          message: errorData.error || 'Failed to update user',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setNotification({
        open: true,
        message: 'Error updating user',
        severity: 'error',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      if (!window.confirm('Are you sure you want to delete this user?')) {
        return;
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        setUsers((prev) => prev.filter((user) => user.id !== userId));
        setNotification({
          open: true,
          message: 'User deleted successfully',
          severity: 'success',
        });
      } else {
        let errorMessage = 'Failed to delete user';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('Delete error response:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
        }
        setNotification({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setNotification({
        open: true,
        message: 'An unexpected error occurred while deleting the user',
        severity: 'error',
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <IconShieldLock size={16} />;
      case 'MODERATOR':
        return <IconUserCheck size={16} />;
      case 'CONTRIBUTOR':
        return <IconPencil size={16} />;
      case 'VIEWER':
        return <IconEye size={16} />;
      default:
        return <IconUser size={16} />;
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

  if (isLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppLayout>
      <Box p="md">
        <Breadcrumbs />

        <Group justify="space-between" align="center" mb="lg">
          <Title order={1}>User Management</Title>
          <PermissionGuard permission={PERMISSIONS.USER_CREATE}>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => router.push('/admin/users/create')}
            >
              Add User
            </Button>
          </PermissionGuard>
        </Group>

        <Paper p="md">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Department</Table.Th>
                <Table.Th ta="right">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.map((user) => (
                <Table.Tr key={user.id}>
                  <Table.Td>
                    <Group gap="xs">
                      <IconUser size={16} />
                      <Text size="sm">{user.name}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>{user.email}</Table.Td>
                  <Table.Td>
                    <Badge
                      leftSection={getRoleIcon(user.role)}
                      color={getRoleColor(user.role)}
                      size="sm"
                    >
                      {user.role}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{user.department || '-'}</Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="flex-end">
                      <PermissionGuard permission={PERMISSIONS.USER_EDIT}>
                        <ActionIcon
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          color="blue"
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      </PermissionGuard>
                      <PermissionGuard
                        permission={PERMISSIONS.USER_DELETE}
                        fallback={
                          <Text size="xs" c="red">
                            No delete permission
                          </Text>
                        }
                      >
                        <ActionIcon
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          color="red"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </PermissionGuard>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>

        {/* Edit User Modal */}
        <Modal
          opened={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          title="Edit User"
        >
          <Stack gap="md">
            <TextInput
              label="Name"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
            />
            <TextInput
              label="Email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
              type="email"
            />
            <Select
              label="Role"
              value={editForm.role}
              onChange={(value) =>
                setEditForm({ ...editForm, role: value || '' })
              }
              data={[
                { value: 'VIEWER', label: 'Viewer' },
                { value: 'CONTRIBUTOR', label: 'Contributor' },
                { value: 'MODERATOR', label: 'Moderator' },
                { value: 'ADMIN', label: 'Admin' },
              ]}
            />
            <TextInput
              label="Department"
              value={editForm.department}
              onChange={(e) =>
                setEditForm({ ...editForm, department: e.target.value })
              }
            />
          </Stack>

          <Group justify="flex-end" gap="xs" mt="md">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>Save</Button>
          </Group>
        </Modal>

        {/* Notification */}
        {notification.open && (
          <Alert
            color={notification.severity === 'success' ? 'green' : 'red'}
            title={notification.severity === 'success' ? 'Success' : 'Error'}
            onClose={() => setNotification({ ...notification, open: false })}
            style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}
          >
            {notification.message}
          </Alert>
        )}
      </Box>
    </AppLayout>
  );
}
