'use client';

import React from 'react';
import {
  Modal,
  Button,
  Stack,
  TextInput,
  Textarea,
  ColorInput,
  Group,
  Select,
  Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectKeys } from '@/features/projects/hooks/queryKeys';

interface ProjectCreateModalProps {
  opened: boolean;
  onClose: () => void;
  onProjectCreated?: (project: any) => void;
  initialStatus?: string;
}

// Define project status options
const PROJECT_STATUSES = [
  { value: 'planning', label: 'Planning' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Completed' },
];

export function ProjectCreateModal({
  opened,
  onClose,
  onProjectCreated,
  initialStatus = 'planning',
}: ProjectCreateModalProps) {
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      color: '#3b82f6',
      status: initialStatus,
    },
    validate: {
      title: (value) => (value.length < 1 ? 'Project title is required' : null),
    },
  });

  // Reset form when modal opens with new status
  React.useEffect(() => {
    if (opened) {
      form.setFieldValue('status', initialStatus);
    }
  }, [opened, initialStatus]);

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          visibility: 'PRIVATE',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create project');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      onProjectCreated?.(data);
      handleClose();
    },
  });

  const handleSubmit = (values: any) => {
    createProjectMutation.mutate(values);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Create New Project"
      size="md"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Project Title"
            placeholder="Enter project name..."
            required
            {...form.getInputProps('title')}
            data-autofocus
          />

          <Textarea
            label="Description"
            placeholder="Add a description for this project..."
            rows={3}
            {...form.getInputProps('description')}
          />

          <Select
            label="Status"
            placeholder="Select initial status"
            data={PROJECT_STATUSES}
            {...form.getInputProps('status')}
            required
          />

          <ColorInput
            label="Project Color"
            placeholder="Choose a color for this project"
            {...form.getInputProps('color')}
          />

          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              onClick={handleClose}
              disabled={createProjectMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" loading={createProjectMutation.isPending}>
              Create Project
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default ProjectCreateModal;
