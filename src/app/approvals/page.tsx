'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ApprovalDashboard } from '@/components/approval/ApprovalDashboard';
import { Typography, Box, Paper } from '@mui/material';
import { MinimumRoleGuard } from '@/components/auth/PermissionGuard';
import { UserRole } from '@prisma/client';

export default function ApprovalsPage() {
  return (
    <DashboardLayout>
      <MinimumRoleGuard
        minimumRole={UserRole.MODERATOR}
        redirectTo="/dashboard"
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Approval Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage content approvals and review workflow
          </Typography>
        </Box>

        <Paper sx={{ p: 0, overflow: 'hidden' }}>
          <ApprovalDashboard />
        </Paper>
      </MinimumRoleGuard>
    </DashboardLayout>
  );
}
