'use client';

import {
  Box,
  Avatar,
  Typography,
  Chip,
  Card,
  CardContent,
  Grid,
  Divider,
} from '@mui/material';
import { Person, Email, Business, Security } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';

export function UserProfile() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

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

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Full system access and user management';
      case 'MODERATOR':
        return 'Content review and approval capabilities';
      case 'CONTRIBUTOR':
        return 'Create and edit content';
      case 'VIEWER':
        return 'Read-only access to published content';
      default:
        return 'Unknown role';
    }
  };

  return (
    <Card>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mb: 2,
                  bgcolor: 'primary.main',
                }}
              >
                <Person sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h5" component="h2" gutterBottom>
                {user.name}
              </Typography>
              <Chip
                label={user.role}
                color={getRoleColor(user.role)}
                size="small"
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {getRoleDescription(user.role)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box>
              <Typography variant="h6" gutterBottom>
                User Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Email fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Email:
                    </Typography>
                    <Typography variant="body2">{user.email}</Typography>
                  </Box>
                </Grid>

                {user.department && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Business fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Department:
                      </Typography>
                      <Typography variant="body2">{user.department}</Typography>
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Security fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Role:
                    </Typography>
                    <Chip
                      label={user.role}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
} 