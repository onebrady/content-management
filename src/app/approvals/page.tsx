'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Text,
  Paper,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { ApprovalDashboard } from '@/components/approval/ApprovalDashboard';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { MinimumRoleGuard } from '@/components/auth/PermissionGuard';
import { AppLayout } from '@/components/layout/AppLayout';
import { UserRole } from '@prisma/client';

export default function ApprovalsPage() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <MinimumRoleGuard minimumRole={UserRole.MODERATOR} redirectTo="/dashboard">
      <AppLayout>
        <Container size="xl" py="xl">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: '', href: '/dashboard' },
              { label: 'Approvals', href: '/approvals' },
            ]}
            showHomeIcon={true}
            homeLabel=""
          />

          {/* Header */}
          <Box mb="xl">
            <Title order={1} mb="xs">
              Approval Dashboard
            </Title>
            <Text size="lg" c="dimmed">
              Manage content approvals and review workflow
            </Text>
          </Box>

          {/* Main Content */}
          <Paper
            p={0}
            withBorder
            style={{
              backgroundColor: isDark
                ? 'var(--mantine-color-dark-6)'
                : 'var(--mantine-color-white)',
              borderColor: isDark
                ? 'var(--mantine-color-dark-4)'
                : 'var(--mantine-color-gray-3)',
              overflow: 'hidden',
            }}
          >
            <ApprovalDashboard />
          </Paper>
        </Container>
      </AppLayout>
    </MinimumRoleGuard>
  );
}
