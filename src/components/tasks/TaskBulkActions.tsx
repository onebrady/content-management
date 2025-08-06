'use client';

import React, { useState } from 'react';
import {
  Group,
  Button,
  Select,
  ActionIcon,
  Tooltip,
  Menu,
  Text,
  Badge,
  Alert,
  Loader,
  Modal,
  Stack,
  Checkbox,
} from '@mantine/core';
import {
  IconCheck,
  IconTrash,
  IconEdit,
  IconArrowRight,
  IconDots,
  IconAlertCircle,
  IconBulk,
} from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectKeys } from '@/features/projects/hooks/queryKeys';
import type { Task, Project } from '@/types/database';

interface TaskBulkActionsProps {
  selectedTasks: string[];
  tasks: Task[];
  project: Project;
  onSelectionChange: (taskIds: string[]) => void;
  onActionComplete?: () => void;
}

interface BulkUpdateData {
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  columnId?: string;
  assigneeId?: string;
  completed?: boolean;
}

export function TaskBulkActions({
  selectedTasks,
  tasks,
  project,
  onSelectionChange,
  onActionComplete,
}: TaskBulkActionsProps) {
  const [bulkModalOpened, setBulkModalOpened] = useState(false);
  const [bulkAction, setBulkAction] = useState<'update' | 'delete' | null>(
    null
  );
  const [bulkUpdateData, setBulkUpdateData] = useState<BulkUpdateData>({});

  const queryClient = useQueryClient();

  const bulkUpdateMutation = useMutation({
    mutationFn: async (data: {
      taskIds: string[];
      updates: BulkUpdateData;
    }) => {
      const response = await fetch('/api/tasks/bulk-update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskIds: data.taskIds,
          updates: data.updates,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update tasks');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(project.id),
      });
      onSelectionChange([]);
      setBulkModalOpened(false);
      if (onActionComplete) onActionComplete();
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (taskIds: string[]) => {
      const deletePromises = taskIds.map((taskId) =>
        fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      );

      const responses = await Promise.all(deletePromises);
      const failedDeletes = responses.filter((res) => !res.ok);

      if (failedDeletes.length > 0) {
        throw new Error(`Failed to delete ${failedDeletes.length} tasks`);
      }

      return responses;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(project.id),
      });
      onSelectionChange([]);
      setBulkModalOpened(false);
      if (onActionComplete) onActionComplete();
    },
  });

  const handleSelectAll = () => {
    if (selectedTasks.length === tasks.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(tasks.map((task) => task.id));
    }
  };

  const handleBulkUpdate = () => {
    if (Object.keys(bulkUpdateData).length === 0) {
      return;
    }

    bulkUpdateMutation.mutate({
      taskIds: selectedTasks,
      updates: bulkUpdateData,
    });
  };

  const handleBulkDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedTasks.length} selected tasks?`
      )
    ) {
      bulkDeleteMutation.mutate(selectedTasks);
    }
  };

  const openBulkModal = (action: 'update' | 'delete') => {
    setBulkAction(action);
    setBulkModalOpened(true);
    setBulkUpdateData({});
  };

  const selectedTasksData = tasks.filter((task) =>
    selectedTasks.includes(task.id)
  );

  const isLoading =
    bulkUpdateMutation.isPending || bulkDeleteMutation.isPending;

  if (selectedTasks.length === 0) {
    return (
      <Group spacing="sm">
        <Checkbox
          checked={false}
          indeterminate={false}
          onChange={handleSelectAll}
          label="Select all tasks"
        />
      </Group>
    );
  }

  return (
    <>
      <Group spacing="sm" p="sm" bg="blue.0" style={{ borderRadius: '8px' }}>
        <Checkbox
          checked={selectedTasks.length === tasks.length}
          indeterminate={
            selectedTasks.length > 0 && selectedTasks.length < tasks.length
          }
          onChange={handleSelectAll}
        />

        <Badge leftSection={<IconBulk size={12} />} variant="filled">
          {selectedTasks.length} selected
        </Badge>

        <Group spacing="xs">
          <Tooltip label="Mark as completed">
            <Button
              size="xs"
              variant="light"
              leftSection={<IconCheck size={14} />}
              onClick={() => {
                bulkUpdateMutation.mutate({
                  taskIds: selectedTasks,
                  updates: { completed: true },
                });
              }}
              loading={isLoading}
            >
              Complete
            </Button>
          </Tooltip>

          <Tooltip label="Bulk edit">
            <Button
              size="xs"
              variant="light"
              leftSection={<IconEdit size={14} />}
              onClick={() => openBulkModal('update')}
              disabled={isLoading}
            >
              Edit
            </Button>
          </Tooltip>

          <Menu shadow="md">
            <Menu.Target>
              <ActionIcon variant="light" size="sm" disabled={isLoading}>
                <IconDots size={14} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconArrowRight size={14} />}
                onClick={() => openBulkModal('update')}
              >
                Move to column
              </Menu.Item>
              <Menu.Item
                leftSection={<IconEdit size={14} />}
                onClick={() => openBulkModal('update')}
              >
                Change priority
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={() => openBulkModal('delete')}
              >
                Delete selected
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Button
          size="xs"
          variant="subtle"
          onClick={() => onSelectionChange([])}
        >
          Clear selection
        </Button>
      </Group>

      {/* Bulk Action Modal */}
      <Modal
        opened={bulkModalOpened}
        onClose={() => setBulkModalOpened(false)}
        title={
          <Group spacing="sm">
            {bulkAction === 'update' ? (
              <IconEdit size={20} />
            ) : (
              <IconTrash size={20} />
            )}
            <Text fw={600}>
              {bulkAction === 'update' ? 'Bulk Update' : 'Bulk Delete'} (
              {selectedTasks.length} tasks)
            </Text>
          </Group>
        }
        centered
      >
        <Stack spacing="md">
          {bulkAction === 'update' ? (
            <>
              <Select
                label="Move to Column"
                placeholder="Select column"
                data={project.columns.map((col) => ({
                  value: col.id,
                  label: col.title,
                }))}
                value={bulkUpdateData.columnId || ''}
                onChange={(value) =>
                  setBulkUpdateData((prev) => ({ ...prev, columnId: value! }))
                }
                clearable
              />

              <Select
                label="Change Priority"
                placeholder="Select priority"
                data={[
                  { value: 'LOW', label: 'Low' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HIGH', label: 'High' },
                  { value: 'URGENT', label: 'Urgent' },
                ]}
                value={bulkUpdateData.priority || ''}
                onChange={(value) =>
                  setBulkUpdateData((prev) => ({
                    ...prev,
                    priority: value as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
                  }))
                }
                clearable
              />

              <Checkbox
                label="Mark as completed"
                checked={bulkUpdateData.completed || false}
                onChange={(event) =>
                  setBulkUpdateData((prev) => ({
                    ...prev,
                    completed: event.currentTarget.checked,
                  }))
                }
              />

              {Object.keys(bulkUpdateData).length === 0 && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  color="yellow"
                  variant="light"
                >
                  Please select at least one field to update.
                </Alert>
              )}
            </>
          ) : (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
            >
              <Text fw={500} mb="xs">
                This action cannot be undone!
              </Text>
              <Text size="sm">
                You are about to delete {selectedTasks.length} tasks. This will
                permanently remove all task data including attachments and
                comments.
              </Text>
            </Alert>
          )}

          {/* Error Display */}
          {(bulkUpdateMutation.isError || bulkDeleteMutation.isError) && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
            >
              {bulkUpdateMutation.error?.message ||
                bulkDeleteMutation.error?.message ||
                'An error occurred'}
            </Alert>
          )}

          <Group justify="flex-end">
            <Button
              variant="subtle"
              onClick={() => setBulkModalOpened(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              color={bulkAction === 'delete' ? 'red' : 'blue'}
              loading={isLoading}
              onClick={
                bulkAction === 'update' ? handleBulkUpdate : handleBulkDelete
              }
              disabled={
                bulkAction === 'update' &&
                Object.keys(bulkUpdateData).length === 0
              }
            >
              {bulkAction === 'update' ? 'Update Tasks' : 'Delete Tasks'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

export default TaskBulkActions;
