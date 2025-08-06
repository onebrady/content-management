'use client';

import React, { useState } from 'react';
import {
  Group,
  TextInput,
  Select,
  MultiSelect,
  Button,
  ActionIcon,
  Tooltip,
  Popover,
  Stack,
  Text,
  Badge,
  Divider,
  Switch,
  NumberInput,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
  IconSearch,
  IconFilter,
  IconFilterOff,
  IconCalendar,
  IconUsers,
  IconTag,
  IconAdjustments,
} from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import type { Project, Task } from '@/types/database';

interface TaskFiltersProps {
  project: Project;
  onFiltersChange: (filters: TaskFilterState) => void;
  totalTasks: number;
  filteredTasks: number;
}

export interface TaskFilterState {
  search: string;
  columnIds: string[];
  assigneeIds: string[];
  priorities: string[];
  tags: string[];
  completed?: boolean;
  hasAttachments?: boolean;
  dueDateRange: [Date | null, Date | null];
  estimatedHoursRange: [number | null, number | null];
  actualHoursRange: [number | null, number | null];
  isOverdue?: boolean;
  isDueThisWeek?: boolean;
}

const initialFilters: TaskFilterState = {
  search: '',
  columnIds: [],
  assigneeIds: [],
  priorities: [],
  tags: [],
  completed: undefined,
  hasAttachments: undefined,
  dueDateRange: [null, null],
  estimatedHoursRange: [null, null],
  actualHoursRange: [null, null],
  isOverdue: undefined,
  isDueThisWeek: undefined,
};

export function TaskFilters({
  project,
  onFiltersChange,
  totalTasks,
  filteredTasks,
}: TaskFiltersProps) {
  const [filters, setFilters] = useState<TaskFilterState>(initialFilters);
  const [popoverOpened, setPopoverOpened] = useState(false);
  const [debouncedSearch] = useDebouncedValue(filters.search, 300);

  // Effect to handle debounced search
  React.useEffect(() => {
    const updatedFilters = { ...filters, search: debouncedSearch };
    onFiltersChange(updatedFilters);
  }, [debouncedSearch]);

  // Effect to handle other filters
  React.useEffect(() => {
    onFiltersChange(filters);
  }, [
    filters.columnIds,
    filters.assigneeIds,
    filters.priorities,
    filters.tags,
    filters.completed,
    filters.hasAttachments,
    filters.dueDateRange,
    filters.estimatedHoursRange,
    filters.actualHoursRange,
    filters.isOverdue,
    filters.isDueThisWeek,
  ]);

  const updateFilter = <K extends keyof TaskFilterState>(
    key: K,
    value: TaskFilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters(initialFilters);
    setPopoverOpened(false);
  };

  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.columnIds.length > 0 ||
      filters.assigneeIds.length > 0 ||
      filters.priorities.length > 0 ||
      filters.tags.length > 0 ||
      filters.completed !== undefined ||
      filters.hasAttachments !== undefined ||
      filters.dueDateRange[0] ||
      filters.dueDateRange[1] ||
      filters.estimatedHoursRange[0] !== null ||
      filters.estimatedHoursRange[1] !== null ||
      filters.actualHoursRange[0] !== null ||
      filters.actualHoursRange[1] !== null ||
      filters.isOverdue !== undefined ||
      filters.isDueThisWeek !== undefined
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.columnIds.length > 0) count++;
    if (filters.assigneeIds.length > 0) count++;
    if (filters.priorities.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.completed !== undefined) count++;
    if (filters.hasAttachments !== undefined) count++;
    if (filters.dueDateRange[0] || filters.dueDateRange[1]) count++;
    if (
      filters.estimatedHoursRange[0] !== null ||
      filters.estimatedHoursRange[1] !== null
    )
      count++;
    if (
      filters.actualHoursRange[0] !== null ||
      filters.actualHoursRange[1] !== null
    )
      count++;
    if (filters.isOverdue !== undefined) count++;
    if (filters.isDueThisWeek !== undefined) count++;
    return count;
  };

  // Prepare options for selects
  const columnOptions = project.columns.map((col) => ({
    value: col.id,
    label: col.title,
  }));

  const assigneeOptions = [
    ...project.members.map((member) => ({
      value: member.userId,
      label: member.user.name || member.user.email,
    })),
    { value: project.ownerId, label: 'Project Owner' },
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ];

  // Get all unique tags from project tasks
  const allTags = Array.from(
    new Set(
      project.columns
        .flatMap((col) => col.tasks)
        .flatMap((task) => task.tags || [])
    )
  );

  const tagOptions = allTags.map((tag) => ({ value: tag, label: tag }));

  return (
    <Group spacing="sm" align="flex-end">
      {/* Search Input */}
      <TextInput
        placeholder="Search tasks..."
        leftSection={<IconSearch size={16} />}
        value={filters.search}
        onChange={(event) => updateFilter('search', event.currentTarget.value)}
        style={{ minWidth: 200 }}
      />

      {/* Quick Filters */}
      <Select
        placeholder="Column"
        data={columnOptions}
        value={filters.columnIds[0] || null}
        onChange={(value) => updateFilter('columnIds', value ? [value] : [])}
        clearable
      />

      <Select
        placeholder="Assignee"
        data={assigneeOptions}
        value={filters.assigneeIds[0] || null}
        onChange={(value) => updateFilter('assigneeIds', value ? [value] : [])}
        clearable
      />

      <Select
        placeholder="Priority"
        data={priorityOptions}
        value={filters.priorities[0] || null}
        onChange={(value) => updateFilter('priorities', value ? [value] : [])}
        clearable
      />

      {/* Advanced Filters Popover */}
      <Popover
        opened={popoverOpened}
        onChange={setPopoverOpened}
        position="bottom-end"
        width={350}
        shadow="md"
      >
        <Popover.Target>
          <Tooltip label="Advanced filters">
            <ActionIcon
              variant={hasActiveFilters() ? 'filled' : 'light'}
              size="lg"
              onClick={() => setPopoverOpened(!popoverOpened)}
            >
              <IconAdjustments size={16} />
              {getActiveFilterCount() > 0 && (
                <Badge
                  size="xs"
                  variant="filled"
                  color="red"
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    minWidth: 16,
                    height: 16,
                    padding: 0,
                    fontSize: 10,
                  }}
                >
                  {getActiveFilterCount()}
                </Badge>
              )}
            </ActionIcon>
          </Tooltip>
        </Popover.Target>

        <Popover.Dropdown>
          <Stack spacing="md">
            <Group justify="space-between">
              <Text fw={600} size="sm">
                Advanced Filters
              </Text>
              {hasActiveFilters() && (
                <Button
                  size="xs"
                  variant="subtle"
                  leftSection={<IconFilterOff size={12} />}
                  onClick={clearAllFilters}
                >
                  Clear All
                </Button>
              )}
            </Group>

            <Divider />

            {/* Multi-select filters */}
            <MultiSelect
              label="Columns"
              placeholder="Select columns"
              data={columnOptions}
              value={filters.columnIds}
              onChange={(value) => updateFilter('columnIds', value)}
              clearable
              size="sm"
            />

            <MultiSelect
              label="Assignees"
              placeholder="Select assignees"
              data={assigneeOptions}
              value={filters.assigneeIds}
              onChange={(value) => updateFilter('assigneeIds', value)}
              clearable
              size="sm"
            />

            <MultiSelect
              label="Priorities"
              placeholder="Select priorities"
              data={priorityOptions}
              value={filters.priorities}
              onChange={(value) => updateFilter('priorities', value)}
              clearable
              size="sm"
            />

            {tagOptions.length > 0 && (
              <MultiSelect
                label="Tags"
                placeholder="Select tags"
                data={tagOptions}
                value={filters.tags}
                onChange={(value) => updateFilter('tags', value)}
                clearable
                size="sm"
              />
            )}

            <Divider />

            {/* Status filters */}
            <Group grow>
              <Switch
                label="Show completed only"
                checked={filters.completed === true}
                onChange={(event) =>
                  updateFilter(
                    'completed',
                    event.currentTarget.checked ? true : undefined
                  )
                }
                size="sm"
              />

              <Switch
                label="Has attachments"
                checked={filters.hasAttachments === true}
                onChange={(event) =>
                  updateFilter(
                    'hasAttachments',
                    event.currentTarget.checked ? true : undefined
                  )
                }
                size="sm"
              />
            </Group>

            <Group grow>
              <Switch
                label="Overdue tasks"
                checked={filters.isOverdue === true}
                onChange={(event) =>
                  updateFilter(
                    'isOverdue',
                    event.currentTarget.checked ? true : undefined
                  )
                }
                size="sm"
              />

              <Switch
                label="Due this week"
                checked={filters.isDueThisWeek === true}
                onChange={(event) =>
                  updateFilter(
                    'isDueThisWeek',
                    event.currentTarget.checked ? true : undefined
                  )
                }
                size="sm"
              />
            </Group>

            <Divider />

            {/* Date range filter */}
            <DatePickerInput
              type="range"
              label="Due date range"
              placeholder="Select date range"
              value={filters.dueDateRange}
              onChange={(value) =>
                updateFilter('dueDateRange', value || [null, null])
              }
              clearable
              size="sm"
            />

            {/* Time range filters */}
            <Group grow>
              <NumberInput
                label="Min estimated hours"
                placeholder="Hours"
                min={0}
                max={999}
                value={filters.estimatedHoursRange[0] || ''}
                onChange={(value) =>
                  updateFilter('estimatedHoursRange', [
                    typeof value === 'number' ? value : null,
                    filters.estimatedHoursRange[1],
                  ])
                }
                size="sm"
              />

              <NumberInput
                label="Max estimated hours"
                placeholder="Hours"
                min={0}
                max={999}
                value={filters.estimatedHoursRange[1] || ''}
                onChange={(value) =>
                  updateFilter('estimatedHoursRange', [
                    filters.estimatedHoursRange[0],
                    typeof value === 'number' ? value : null,
                  ])
                }
                size="sm"
              />
            </Group>
          </Stack>
        </Popover.Dropdown>
      </Popover>

      {/* Results summary */}
      {hasActiveFilters() && (
        <Badge variant="light" size="lg">
          {filteredTasks} of {totalTasks} tasks
        </Badge>
      )}
    </Group>
  );
}

export default TaskFilters;
