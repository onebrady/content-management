'use client';

import React, { useEffect } from 'react';
import {
  Modal,
  Button,
  Stack,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Group,
  TagsInput,
  Text,
  Alert,
  Loader,
  Divider,
  Switch,
  Badge,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm, zodResolver } from '@mantine/form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  IconAlertCircle,
  IconDeviceFloppy,
  IconTrash,
  IconPaperclip,
  IconClock,
} from '@tabler/icons-react';
import {
  updateTaskSchema,
  type UpdateTaskInput,
} from '@/lib/validation/project-schemas';
import { projectKeys } from '@/features/projects/hooks/queryKeys';
import type { Project, Task } from '@/types/database';

interface TaskEditModalProps {
  opened: boolean;
  onClose: () => void;
  task: Task;
  project: Project;
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (taskId: string) => void;
}

interface UpdateTaskFormData {
  title: string;
  description?: string;
  columnId: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: Date | null;
  completed: boolean;
  assigneeId?: string | null;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
}

export function TaskEditModal({
  opened,
  onClose,
  task,
  project,
  onTaskUpdated,
  onTaskDeleted,
}: TaskEditModalProps) {
  const queryClient = useQueryClient();

  // Get project members for assignee selection
  const { data: projectMembers } = useQuery({
    queryKey: ['project-members', project.id],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${project.id}/members`);
      if (!response.ok) throw new Error('Failed to fetch project members');
      return response.json();
    },
    enabled: opened,
  });

  const form = useForm<UpdateTaskFormData>({
    validate: zodResolver(updateTaskSchema),
    initialValues: {
      title: task.title,
      description: task.description || '',
      columnId: task.columnId,
      priority: task.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      completed: task.completed,
      assigneeId: task.assigneeId,
      estimatedHours: task.estimatedHours || undefined,
      actualHours: task.actualHours || undefined,
      tags: task.tags || [],
    },
  });

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      form.setValues({
        title: task.title,
        description: task.description || '',
        columnId: task.columnId,
        priority: task.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        completed: task.completed,
        assigneeId: task.assigneeId,
        estimatedHours: task.estimatedHours || undefined,
        actualHours: task.actualHours || undefined,
        tags: task.tags || [],
      });
    }
  }, [task]);

  const updateTaskMutation = useMutation({
    mutationFn: async (data: UpdateTaskFormData) => {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update task');
      }

      return response.json();
    },
    onSuccess: (updatedTask) => {
      // Invalidate project data to refresh the board
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(project.id),
      });

      if (onTaskUpdated) {
        onTaskUpdated(updatedTask.data);
      }

      onClose();
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete task');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate project data to refresh the board
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(project.id),
      });

      if (onTaskDeleted) {
        onTaskDeleted(task.id);
      }

      onClose();
    },
  });

  const handleSubmit = (values: UpdateTaskFormData) => {
    updateTaskMutation.mutate(values);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate();
    }
  };

  const handleClose = () => {
    if (!updateTaskMutation.isPending && !deleteTaskMutation.isPending) {
      onClose();
    }
  };

  // Prepare data for select components
  const columnOptions = project.columns.map((column) => ({
    value: column.id,
    label: column.title,
  }));

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ];

  const assigneeOptions =
    projectMembers?.data?.map((member: any) => ({
      value: member.userId,
      label: member.user.name || member.user.email,
    })) || [];

  const isLoading =
    updateTaskMutation.isPending || deleteTaskMutation.isPending;

  // Calculate time tracking info
  const timeTracking = {
    estimated: task.estimatedHours || 0,
    actual: task.actualHours || 0,
    get remaining() {
      return Math.max(0, this.estimated - this.actual);
    },
    get isOvertime() {
      return this.actual > this.estimated && this.estimated > 0;
    },
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group justify="space-between" style={{ width: '100%' }}>
          <Group spacing="sm">
            <IconDeviceFloppy size={20} />
            <Text fw={600}>Edit Task</Text>
          </Group>
          <Tooltip label="Delete task">
            <ActionIcon
              color="red"
              variant="subtle"
              onClick={handleDelete}
              disabled={isLoading}
              loading={deleteTaskMutation.isPending}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      }
      size="lg"
      centered
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          {/* Task Status */}
          <Group justify="space-between">
            <Switch
              label="Mark as completed"
              {...form.getInputProps('completed', { type: 'checkbox' })}
              disabled={isLoading}
            />

            {task.attachments && task.attachments.length > 0 && (
              <Badge
                leftSection={<IconPaperclip size={12} />}
                variant="light"
                color="gray"
              >
                {task.attachments.length} attachment
                {task.attachments.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </Group>

          {/* Task Title */}
          <TextInput
            label="Task Title"
            placeholder="Enter task title..."
            required
            {...form.getInputProps('title')}
            disabled={isLoading}
          />

          {/* Task Description */}
          <Textarea
            label="Description"
            placeholder="Describe the task..."
            minRows={3}
            maxRows={6}
            autosize
            {...form.getInputProps('description')}
            disabled={isLoading}
          />

          <Divider />

          {/* Column and Priority */}
          <Group grow>
            <Select
              label="Column"
              placeholder="Select column"
              data={columnOptions}
              required
              {...form.getInputProps('columnId')}
              disabled={isLoading}
            />

            <Select
              label="Priority"
              placeholder="Select priority"
              data={priorityOptions}
              {...form.getInputProps('priority')}
              disabled={isLoading}
            />
          </Group>

          {/* Due Date and Assignee */}
          <Group grow>
            <DateTimePicker
              label="Due Date"
              placeholder="Select due date"
              clearable
              {...form.getInputProps('dueDate')}
              disabled={isLoading}
            />

            <Select
              label="Assignee"
              placeholder="Select assignee"
              data={assigneeOptions}
              clearable
              searchable
              {...form.getInputProps('assigneeId')}
              disabled={isLoading}
            />
          </Group>

          {/* Time Tracking */}
          <Group grow>
            <NumberInput
              label="Estimated Hours"
              placeholder="Hours"
              min={0}
              max={999}
              step={0.5}
              precision={1}
              {...form.getInputProps('estimatedHours')}
              disabled={isLoading}
            />

            <NumberInput
              label="Actual Hours"
              placeholder="Hours worked"
              min={0}
              max={999}
              step={0.5}
              precision={1}
              {...form.getInputProps('actualHours')}
              disabled={isLoading}
            />
          </Group>

          {/* Time Tracking Summary */}
          {(timeTracking.estimated > 0 || timeTracking.actual > 0) && (
            <Alert
              icon={<IconClock size={16} />}
              color={timeTracking.isOvertime ? 'orange' : 'blue'}
              variant="light"
            >
              <Group spacing="md">
                <Text size="sm">
                  <Text component="span" fw={500}>
                    Estimated:
                  </Text>{' '}
                  {timeTracking.estimated}h
                </Text>
                <Text size="sm">
                  <Text component="span" fw={500}>
                    Actual:
                  </Text>{' '}
                  {timeTracking.actual}h
                </Text>
                {timeTracking.estimated > 0 && (
                  <Text size="sm">
                    <Text component="span" fw={500}>
                      Remaining:
                    </Text>{' '}
                    {timeTracking.remaining}h
                  </Text>
                )}
                {timeTracking.isOvertime && (
                  <Text size="sm" c="orange" fw={500}>
                    Over budget by{' '}
                    {(timeTracking.actual - timeTracking.estimated).toFixed(1)}h
                  </Text>
                )}
              </Group>
            </Alert>
          )}

          {/* Tags */}
          <TagsInput
            label="Tags"
            placeholder="Add tags..."
            {...form.getInputProps('tags')}
            disabled={isLoading}
          />

          {/* Error Display */}
          {(updateTaskMutation.isError || deleteTaskMutation.isError) && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
            >
              {updateTaskMutation.error?.message ||
                deleteTaskMutation.error?.message ||
                'An error occurred'}
            </Alert>
          )}

          <Divider />

          {/* Actions */}
          <Group justify="flex-end">
            <Button variant="subtle" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={updateTaskMutation.isPending}
              leftSection={
                updateTaskMutation.isPending ? (
                  <Loader size="sm" />
                ) : (
                  <IconDeviceFloppy size={16} />
                )
              }
            >
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default TaskEditModal;
