'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  TextInput,
  Button,
  Collapse,
  Grid,
  Select,
  Badge,
  Text,
  Group,
  Stack,
  useMantineColorScheme,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconSearch,
  IconX,
  IconFilter,
  IconCalendar,
} from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { ContentStatus, ContentType, Priority } from '@prisma/client';
import { SearchFilters as SearchFiltersType } from '@/lib/search';
import { getAllTags, getAllUsers } from '@/lib/search';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFilterChange: (filters: Partial<SearchFiltersType>) => void;
  onResetFilters: () => void;
}

export function SearchFilters({
  filters,
  onFilterChange,
  onResetFilters,
}: SearchFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.query || '');
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const { colorScheme } = useMantineColorScheme();

  const isDark = colorScheme === 'dark';

  // Fetch tags and users for filters
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [tagsData, usersData] = await Promise.all([
          getAllTags(),
          getAllUsers(),
        ]);
        setTags(tagsData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };

    fetchFilterData();
  }, []);

  // Handle search query submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ query: searchQuery });
  };

  // Handle status filter change
  const handleStatusChange = (value: string | null) => {
    onFilterChange({
      status: value ? [value] : [],
    });
  };

  // Handle content type filter change
  const handleTypeChange = (value: string | null) => {
    onFilterChange({
      types: value ? [value] : [],
    });
  };

  // Handle priority filter change
  const handlePriorityChange = (value: string | null) => {
    onFilterChange({
      priorities: value ? [value] : [],
    });
  };

  // Handle tags filter change
  const handleTagsChange = (value: string | null) => {
    onFilterChange({
      tags: value ? [value] : [],
    });
  };

  // Handle author filter change
  const handleAuthorChange = (value: string | null) => {
    onFilterChange({ author: value || undefined });
  };

  // Handle assignee filter change
  const handleAssigneeChange = (value: string | null) => {
    onFilterChange({ assignee: value || undefined });
  };

  // Handle date range change
  const handleStartDateChange = (date: Date | null) => {
    onFilterChange({ startDate: date });
  };

  const handleEndDateChange = (date: Date | null) => {
    onFilterChange({ endDate: date });
  };

  // Handle sort change
  const handleSortByChange = (value: string | null) => {
    onFilterChange({ sortBy: value || 'updatedAt' });
  };

  const handleSortOrderChange = (value: string | null) => {
    onFilterChange({ sortOrder: value || 'desc' });
  };

  // Clear search query
  const handleClearSearch = () => {
    setSearchQuery('');
    onFilterChange({ query: '' });
  };

  // Generate filter summary text
  const getFilterSummary = () => {
    const parts = [];

    if (filters.status && filters.status.length > 0) {
      parts.push(`${filters.status.length} status(es)`);
    }

    if (filters.types && filters.types.length > 0) {
      parts.push(`${filters.types.length} type(s)`);
    }

    if (filters.priorities && filters.priorities.length > 0) {
      parts.push(`${filters.priorities.length} priority(ies)`);
    }

    if (filters.tags && filters.tags.length > 0) {
      parts.push(`${filters.tags.length} tag(s)`);
    }

    if (filters.author) {
      parts.push('author');
    }

    if (filters.assignee) {
      parts.push('assignee');
    }

    if (filters.startDate || filters.endDate) {
      parts.push('date range');
    }

    if (filters.sortBy && filters.sortBy !== 'updatedAt') {
      parts.push(`sorted by ${filters.sortBy}`);
    }

    return parts.length > 0
      ? `Filtering by: ${parts.join(', ')}`
      : 'No filters applied';
  };

  return (
    <Box w="100%" mb="xl">
      {/* Search Bar */}
      <Box
        component="form"
        onSubmit={handleSearchSubmit}
        mb="lg"
        style={{ display: 'flex', gap: 16 }}
      >
        <TextInput
          placeholder="Search by title or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          rightSection={
            searchQuery ? (
              <ActionIcon
                size="sm"
                variant="subtle"
                onClick={handleClearSearch}
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
          {/* Status Filter */}
          <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <Select
              label="Status"
              placeholder="Select status"
              data={Object.values(ContentStatus).map((status) => ({
                value: status,
                label: status,
              }))}
              value={filters.status?.[0] || null}
              onChange={handleStatusChange}
              clearable
              size="md"
            />
          </Grid.Col>

          {/* Content Type Filter */}
          <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <Select
              label="Content Type"
              placeholder="Select type"
              data={Object.values(ContentType).map((type) => ({
                value: type,
                label: type,
              }))}
              value={filters.types?.[0] || null}
              onChange={handleTypeChange}
              clearable
              size="md"
            />
          </Grid.Col>

          {/* Priority Filter */}
          <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <Select
              label="Priority"
              placeholder="Select priority"
              data={Object.values(Priority).map((priority) => ({
                value: priority,
                label: priority,
              }))}
              value={filters.priorities?.[0] || null}
              onChange={handlePriorityChange}
              clearable
              size="md"
            />
          </Grid.Col>

          {/* Tags Filter */}
          <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <Select
              label="Tags"
              placeholder="Select tags"
              data={tags.map((tag) => ({
                value: tag.name,
                label: tag.name,
              }))}
              value={filters.tags?.[0] || null}
              onChange={handleTagsChange}
              clearable
              size="md"
            />
          </Grid.Col>

          {/* Author Filter */}
          <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <Select
              label="Author"
              placeholder="Any Author"
              data={[
                { value: '', label: 'Any Author' },
                ...users.map((user) => ({
                  value: user.id,
                  label: user.name,
                })),
              ]}
              value={filters.author || ''}
              onChange={handleAuthorChange}
              clearable
              size="md"
            />
          </Grid.Col>

          {/* Assignee Filter */}
          <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <Select
              label="Assignee"
              placeholder="Any Assignee"
              data={[
                { value: '', label: 'Any Assignee' },
                ...users.map((user) => ({
                  value: user.id,
                  label: user.name,
                })),
              ]}
              value={filters.assignee || ''}
              onChange={handleAssigneeChange}
              clearable
              size="md"
            />
          </Grid.Col>

          {/* Date Range Filter */}
          <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <Group gap="sm">
              <DatePickerInput
                label="From Date"
                placeholder="Select date"
                value={filters.startDate}
                onChange={handleStartDateChange}
                clearable
                size="md"
                style={{ flex: 1 }}
                leftSection={<IconCalendar size={16} />}
              />
              <DatePickerInput
                label="To Date"
                placeholder="Select date"
                value={filters.endDate}
                onChange={handleEndDateChange}
                clearable
                size="md"
                style={{ flex: 1 }}
                leftSection={<IconCalendar size={16} />}
              />
            </Group>
          </Grid.Col>

          {/* Sort Options */}
          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Group gap="sm">
              <Select
                label="Sort By"
                placeholder="Sort by"
                data={[
                  { value: 'updatedAt', label: 'Last Updated' },
                  { value: 'createdAt', label: 'Created Date' },
                  { value: 'title', label: 'Title' },
                  { value: 'status', label: 'Status' },
                  { value: 'priority', label: 'Priority' },
                ]}
                value={filters.sortBy || 'updatedAt'}
                onChange={handleSortByChange}
                size="md"
                style={{ flex: 2 }}
              />
              <Select
                label="Order"
                placeholder="Order"
                data={[
                  { value: 'desc', label: 'Desc' },
                  { value: 'asc', label: 'Asc' },
                ]}
                value={filters.sortOrder || 'desc'}
                onChange={handleSortOrderChange}
                size="md"
                style={{ flex: 1 }}
              />
            </Group>
          </Grid.Col>
        </Grid>

        {/* Filter Summary and Reset Button */}
        <Group justify="space-between" align="center" mb="md">
          <Text size="sm" c="dimmed">
            {getFilterSummary()}
          </Text>
          <Button
            variant="subtle"
            color="red"
            onClick={onResetFilters}
            leftSection={<IconX size={16} />}
            size="sm"
          >
            Reset All Filters
          </Button>
        </Group>
      </Collapse>
    </Box>
  );
}
