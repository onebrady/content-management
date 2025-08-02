'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
} from '@mui/material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { PERMISSIONS } from '@/lib/permissions';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

interface SystemSettings {
  siteName: string;
  defaultLanguage: string;
  maintenanceMode: boolean;
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
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Breadcrumbs />
          <Typography variant="h4" component="h1" gutterBottom>
            System Settings
          </Typography>

          <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            {settings ? (
              <Box component="form" noValidate autoComplete="off">
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Site Name"
                      value={settings.siteName}
                      onChange={(e) =>
                        setSettings({ ...settings, siteName: e.target.value })
                      }
                      disabled={isSaving}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
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
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.maintenanceMode}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              maintenanceMode: e.target.checked,
                            })
                          }
                          disabled={isSaving}
                        />
                      }
                      label="Maintenance Mode"
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sx={{ display: 'flex', justifyContent: 'flex-end' }}
                  >
                    <PermissionGuard permission={PERMISSIONS.SETTINGS_EDIT}>
                      <Button
                        variant="contained"
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <CircularProgress size={24} />
                        ) : (
                          'Save Settings'
                        )}
                      </Button>
                    </PermissionGuard>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Alert severity="error">Could not load settings.</Alert>
            )}
          </Paper>

          <Snackbar
            open={notification.open}
            autoHideDuration={6000}
            onClose={() => setNotification({ ...notification, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
// Basic Grid component to structure the form
const Grid = (props: {
  container?: boolean;
  item?: boolean;
  xs?: number;
  spacing?: number;
  children: React.ReactNode;
  sx?: object;
}) => (
  <Box
    display={props.container ? 'flex' : 'block'}
    flexWrap="wrap"
    mx={props.container ? -1.5 : 0}
    {...props}
  >
    {props.children}
  </Box>
);
