'use client';

import React, { useState } from 'react';
import {
  Stack,
  Group,
  Button,
  TextInput,
  ActionIcon,
  ColorInput,
  Paper,
  Text,
  Modal,
  Alert,
  Loader,
  Badge,
  Menu,
  Tooltip,
} from '@mantine/core';
import {
  IconPlus,
  IconTrash,
  IconEdit,
  IconGripVertical,
  IconDots,
  IconAlertCircle,
  IconColumns,
} from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from '@mantine/form';
import { projectKeys } from '@/features/projects/hooks/queryKeys';
import type { Column, Project } from '@/types/database';

interface ColumnManagementProps {
  project: Project;
}

interface ColumnFormData {
  title: string;
  color: string;
}

export function ColumnManagement({ project }: ColumnManagementProps) {
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<Column | null>(null);
  const [addModalOpened, setAddModalOpened] = useState(false);

  const queryClient = useQueryClient();

  // Form for adding/editing columns
  const form = useForm<ColumnFormData>({
    initialValues: {
      title: '',
      color: '#6c757d',
    },
  });

  const createColumnMutation = useMutation({
    mutationFn: async (data: ColumnFormData) => {
      const response = await fetch(`/api/projects/${project.id}/columns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create column');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(project.id),
      });
      form.reset();
      setAddModalOpened(false);
    },
  });

  const updateColumnMutation = useMutation({
    mutationFn: async (data: { columnId: string; updates: ColumnFormData }) => {
      const response = await fetch(
        `/api/projects/${project.id}/columns/${data.columnId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data.updates),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update column');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(project.id),
      });
      setEditingColumn(null);
      form.reset();
    },
  });

  const deleteColumnMutation = useMutation({
    mutationFn: async (columnId: string) => {
      const response = await fetch(
        `/api/projects/${project.id}/columns/${columnId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete column');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(project.id),
      });
      setDeleteModalOpened(false);
      setColumnToDelete(null);
    },
  });

  const reorderColumnsMutation = useMutation({
    mutationFn: async (columnOrders: { id: string; position: number }[]) => {
      const response = await fetch(
        `/api/projects/${project.id}/columns/reorder`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ columnOrders }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reorder columns');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(project.id),
      });
    },
  });

  const handleAddColumn = () => {
    form.reset();
    setAddModalOpened(true);
  };

  const handleEditColumn = (column: Column) => {
    form.setValues({
      title: column.title,
      color: column.color,
    });
    setEditingColumn(column);
  };

  const handleDeleteColumn = (column: Column) => {
    setColumnToDelete(column);
    setDeleteModalOpened(true);
  };

  const handleSubmit = (values: ColumnFormData) => {
    if (editingColumn) {
      updateColumnMutation.mutate({
        columnId: editingColumn.id,
        updates: values,
      });
    } else {
      createColumnMutation.mutate(values);
    }
  };

  const confirmDelete = () => {
    if (columnToDelete) {
      deleteColumnMutation.mutate(columnToDelete.id);
    }
  };

  const moveColumn = (columnId: string, direction: 'up' | 'down') => {
    const sortedColumns = [...project.columns].sort(
      (a, b) => a.position - b.position
    );
    const currentIndex = sortedColumns.findIndex((col) => col.id === columnId);

    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sortedColumns.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const columnOrders = sortedColumns.map((col, index) => ({
      id: col.id,
      position:
        index === currentIndex
          ? (newIndex + 1) * 1000
          : index === newIndex
            ? (currentIndex + 1) * 1000
            : (index + 1) * 1000,
    }));

    reorderColumnsMutation.mutate(columnOrders);
  };

  const isLoading =
    createColumnMutation.isPending ||
    updateColumnMutation.isPending ||
    deleteColumnMutation.isPending ||
    reorderColumnsMutation.isPending;

  const sortedColumns = [...project.columns].sort(
    (a, b) => a.position - b.position
  );

  return (
    <>
      <Stack spacing="md">
        <Group justify="space-between">
          <Group spacing="sm">
            <IconColumns size={20} />
            <Text fw={600} size="lg">
              Column Management
            </Text>
            <Badge variant="light">{project.columns.length} columns</Badge>
          </Group>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleAddColumn}
            disabled={isLoading}
          >
            Add Column
          </Button>
        </Group>

        <Stack spacing="sm">
          {sortedColumns.map((column, index) => (
            <Paper key={column.id} p="md" withBorder>
              <Group justify="space-between" align="center">
                <Group spacing="md">
                  <Group spacing="xs">
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={() => moveColumn(column.id, 'up')}
                      disabled={index === 0 || isLoading}
                    >
                      ↑
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={() => moveColumn(column.id, 'down')}
                      disabled={index === sortedColumns.length - 1 || isLoading}
                    >
                      ↓
                    </ActionIcon>
                  </Group>

                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: column.color,
                    }}
                  />

                  <Text fw={500}>{column.title}</Text>

                  <Badge variant="light" size="sm">
                    {column._count?.tasks || 0} tasks
                  </Badge>
                </Group>

                <Menu shadow="md">
                  <Menu.Target>
                    <ActionIcon variant="subtle" disabled={isLoading}>
                      <IconDots size={16} />
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconEdit size={14} />}
                      onClick={() => handleEditColumn(column)}
                    >
                      Edit Column
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      leftSection={<IconTrash size={14} />}
                      color="red"
                      onClick={() => handleDeleteColumn(column)}
                      disabled={project.columns.length <= 1}
                    >
                      Delete Column
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Paper>
          ))}
        </Stack>

        {project.columns.length === 0 && (
          <Paper p="xl" withBorder>
            <Stack align="center" spacing="md">
              <IconColumns size={48} color="var(--mantine-color-gray-5)" />
              <Text ta="center" c="dimmed">
                No columns yet. Add your first column to get started.
              </Text>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={handleAddColumn}
              >
                Add First Column
              </Button>
            </Stack>
          </Paper>
        )}
      </Stack>

      {/* Add/Edit Column Modal */}
      <Modal
        opened={addModalOpened || editingColumn !== null}
        onClose={() => {
          setAddModalOpened(false);
          setEditingColumn(null);
          form.reset();
        }}
        title={
          <Group spacing="sm">
            <IconColumns size={20} />
            <Text fw={600}>
              {editingColumn ? 'Edit Column' : 'Add New Column'}
            </Text>
          </Group>
        }
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack spacing="md">
            <TextInput
              label="Column Title"
              placeholder="Enter column title..."
              required
              {...form.getInputProps('title')}
              disabled={isLoading}
            />

            <ColorInput
              label="Column Color"
              placeholder="Pick a color"
              {...form.getInputProps('color')}
              disabled={isLoading}
              format="hex"
              swatches={[
                '#6c757d',
                '#0d6efd',
                '#198754',
                '#ffc107',
                '#fd7e14',
                '#dc3545',
                '#6610f2',
                '#20c997',
                '#0dcaf0',
                '#495057',
              ]}
            />

            {/* Error Display */}
            {(createColumnMutation.isError || updateColumnMutation.isError) && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                color="red"
                variant="light"
              >
                {createColumnMutation.error?.message ||
                  updateColumnMutation.error?.message ||
                  'An error occurred'}
              </Alert>
            )}

            <Group justify="flex-end">
              <Button
                variant="subtle"
                onClick={() => {
                  setAddModalOpened(false);
                  setEditingColumn(null);
                  form.reset();
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isLoading}
                leftSection={<IconPlus size={16} />}
              >
                {editingColumn ? 'Update Column' : 'Add Column'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title={
          <Group spacing="sm">
            <IconTrash size={20} />
            <Text fw={600}>Delete Column</Text>
          </Group>
        }
        centered
      >
        <Stack spacing="md">
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
          >
            <Text fw={500} mb="xs">
              Are you sure you want to delete this column?
            </Text>
            <Text size="sm">
              Column "{columnToDelete?.title}" and all its tasks will be
              permanently deleted. This action cannot be undone.
            </Text>
          </Alert>

          {deleteColumnMutation.isError && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
            >
              {deleteColumnMutation.error?.message || 'Failed to delete column'}
            </Alert>
          )}

          <Group justify="flex-end">
            <Button
              variant="subtle"
              onClick={() => setDeleteModalOpened(false)}
              disabled={deleteColumnMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              color="red"
              loading={deleteColumnMutation.isPending}
              onClick={confirmDelete}
            >
              Delete Column
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

export default ColumnManagement;
