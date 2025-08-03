'use client';

import {
  Box,
  Card,
  Text,
  Title,
  Group,
  Badge,
  useMantineColorScheme,
} from '@mantine/core';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
}

export function StatCard({
  title,
  value,
  icon,
  color = 'blue',
  trend,
}: StatCardProps) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Card
      withBorder
      shadow="sm"
      style={{
        backgroundColor: isDark
          ? 'var(--mantine-color-dark-7)'
          : 'var(--mantine-color-white)',
        borderColor: isDark
          ? 'var(--mantine-color-dark-4)'
          : 'var(--mantine-color-gray-3)',
        transition: 'all 0.2s ease',
        height: '100%',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 8px 25px rgba(0,0,0,0.3)'
          : '0 8px 25px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--mantine-shadow-sm)';
      }}
    >
      <Card.Section p="md">
        <Group justify="space-between" align="flex-start" mb="md">
          <Text size="sm" c="dimmed" fw={500}>
            {title}
          </Text>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: `var(--mantine-color-${color}-1)`,
              color: `var(--mantine-color-${color}-6)`,
            }}
          >
            {icon}
          </Box>
        </Group>

        <Title order={2} mb="xs">
          {value}
        </Title>

        {trend && (
          <Group gap="xs" align="center">
            <Badge
              variant="light"
              color={trend.positive ? 'green' : 'red'}
              size="sm"
              leftSection={
                trend.positive ? (
                  <IconTrendingUp size={12} />
                ) : (
                  <IconTrendingDown size={12} />
                )
              }
            >
              {trend.positive ? '+' : '-'}
              {Math.abs(trend.value)}%
            </Badge>
            <Text size="xs" c="dimmed">
              {trend.label}
            </Text>
          </Group>
        )}
      </Card.Section>
    </Card>
  );
}
