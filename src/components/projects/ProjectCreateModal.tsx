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
  Text,
  Alert,
  Loader,
  Divider,
  ActionIcon,
  Box,
  Paper,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IconAlertCircle,
  IconPlus,
  IconTrash,
  IconGripVertical,
  IconFolder,
} from '@tabler/icons-react';
// import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  createProjectSchema,
  type CreateProjectInput,
} from '@/lib/validation/project-schemas';
import { projectKeys } from '@/features/projects/hooks/queryKeys';

interface ProjectCreateModalProps {
  opened: boolean;
  onClose: () => void;
  onProjectCreated?: (project: any) => void;
}

interface ColumnTemplate {
  id: string;
  title: string;
  color: string;
}

const defaultColumns: ColumnTemplate[] = [
  { id: '1', title: 'To Do', color: '#6c757d' },
  { id: '2', title: 'In Progress', color: '#0d6efd' },
  { id: '3', title: 'Done', color: '#198754' },
];

export function ProjectCreateModal({
  opened,
  onClose,
  onProjectCreated,
}: ProjectCreateModalProps) {
  const queryClient = useQueryClient();

  const form = useForm<CreateProjectInput & { columns: ColumnTemplate[] }>({
    validate: {
      title: (value) => {
        if (!value || value.length === 0) return 'Title is required';
        if (value.length > 100) return 'Title must be at most 100 characters';
        return null;
      },
      description: (value) => {
        if (value && value.length > 500)
          return 'Description must be at most 500 characters';
        return null;
      },
    },
    initialValues: {
      title: '',
      description: '',
      color: '#0d6efd',
      columns: defaultColumns,
      defaultColumns: defaultColumns.map((col) => ({
        title: col.title,
        color: col.color,
      })),
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectInput) => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create project');
      }

      return response.json();
    },
    onSuccess: (newProject) => {
      // Invalidate projects list
      queryClient.invalidateQueries({
        queryKey: projectKeys.all,
      });

      if (onProjectCreated) {
        onProjectCreated(newProject.data);
      }

      form.reset();
      onClose();
    },
  });

  const handleSubmit = (
    values: CreateProjectInput & { columns: ColumnTemplate[] }
  ) => {
    const { columns, ...projectData } = values;

    const submitData: CreateProjectInput = {
      ...projectData,
      defaultColumns: columns.map((col) => ({
        title: col.title,
        color: col.color,
      })),
    };

    createProjectMutation.mutate(submitData);
  };

  const handleClose = () => {
    if (!createProjectMutation.isPending) {
      form.reset();
      onClose();
    }
  };

  const addColumn = () => {
    const newColumn: ColumnTemplate = {
      id: Date.now().toString(),
      title: `Column ${form.values.columns.length + 1}`,
      color: '#6c757d',
    };

    form.setFieldValue('columns', [...form.values.columns, newColumn]);
    form.setFieldValue(
      'defaultColumns',
      [...form.values.columns, newColumn].map((col) => ({
        title: col.title,
        color: col.color,
      }))
    );
  };

  const removeColumn = (index: number) => {
    if (form.values.columns.length <= 1) return;

    const newColumns = form.values.columns.filter((_, i) => i !== index);
    form.setFieldValue('columns', newColumns);
    form.setFieldValue(
      'defaultColumns',
      newColumns.map((col) => ({
        title: col.title,
        color: col.color,
      }))
    );
  };

  const updateColumn = (
    index: number,
    field: keyof ColumnTemplate,
    value: string
  ) => {
    const newColumns = [...form.values.columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    form.setFieldValue('columns', newColumns);
    form.setFieldValue(
      'defaultColumns',
      newColumns.map((col) => ({
        title: col.title,
        color: col.color,
      }))
    );
  };

  const moveColumn = (fromIndex: number, toIndex: number) => {
    const items = Array.from(form.values.columns);
    const [reorderedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, reorderedItem);

    form.setFieldValue('columns', items);
    form.setFieldValue(
      'defaultColumns',
      items.map((col) => ({
        title: col.title,
        color: col.color,
      }))
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group spacing="sm">
          <IconFolder size={20} />
          <Text fw={600}>Create New Project</Text>
        </Group>
      }
      size="lg"
      centered
      closeOnClickOutside={!createProjectMutation.isPending}
      closeOnEscape={!createProjectMutation.isPending}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          {/* Project Details */}
          <TextInput
            label="Project Title"
            placeholder="Enter project title..."
            required
            {...form.getInputProps('title')}
            disabled={createProjectMutation.isPending}
          />

          <Textarea
            label="Description"
            placeholder="Describe your project..."
            minRows={3}
            maxRows={6}
            autosize
            {...form.getInputProps('description')}
            disabled={createProjectMutation.isPending}
          />

          <ColorInput
            label="Project Color"
            placeholder="Pick a color"
            {...form.getInputProps('color')}
            disabled={createProjectMutation.isPending}
            format="hex"
            swatches={[
              '#0d6efd',
              '#6610f2',
              '#6f42c1',
              '#d63384',
              '#dc3545',
              '#fd7e14',
              '#ffc107',
              '#198754',
              '#20c997',
              '#0dcaf0',
              '#6c757d',
              '#495057',
            ]}
          />

          <Divider label="Project Columns" labelPosition="center" />

          {/* Column Configuration */}
          <Text size="sm" c="dimmed">
            Set up the initial columns for your project board. You can reorder
            them by dragging.
          </Text>

          <Stack spacing="sm">
            {form.values.columns.map((column, index) => (
              <Paper key={column.id} p="sm" withBorder>
                <Group spacing="sm" align="center">
                  <Box style={{ display: 'flex', flexDirection: 'column' }}>
                    <ActionIcon
                      variant="subtle"
                      size="xs"
                      onClick={() => index > 0 && moveColumn(index, index - 1)}
                      disabled={index === 0 || createProjectMutation.isPending}
                    >
                      ↑
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      size="xs"
                      onClick={() =>
                        index < form.values.columns.length - 1 &&
                        moveColumn(index, index + 1)
                      }
                      disabled={
                        index === form.values.columns.length - 1 ||
                        createProjectMutation.isPending
                      }
                    >
                      ↓
                    </ActionIcon>
                  </Box>

                  <TextInput
                    placeholder="Column title"
                    value={column.title}
                    onChange={(e) =>
                      updateColumn(index, 'title', e.target.value)
                    }
                    style={{ flex: 1 }}
                    disabled={createProjectMutation.isPending}
                  />

                  <ColorInput
                    value={column.color}
                    onChange={(value) => updateColumn(index, 'color', value)}
                    size="sm"
                    w={80}
                    disabled={createProjectMutation.isPending}
                  />

                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => removeColumn(index)}
                    disabled={
                      form.values.columns.length <= 1 ||
                      createProjectMutation.isPending
                    }
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              </Paper>
            ))}
          </Stack>

          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={addColumn}
            disabled={
              form.values.columns.length >= 10 ||
              createProjectMutation.isPending
            }
            fullWidth
          >
            Add Column
          </Button>

          {form.values.columns.length >= 10 && (
            <Alert color="orange" variant="light">
              Maximum 10 columns allowed per project.
            </Alert>
          )}

          {/* Error Display */}
          {createProjectMutation.isError && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
            >
              {createProjectMutation.error?.message ||
                'Failed to create project'}
            </Alert>
          )}

          <Divider />

          {/* Actions */}
          <Group justify="flex-end">
            <Button
              variant="subtle"
              onClick={handleClose}
              disabled={createProjectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createProjectMutation.isPending}
              leftSection={
                createProjectMutation.isPending ? (
                  <Loader size="sm" />
                ) : (
                  <IconFolder size={16} />
                )
              }
            >
              Create Project
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default ProjectCreateModal;
