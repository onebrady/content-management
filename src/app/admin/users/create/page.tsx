'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Text,
  Button,
  TextInput,
  Select,
  Alert,
  Stack,
  Title,
  Group,
} from '@mantine/core';
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
        <Box p="md">
          <Breadcrumbs />

          <Title order={1} mb="lg">
            Create New User
          </Title>

          <Paper p="lg" style={{ maxWidth: 600, margin: '0 auto' }}>
            <form onSubmit={handleSubmit}>
              <Stack gap="lg">
                <TextInput
                  label="Name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  required
                  error={errors.name ? 'Name is required' : null}
                  disabled={isSubmitting}
                />

                <TextInput
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  required
                  error={errors.email ? 'Valid email is required' : null}
                  disabled={isSubmitting}
                />

                <Select
                  label="Role"
                  value={formData.role}
                  onChange={(value) =>
                    setFormData({ ...formData, role: value || 'VIEWER' })
                  }
                  required
                  error={errors.role ? 'Role is required' : null}
                  disabled={isSubmitting}
                  data={[
                    { value: 'VIEWER', label: 'Viewer' },
                    { value: 'CONTRIBUTOR', label: 'Contributor' },
                    { value: 'MODERATOR', label: 'Moderator' },
                    { value: 'ADMIN', label: 'Admin' },
                  ]}
                />

                <TextInput
                  label="Department"
                  value={formData.department}
                  onChange={handleChange('department')}
                  disabled={isSubmitting}
                />

                <Group justify="space-between" mt="md">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/admin/users')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create User'}
                  </Button>
                </Group>
              </Stack>
            </form>
          </Paper>

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
      </DashboardLayout>
    </PermissionGuard>
  );
}
