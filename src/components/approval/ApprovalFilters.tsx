'use client';

import { useState } from 'react';
import {
  Box,
  Grid,
  TextInput,
  Select,
  Badge,
  Text,
  Group,
  Button,
  Collapse,
  ActionIcon,
  Tooltip,
  useMantineColorScheme,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconSearch, IconFilter, IconX } from '@tabler/icons-react';
import { ApprovalStatus, ContentType } from '@prisma/client';
import { ApprovalFilters as FiltersType } from './ApprovalDashboard';

interface ApprovalFiltersProps {
  filters: FiltersType;
  onFilterChange: (filters: Partial<FiltersType>) => void;
}

export function ApprovalFilters({
  filters,
  onFilterChange,
}: ApprovalFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery);
  const { colorScheme } = useMantineColorScheme();

  const isDark = colorScheme === 'dark';

  // Handle status filter change
  const handleStatusChange = (value: string | null) => {
    onFilterChange({
      status: value ? [value] : [],
    });
  };

  // Handle content type filter change
  const handleContentTypeChange = (value: string | null) => {
    onFilterChange({
      contentType: value ? [value] : [],
    });
  };

  // Handle date range change
  const handleDateRangeChange = (index: number, date: Date | null) => {
    const newDateRange = [...filters.dateRange];
    newDateRange[index] = date;
    onFilterChange({ dateRange: newDateRange as [Date | null, Date | null] });
  };

  // Handle search query change
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ searchQuery });
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    onFilterChange({
      status: [],
      contentType: [],
      dateRange: [null, null],
      searchQuery: '',
    });
  };

  return (
    <Box w="100%">
      {/* Search Bar */}
      <Box
        component="form"
        onSubmit={handleSearchSubmit}
        mb="lg"
        style={{ display: 'flex', gap: 16 }}
      >
        <TextInput
          placeholder="Search by title, author, or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          rightSection={
            searchQuery ? (
              <ActionIcon
                size="sm"
                variant="subtle"
                onClick={() => {
                  setSearchQuery('');
                  onFilterChange({ searchQuery: '' });
                }}
              >
                <IconX size={14} />
              </ActionIcon>
            ) : null
          }
          style={{ flex: 1 }}
          size="md"
        />
        <Button type="submit" size="md" style={{ minWidth: 100 }}>
          Search
        </Button>
        <Button
          variant="light"
          leftSection={<IconFilter size={16} />}
          onClick={() => setShowAdvanced(!showAdvanced)}
          size="md"
        >
          {showAdvanced ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </Box>

      {/* Advanced Filters */}
      <Collapse in={showAdvanced}>
        <Grid gutter="md" mb="lg">
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Select
              label="Status"
              placeholder="Select status"
              data={Object.values(ApprovalStatus).map((status) => ({
                value: status,
                label: status,
              }))}
              value={filters.status[0] || null}
              onChange={handleStatusChange}
              clearable
              size="md"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Select
              label="Content Type"
              placeholder="Select content type"
              data={Object.values(ContentType).map((type) => ({
                value: type,
                label: type,
              }))}
              value={filters.contentType[0] || null}
              onChange={handleContentTypeChange}
              clearable
              size="md"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Group gap="sm">
              <DatePickerInput
                label="From Date"
                placeholder="Select date"
                value={filters.dateRange[0]}
                onChange={(date) => handleDateRangeChange(0, date)}
                clearable
                size="md"
                style={{ flex: 1 }}
              />
              <DatePickerInput
                label="To Date"
                placeholder="Select date"
                value={filters.dateRange[1]}
                onChange={(date) => handleDateRangeChange(1, date)}
                clearable
                size="md"
                style={{ flex: 1 }}
              />
            </Group>
          </Grid.Col>
        </Grid>

        {/* Filter Summary and Clear Button */}
        <Group justify="space-between" align="center" mb="md">
          <Text size="sm" c="dimmed">
            {getFilterSummary(filters)}
          </Text>
          <Button
            variant="subtle"
            color="red"
            onClick={handleClearFilters}
            leftSection={<IconX size={16} />}
            size="sm"
          >
            Clear All Filters
          </Button>
        </Group>
      </Collapse>
    </Box>
  );
}

// Helper function to generate filter summary text
function getFilterSummary(filters: FiltersType): string {
  const parts = [];

  if (filters.status.length > 0) {
    parts.push(`${filters.status.length} status(es)`);
  }

  if (filters.contentType.length > 0) {
    parts.push(`${filters.contentType.length} content type(s)`);
  }

  if (filters.dateRange[0] || filters.dateRange[1]) {
    parts.push('date range');
  }

  if (filters.searchQuery) {
    parts.push(`search: "${filters.searchQuery}"`);
  }

  return parts.length > 0
    ? `Filtering by: ${parts.join(', ')}`
    : 'No filters applied';
}
