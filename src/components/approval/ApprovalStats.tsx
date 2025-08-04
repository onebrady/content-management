'use client';

import {
  Box,
  Grid,
  Card,
  Text,
  Skeleton,
  Badge,
  Group,
  useMantineColorScheme,
} from '@mantine/core';
import { IconClock, IconCheck, IconX, IconChartBar } from '@tabler/icons-react';

interface ApprovalStatsProps {
  stats: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
    averageApprovalTime?: string;
    approvalRate?: number;
  };
  loading: boolean;
}

export function ApprovalStats({ stats, loading }: ApprovalStatsProps) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const statItems = [
    {
      label: 'Pending Review',
      value: stats.pending,
      icon: <IconClock size={24} color="var(--mantine-color-orange-6)" />,
      color: 'orange',
    },
    {
      label: 'Approved',
      value: stats.approved,
      icon: <IconCheck size={24} color="var(--mantine-color-green-6)" />,
      color: 'green',
    },
    {
      label: 'Rejected',
      value: stats.rejected,
      icon: <IconX size={24} color="var(--mantine-color-red-6)" />,
      color: 'red',
    },
    {
      label: 'Total',
      value: stats.total,
      icon: <IconChartBar size={24} color="var(--mantine-color-blue-6)" />,
      color: 'blue',
    },
  ];

  return (
    <Box w="100%" mb="lg">
      <Grid gutter="md">
        {statItems.map((item) => (
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }} key={item.label}>
            <Card
              p="lg"
              withBorder
              shadow="sm"
              style={{
                backgroundColor: isDark
                  ? 'var(--mantine-color-dark-6)'
                  : 'var(--mantine-color-white)',
                borderColor: isDark
                  ? 'var(--mantine-color-dark-4)'
                  : 'var(--mantine-color-gray-3)',
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  {item.icon}
                </Box>
                {loading ? (
                  <Skeleton height={32} width={60} />
                ) : (
                  <Text size="xl" fw={700} lh={1}>
                    {item.value.toLocaleString()}
                  </Text>
                )}
                <Text size="sm" c="dimmed" ta="center" mt={4}>
                  {item.label}
                </Text>
              </Box>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {/* Additional Stats */}
      {(stats.averageApprovalTime || stats.approvalRate !== undefined) && (
        <Group gap="md" mt="md" wrap="wrap">
          {stats.averageApprovalTime && (
            <Badge variant="light" color="blue" size="lg">
              Avg. Approval Time: {stats.averageApprovalTime}
            </Badge>
          )}
          {stats.approvalRate !== undefined && (
            <Badge
              variant="light"
              color={
                stats.approvalRate > 70
                  ? 'green'
                  : stats.approvalRate > 50
                    ? 'orange'
                    : 'red'
              }
              size="lg"
            >
              Approval Rate: {stats.approvalRate}%
            </Badge>
          )}
        </Group>
      )}

      {/* Empty State */}
      {!loading && stats.total === 0 && (
        <Box ta="center" mt="lg">
          <Text c="dimmed" size="sm">
            No approval data available
          </Text>
        </Box>
      )}
    </Box>
  );
}
