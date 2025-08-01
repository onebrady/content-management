'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Person,
  AdminPanelSettings,
  SupervisorAccount,
  Create,
  Visibility,
} from '@mui/icons-material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
  }, [isAuthenticated]);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      const response = await fetch('/api/users');
      console.log('Users API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Users data received:', data);
        setUsers(data);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch users:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
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
      console.log('Updating user:', selectedUser.id, 'with data:', editForm);
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });
      console.log('Update user response status:', response.status);

      if (response.ok) {
        const updatedUser = await response.json();
        console.log('User updated successfully:', updatedUser);
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
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      console.log('Deleting user:', userId);
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      console.log('Delete user response status:', response.status);

      if (response.ok) {
        console.log('User deleted successfully');
        setNotification({
          open: true,
          message: 'User deleted successfully',
          severity: 'success',
        });
        fetchUsers();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to delete user:', response.status, errorData);
        setNotification({
          open: true,
          message: errorData.error || 'Failed to delete user',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setNotification({
        open: true,
        message: 'Error deleting user',
        severity: 'error',
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <AdminPanelSettings />;
      case 'MODERATOR':
        return <SupervisorAccount />;
      case 'CONTRIBUTOR':
        return <Create />;
      case 'VIEWER':
        return <Visibility />;
      default:
        return <Person />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'MODERATOR':
        return 'warning';
      case 'CONTRIBUTOR':
        return 'primary';
      case 'VIEWER':
        return 'default';
      default:
        return 'default';
    }
  };

  if (isLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Breadcrumbs />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1">
            User Management
          </Typography>
          <PermissionGuard permission={PERMISSIONS.USER_CREATE}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => router.push('/admin/users/create')}
            >
              Add User
            </Button>
          </PermissionGuard>
        </Box>

        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Person />
                          <Typography variant="body2">{user.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          icon={getRoleIcon(user.role)}
                          label={user.role}
                          color={getRoleColor(user.role) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell align="right">
                        <PermissionGuard permission={PERMISSIONS.USER_EDIT}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(user)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </PermissionGuard>
                        <PermissionGuard permission={PERMISSIONS.USER_DELETE}>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUser(user.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </PermissionGuard>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
            >
              <TextField
                label="Name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                fullWidth
                type="email"
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({ ...editForm, role: e.target.value })
                  }
                  label="Role"
                >
                  <MenuItem value="VIEWER">Viewer</MenuItem>
                  <MenuItem value="CONTRIBUTOR">Contributor</MenuItem>
                  <MenuItem value="MODERATOR">Moderator</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Department"
                value={editForm.department}
                onChange={(e) =>
                  setEditForm({ ...editForm, department: e.target.value })
                }
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveUser} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
        >
          <Alert
            onClose={() => setNotification({ ...notification, open: false })}
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  );
}
