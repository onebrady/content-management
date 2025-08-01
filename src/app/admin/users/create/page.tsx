'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Paper,
} from '@mui/material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';

export default function CreateUserPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'VIEWER',
    department: '',
  });
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    role: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const handleChange = (field: string) => (e: any) => {
    setFormData({
      ...formData,
      [field]: e.target.value,
    });

    // Clear error when field is edited
    if (errors[field as keyof typeof errors]) {
      setErrors({
        ...errors,
        [field]: false,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: !formData.name.trim(),
      email:
        !formData.email.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
      role: !formData.role,
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setNotification({
          open: true,
          message: 'User created successfully',
          severity: 'success',
        });

        // Reset form
        setFormData({
          name: '',
          email: '',
          role: 'VIEWER',
          department: '',
        });

        // Redirect after short delay
        setTimeout(() => {
          router.push('/admin/users');
        }, 2000);
      } else {
        const errorData = await response.json();
        setNotification({
          open: true,
          message: errorData.error || 'Failed to create user',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setNotification({
        open: true,
        message: 'Error creating user',
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <PermissionGuard
      permission={PERMISSIONS.USER_CREATE}
      fallback={<div>You don't have permission to create users</div>}
    >
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Breadcrumbs />

          <Typography variant="h4" component="h1" gutterBottom>
            Create New User
          </Typography>

          <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="Name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  fullWidth
                  required
                  error={errors.name}
                  helperText={errors.name ? 'Name is required' : ''}
                  disabled={isSubmitting}
                />

                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  fullWidth
                  required
                  error={errors.email}
                  helperText={errors.email ? 'Valid email is required' : ''}
                  disabled={isSubmitting}
                />

                <FormControl fullWidth required error={errors.role}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role}
                    onChange={handleChange('role')}
                    label="Role"
                    disabled={isSubmitting}
                  >
                    <MenuItem value="VIEWER">Viewer</MenuItem>
                    <MenuItem value="CONTRIBUTOR">Contributor</MenuItem>
                    <MenuItem value="MODERATOR">Moderator</MenuItem>
                    <MenuItem value="ADMIN">Admin</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Department"
                  value={formData.department}
                  onChange={handleChange('department')}
                  fullWidth
                  disabled={isSubmitting}
                />

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/admin/users')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create User'}
                  </Button>
                </Box>
              </Box>
            </form>
          </Paper>

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
    </PermissionGuard>
  );
}
