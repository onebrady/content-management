'use client';

import { useState } from 'react';
import {
  Box,
  Group,
  Button,
  Text,
  Paper,
  useMantineColorScheme,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';

interface TimeRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface TimeRangeSelectorProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

export function TimeRangeSelector({
  timeRange,
  onTimeRangeChange,
}: TimeRangeSelectorProps) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const handleQuickSelect = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    onTimeRangeChange({ startDate, endDate });
  };

  const presets = [
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 30 days', value: 30 },
    { label: 'Last 90 days', value: 90 },
  ];

  return (
    <Paper
      p="md"
      mb="lg"
      style={{
        backgroundColor: isDark
          ? 'var(--mantine-color-dark-7)'
          : 'var(--mantine-color-white)',
        borderColor: isDark
          ? 'var(--mantine-color-dark-4)'
          : 'var(--mantine-color-gray-3)',
      }}
    >
      <Group justify="space-between" align="flex-end">
        <Box>
          <Text size="sm" fw={500} mb="xs">
            Date Range
          </Text>
          <Group gap="md">
            <DatePickerInput
              placeholder="Start date"
              value={timeRange.startDate}
              onChange={(date) =>
                onTimeRangeChange({ ...timeRange, startDate: date })
              }
              leftSection={<IconCalendar size={16} />}
              clearable
              style={{ minWidth: 150 }}
            />
            <Text size="sm" c="dimmed">
              to
            </Text>
            <DatePickerInput
              placeholder="End date"
              value={timeRange.endDate}
              onChange={(date) =>
                onTimeRangeChange({ ...timeRange, endDate: date })
              }
              leftSection={<IconCalendar size={16} />}
              clearable
              style={{ minWidth: 150 }}
            />
          </Group>
        </Box>

        <Group gap="xs">
          {presets.map((preset) => (
            <Button
              key={preset.value}
              variant="light"
              size="sm"
              onClick={() => handleQuickSelect(preset.value)}
              style={{
                backgroundColor: isDark
                  ? 'var(--mantine-color-dark-5)'
                  : 'var(--mantine-color-gray-0)',
                borderColor: isDark
                  ? 'var(--mantine-color-dark-4)'
                  : 'var(--mantine-color-gray-2)',
              }}
            >
              {preset.label}
            </Button>
          ))}
        </Group>
      </Group>
    </Paper>
  );
}
