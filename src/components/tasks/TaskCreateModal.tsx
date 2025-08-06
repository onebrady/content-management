'use client';

import React from 'react';
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
  MultiSelect,
  Text,
  Alert,
  Loader,
  Divider,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm, zodResolver } from '@mantine/form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { IconAlertCircle, IconPlus } from '@tabler/icons-react';
import {
  createTaskSchema,
  type CreateTaskInput,
} from '@/lib/validation/project-schemas';
import { projectKeys } from '@/features/projects/hooks/queryKeys';
import type { Project, User } from '@/types/database';

interface TaskCreateModalProps {
  opened: boolean;
  onClose: () => void;
  project: Project;
  columnId?: string;
  onTaskCreated?: (task: any) => void;
}

interface CreateTaskFormData {
  title: string;
  description?: string;
  columnId: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: Date | null;
  assigneeId?: string | null;
  estimatedHours?: number;
  tags: string[];
}

export function TaskCreateModal({
  opened,
  onClose,
  project,
  columnId,
  onTaskCreated,
}: TaskCreateModalProps) {
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

  const form = useForm<CreateTaskFormData>({
    validate: zodResolver(createTaskSchema),
    initialValues: {
      title: '',
      description: '',
      columnId: columnId || project.columns[0]?.id || '',
      priority: 'MEDIUM',
      dueDate: null,
      assigneeId: null,
      estimatedHours: undefined,
      tags: [],
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: CreateTaskFormData) => {
      // Calculate position for new task (add at end of column)
      const targetColumn = project.columns.find(
        (col) => col.id === data.columnId
      );
      const maxPosition = targetColumn?.tasks
        ? Math.max(...targetColumn.tasks.map((task) => task.position), 0)
        : 0;
      const position = maxPosition + 1000;

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          position,
          projectId: project.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create task');
      }

      return response.json();
    },
    onSuccess: (newTask) => {
      // Invalidate project data to refresh the board
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(project.id),
      });

      // Call success callback
      if (onTaskCreated) {
        onTaskCreated(newTask);
      }

      // Reset form and close modal
      form.reset();
      onClose();
    },
  });

  const handleSubmit = (values: CreateTaskFormData) => {
    createTaskMutation.mutate(values);
  };

  const handleClose = () => {
    if (!createTaskMutation.isPending) {
      form.reset();
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

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group spacing="sm">
          <IconPlus size={20} />
          <Text fw={600}>Create New Task</Text>
        </Group>
      }
      size="lg"
      centered
      closeOnClickOutside={!createTaskMutation.isPending}
      closeOnEscape={!createTaskMutation.isPending}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          {/* Task Title */}
          <TextInput
            label="Task Title"
            placeholder="Enter task title..."
            required
            {...form.getInputProps('title')}
            disabled={createTaskMutation.isPending}
          />

          {/* Task Description */}
          <Textarea
            label="Description"
            placeholder="Describe the task..."
            minRows={3}
            maxRows={6}
            autosize
            {...form.getInputProps('description')}
            disabled={createTaskMutation.isPending}
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
              disabled={createTaskMutation.isPending}
            />

            <Select
              label="Priority"
              placeholder="Select priority"
              data={priorityOptions}
              {...form.getInputProps('priority')}
              disabled={createTaskMutation.isPending}
            />
          </Group>

          {/* Due Date and Estimated Hours */}
          <Group grow>
            <DateTimePicker
              label="Due Date"
              placeholder="Select due date"
              clearable
              {...form.getInputProps('dueDate')}
              disabled={createTaskMutation.isPending}
            />

            <NumberInput
              label="Estimated Hours"
              placeholder="Hours"
              min={0}
              max={999}
              step={0.5}
              precision={1}
              {...form.getInputProps('estimatedHours')}
              disabled={createTaskMutation.isPending}
            />
          </Group>

          {/* Assignee */}
          <Select
            label="Assignee"
            placeholder="Select assignee"
            data={assigneeOptions}
            clearable
            searchable
            {...form.getInputProps('assigneeId')}
            disabled={createTaskMutation.isPending}
          />

          {/* Tags */}
          <TagsInput
            label="Tags"
            placeholder="Add tags..."
            {...form.getInputProps('tags')}
            disabled={createTaskMutation.isPending}
          />

          {/* Error Display */}
          {createTaskMutation.isError && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
            >
              {createTaskMutation.error?.message || 'Failed to create task'}
            </Alert>
          )}

          <Divider />

          {/* Actions */}
          <Group justify="flex-end">
            <Button
              variant="subtle"
              onClick={handleClose}
              disabled={createTaskMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createTaskMutation.isPending}
              leftSection={
                createTaskMutation.isPending ? (
                  <Loader size="sm" />
                ) : (
                  <IconPlus size={16} />
                )
              }
            >
              Create Task
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default TaskCreateModal;
