'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Text,
  TextInput,
  Button,
  Switch,
  Loader,
  Alert,
  Stack,
  Title,
  Group,
} from '@mantine/core';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { PERMISSIONS } from '@/lib/permissions';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { CompanyLogoUpload } from '@/components/upload/CompanyLogoUpload';

interface SystemSettings {
  siteName: string;
  defaultLanguage: string;
  maintenanceMode: boolean;
  companyLogo?: string;
}

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
    }
  }, [isAuthenticated]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        showNotification('Failed to load settings', 'error');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showNotification('Error fetching settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        showNotification('Settings saved successfully', 'success');
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('Error saving settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({ open: true, message, severity });
  };

  if (isLoading || loading) {
    return <LoadingSpinner />;
  }

  return (
    <PermissionGuard
      permission={PERMISSIONS.SETTINGS_VIEW}
      fallback={<div>You do not have permission to view this page.</div>}
    >
      <AppLayout>
        <Box p="md">
          <Breadcrumbs />
          <Title order={1} mb="lg">
            System Settings
          </Title>

          <Paper p="lg" style={{ maxWidth: 800, margin: '0 auto' }}>
            {settings ? (
              <Stack gap="lg">
                <TextInput
                  label="Site Name"
                  value={settings.siteName}
                  onChange={(e) =>
                    setSettings({ ...settings, siteName: e.target.value })
                  }
                  disabled={isSaving}
                />
                <TextInput
                  label="Default Language"
                  value={settings.defaultLanguage}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      defaultLanguage: e.target.value,
                    })
                  }
                  disabled={isSaving}
                />
                <Box>
                  <Text size="sm" fw={500} mb="xs">
                    Company Logo
                  </Text>
                  <Text size="xs" c="dimmed" mb="md">
                    This logo will appear on the signin page instead of 'Welcome
                    Back' text
                  </Text>
                  <CompanyLogoUpload
                    currentLogoUrl={settings.companyLogo}
                    onLogoUpdate={(logoUrl) =>
                      setSettings({
                        ...settings,
                        companyLogo: logoUrl,
                      })
                    }
                    onLogoRemove={() =>
                      setSettings({
                        ...settings,
                        companyLogo: '',
                      })
                    }
                    disabled={isSaving}
                  />
                </Box>
                <Switch
                  label="Maintenance Mode"
                  checked={settings.maintenanceMode}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maintenanceMode: e.currentTarget.checked,
                    })
                  }
                  disabled={isSaving}
                />
                <Group justify="flex-end">
                  <PermissionGuard permission={PERMISSIONS.SETTINGS_EDIT}>
                    <Button
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      leftSection={isSaving ? <Loader size="sm" /> : null}
                    >
                      {isSaving ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </PermissionGuard>
                </Group>
              </Stack>
            ) : (
              <Alert color="red" title="Error">
                Could not load settings.
              </Alert>
            )}
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
      </AppLayout>
    </PermissionGuard>
  );
}
