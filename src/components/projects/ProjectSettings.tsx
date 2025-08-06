'use client';

import React, { useState } from 'react';
import {
  Stack,
  Group,
  Button,
  TextInput,
  Textarea,
  ColorInput,
  Switch,
  Paper,
  Text,
  Modal,
  Alert,
  Loader,
  Tabs,
  Divider,
  ActionIcon,
  Badge,
} from '@mantine/core';
import {
  IconSettings,
  IconTrash,
  IconDeviceFloppy,
  IconAlertCircle,
  IconUsers,
  IconColumns,
  IconArchive,
  IconInfoCircle,
} from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import { projectKeys } from '@/features/projects/hooks/queryKeys';
import ColumnManagement from './ColumnManagement';
import type { Project } from '@/types/database';

interface ProjectSettingsProps {
  project: Project;
}

interface ProjectFormData {
  title: string;
  description: string;
  color: string;
  archived: boolean;
}

export function ProjectSettings({ project }: ProjectSettingsProps) {
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [archiveModalOpened, setArchiveModalOpened] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<ProjectFormData>({
    initialValues: {
      title: project.title,
      description: project.description || '',
      color: project.color,
      archived: project.archived,
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async (data: Partial<ProjectFormData>) => {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update project');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(project.id),
      });
      queryClient.invalidateQueries({
        queryKey: projectKeys.all,
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete project');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.all,
      });
      router.push('/projects');
    },
  });

  const handleSubmit = (values: ProjectFormData) => {
    updateProjectMutation.mutate(values);
  };

  const handleArchiveToggle = () => {
    const newArchivedState = !project.archived;
    updateProjectMutation.mutate({ archived: newArchivedState });
    setArchiveModalOpened(false);
  };

  const handleDelete = () => {
    deleteProjectMutation.mutate();
  };

  const isLoading =
    updateProjectMutation.isPending || deleteProjectMutation.isPending;

  const totalTasks = project.columns.reduce(
    (total, column) => total + (column._count?.tasks || 0),
    0
  );

  return (
    <>
      <Tabs defaultValue="general" variant="outline">
        <Tabs.List>
          <Tabs.Tab value="general" leftSection={<IconSettings size={16} />}>
            General
          </Tabs.Tab>
          <Tabs.Tab value="columns" leftSection={<IconColumns size={16} />}>
            Columns
          </Tabs.Tab>
          <Tabs.Tab value="members" leftSection={<IconUsers size={16} />}>
            Members
          </Tabs.Tab>
        </Tabs.List>

        {/* General Settings */}
        <Tabs.Panel value="general" pt="md">
          <Stack spacing="lg">
            {/* Project Overview */}
            <Paper p="md" withBorder>
              <Group justify="space-between" mb="md">
                <Text fw={600} size="lg">
                  Project Overview
                </Text>
                <Group spacing="xs">
                  <Badge variant="light">
                    {project.columns.length} columns
                  </Badge>
                  <Badge variant="light">{totalTasks} tasks</Badge>
                  <Badge variant="light">
                    {project.members.length + 1} members
                  </Badge>
                </Group>
              </Group>

              <Stack spacing="sm">
                <Group spacing="sm">
                  <IconInfoCircle
                    size={16}
                    color="var(--mantine-color-blue-6)"
                  />
                  <Text size="sm">
                    <Text component="span" fw={500}>
                      Created:
                    </Text>{' '}
                    {new Date(project.createdAt).toLocaleDateString()}
                  </Text>
                </Group>
                <Group spacing="sm">
                  <IconInfoCircle
                    size={16}
                    color="var(--mantine-color-blue-6)"
                  />
                  <Text size="sm">
                    <Text component="span" fw={500}>
                      Last Updated:
                    </Text>{' '}
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </Text>
                </Group>
                <Group spacing="sm">
                  <IconUsers size={16} color="var(--mantine-color-blue-6)" />
                  <Text size="sm">
                    <Text component="span" fw={500}>
                      Owner:
                    </Text>{' '}
                    {project.owner.name || project.owner.email}
                  </Text>
                </Group>
              </Stack>
            </Paper>

            {/* Project Details Form */}
            <Paper p="md" withBorder>
              <Text fw={600} size="lg" mb="md">
                Project Details
              </Text>

              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack spacing="md">
                  <TextInput
                    label="Project Title"
                    placeholder="Enter project title..."
                    required
                    {...form.getInputProps('title')}
                    disabled={isLoading}
                  />

                  <Textarea
                    label="Description"
                    placeholder="Describe your project..."
                    minRows={3}
                    autosize
                    {...form.getInputProps('description')}
                    disabled={isLoading}
                  />

                  <ColorInput
                    label="Project Color"
                    placeholder="Pick a color"
                    {...form.getInputProps('color')}
                    disabled={isLoading}
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

                  {updateProjectMutation.isError && (
                    <Alert
                      icon={<IconAlertCircle size={16} />}
                      color="red"
                      variant="light"
                    >
                      {updateProjectMutation.error?.message ||
                        'Failed to update project'}
                    </Alert>
                  )}

                  <Group justify="flex-end">
                    <Button
                      type="submit"
                      loading={updateProjectMutation.isPending}
                      leftSection={<IconDeviceFloppy size={16} />}
                    >
                      Save Changes
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Paper>

            <Divider />

            {/* Danger Zone */}
            <Paper
              p="md"
              withBorder
              style={{ borderColor: 'var(--mantine-color-red-3)' }}
            >
              <Text fw={600} size="lg" c="red" mb="md">
                Danger Zone
              </Text>

              <Stack spacing="md">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text fw={500} mb="xs">
                      {project.archived
                        ? 'Unarchive Project'
                        : 'Archive Project'}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {project.archived
                        ? 'Restore this project and make it active again.'
                        : 'Archive this project to hide it from the main view.'}
                    </Text>
                  </div>
                  <Button
                    variant="light"
                    color={project.archived ? 'blue' : 'orange'}
                    leftSection={<IconArchive size={16} />}
                    onClick={() => setArchiveModalOpened(true)}
                    disabled={isLoading}
                  >
                    {project.archived ? 'Unarchive' : 'Archive'}
                  </Button>
                </Group>

                <Divider />

                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text fw={500} mb="xs" c="red">
                      Delete Project
                    </Text>
                    <Text size="sm" c="dimmed">
                      Permanently delete this project and all its data. This
                      action cannot be undone.
                    </Text>
                  </div>
                  <Button
                    color="red"
                    leftSection={<IconTrash size={16} />}
                    onClick={() => setDeleteModalOpened(true)}
                    disabled={isLoading}
                  >
                    Delete Project
                  </Button>
                </Group>
              </Stack>
            </Paper>
          </Stack>
        </Tabs.Panel>

        {/* Column Management */}
        <Tabs.Panel value="columns" pt="md">
          <ColumnManagement project={project} />
        </Tabs.Panel>

        {/* Member Management */}
        <Tabs.Panel value="members" pt="md">
          <Paper p="md" withBorder>
            <Text fw={600} size="lg" mb="md">
              Project Members
            </Text>
            <Text c="dimmed">
              Member management functionality will be implemented here.
            </Text>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      {/* Archive Confirmation Modal */}
      <Modal
        opened={archiveModalOpened}
        onClose={() => setArchiveModalOpened(false)}
        title={
          <Group spacing="sm">
            <IconArchive size={20} />
            <Text fw={600}>
              {project.archived ? 'Unarchive Project' : 'Archive Project'}
            </Text>
          </Group>
        }
        centered
      >
        <Stack spacing="md">
          <Alert
            icon={<IconInfoCircle size={16} />}
            color={project.archived ? 'blue' : 'orange'}
            variant="light"
          >
            <Text size="sm">
              {project.archived
                ? 'This will restore the project and make it visible in the main projects list.'
                : 'This will hide the project from the main view, but you can still access it from the archived projects section.'}
            </Text>
          </Alert>

          <Group justify="flex-end">
            <Button
              variant="subtle"
              onClick={() => setArchiveModalOpened(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              color={project.archived ? 'blue' : 'orange'}
              loading={updateProjectMutation.isPending}
              onClick={handleArchiveToggle}
            >
              {project.archived ? 'Unarchive' : 'Archive'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title={
          <Group spacing="sm">
            <IconTrash size={20} />
            <Text fw={600}>Delete Project</Text>
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
              This action cannot be undone!
            </Text>
            <Text size="sm">
              You are about to permanently delete "{project.title}" and all its
              data including:
            </Text>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>{project.columns.length} columns</li>
              <li>{totalTasks} tasks</li>
              <li>All task attachments and comments</li>
              <li>Project member assignments</li>
            </ul>
          </Alert>

          {deleteProjectMutation.isError && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
            >
              {deleteProjectMutation.error?.message ||
                'Failed to delete project'}
            </Alert>
          )}

          <Group justify="flex-end">
            <Button
              variant="subtle"
              onClick={() => setDeleteModalOpened(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              color="red"
              loading={deleteProjectMutation.isPending}
              onClick={handleDelete}
            >
              Delete Project
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

export default ProjectSettings;
