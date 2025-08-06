'use client';

import { useState } from 'react';
import { useProjects } from '@/features/projects/hooks/useProjectData';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectKeys } from '@/features/projects/hooks/queryKeys';
import { useRouter } from 'next/navigation';
import {
  Box,
  Title,
  LoadingOverlay,
  Card,
  Grid,
  Text,
  Button,
  Center,
  Stack,
  Alert,
  Group,
  Badge,
  Paper,
  Menu,
  ActionIcon,
  Modal,
} from '@mantine/core';
import {
  IconFolder,
  IconAlertCircle,
  IconPlus,
  IconCalendar,
  IconUsers,
  IconTrash,
  IconArchive,
  IconDots,
} from '@tabler/icons-react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import ProjectCreateModal from '@/components/projects/ProjectCreateModal';

export default function ProjectsPage() {
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [archiveModalOpened, setArchiveModalOpened] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const { data: response, isLoading, isError } = useProjects();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Project archive/unarchive mutation
  const archiveProjectMutation = useMutation({
    mutationFn: async (data: { projectId: string; archived: boolean }) => {
      const response = await fetch(`/api/projects/${data.projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: data.archived }),
      });
      if (!response.ok) throw new Error('Failed to update project');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      setArchiveModalOpened(false);
      setSelectedProject(null);
    },
  });

  // Project delete mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete project');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      setDeleteModalOpened(false);
      setSelectedProject(null);
    },
  });

  const handleArchiveProject = (project: any) => {
    setSelectedProject(project);
    setArchiveModalOpened(true);
  };

  const handleDeleteProject = (project: any) => {
    setSelectedProject(project);
    setDeleteModalOpened(true);
  };

  const confirmArchive = () => {
    if (selectedProject) {
      archiveProjectMutation.mutate({
        projectId: selectedProject.id,
        archived: !selectedProject.archived,
      });
    }
  };

  const confirmDelete = () => {
    if (selectedProject) {
      deleteProjectMutation.mutate(selectedProject.id);
    }
  };

  if (isError) {
    return (
      <AuthGuard>
        <AppLayout>
          <Box p="xl">
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
            >
              Failed to load projects. Please try again later.
            </Alert>
          </Box>
        </AppLayout>
      </AuthGuard>
    );
  }

  const projects = response?.data?.projects || [];

  const handleProjectCreated = (project: any) => {
    setCreateModalOpened(false);
    // Optionally refresh projects or navigate to new project
  };

  return (
    <AuthGuard>
      <AppLayout>
        <Box p="xl">
          <Group justify="space-between" mb="xl">
            <div>
              <Title order={1} mb="xs">
                Projects
              </Title>
              <Text size="lg" c="dimmed">
                Manage your team projects and tasks
              </Text>
            </div>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setCreateModalOpened(true)}
              size="md"
            >
              Create Project
            </Button>
          </Group>

          {isLoading ? (
            <LoadingOverlay visible />
          ) : projects.length === 0 ? (
            <Center style={{ minHeight: 400 }}>
              <Stack align="center" spacing="md">
                <IconFolder size={64} color="var(--mantine-color-gray-5)" />
                <Title order={3} c="dimmed">
                  No projects yet
                </Title>
                <Text c="dimmed" ta="center" maw={400}>
                  Create your first project to get started with task management.
                  Organize your work, track progress, and collaborate with your
                  team.
                </Text>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => setCreateModalOpened(true)}
                  size="lg"
                >
                  Create Your First Project
                </Button>
              </Stack>
            </Center>
          ) : (
            <Grid>
              {projects.map((project: any) => (
                <Grid.Col key={project.id} span={{ base: 12, sm: 6, lg: 4 }}>
                  <Paper
                    withBorder
                    p="lg"
                    style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow =
                        'var(--mantine-shadow-lg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow =
                        'var(--mantine-shadow-sm)';
                    }}
                  >
                    <Group justify="space-between" mb="md">
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: project.color,
                        }}
                      />
                      <Group spacing="xs">
                        <Badge
                          variant="light"
                          color={project.archived ? 'gray' : 'green'}
                          size="sm"
                        >
                          {project.archived ? 'Archived' : 'Active'}
                        </Badge>
                        <Menu shadow="md">
                          <Menu.Target>
                            <ActionIcon
                              variant="subtle"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <IconDots size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item
                              leftSection={<IconArchive size={14} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArchiveProject(project);
                              }}
                            >
                              {project.archived ? 'Unarchive' : 'Archive'}
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                              leftSection={<IconTrash size={14} />}
                              color="red"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProject(project);
                              }}
                            >
                              Delete Project
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </Group>

                    <Title order={3} mb="sm" lineClamp={2}>
                      {project.title}
                    </Title>

                    <Text
                      c="dimmed"
                      size="sm"
                      mb="md"
                      lineClamp={3}
                      style={{ flex: 1 }}
                    >
                      {project.description || 'No description provided'}
                    </Text>

                    <Stack spacing="xs" mb="md">
                      <Group spacing="xs">
                        <IconCalendar
                          size={14}
                          color="var(--mantine-color-gray-6)"
                        />
                        <Text size="xs" c="dimmed">
                          Updated{' '}
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </Text>
                      </Group>
                      <Group spacing="xs">
                        <IconUsers
                          size={14}
                          color="var(--mantine-color-gray-6)"
                        />
                        <Text size="xs" c="dimmed">
                          {(project.members?.length || 0) + 1} members
                        </Text>
                      </Group>
                    </Stack>

                    <Group spacing="xs" mb="md">
                      <Badge variant="light" size="sm">
                        {project.columns?.length || 0} columns
                      </Badge>
                      <Badge variant="light" size="sm">
                        {project.columns?.reduce(
                          (total: number, col: any) =>
                            total + (col._count?.tasks || 0),
                          0
                        ) || 0}{' '}
                        tasks
                      </Badge>
                    </Group>

                    <Button
                      component={Link}
                      href={`/projects/${project.id}`}
                      fullWidth
                      variant="light"
                    >
                      View Project
                    </Button>
                  </Paper>
                </Grid.Col>
              ))}
            </Grid>
          )}

          <ProjectCreateModal
            opened={createModalOpened}
            onClose={() => setCreateModalOpened(false)}
            onProjectCreated={handleProjectCreated}
          />

          {/* Archive Confirmation Modal */}
          <Modal
            opened={archiveModalOpened}
            onClose={() => setArchiveModalOpened(false)}
            title={`${selectedProject?.archived ? 'Unarchive' : 'Archive'} Project`}
            centered
          >
            <Stack spacing="md">
              <Text>
                Are you sure you want to{' '}
                {selectedProject?.archived ? 'unarchive' : 'archive'}{' '}
                <strong>"{selectedProject?.title}"</strong>?
              </Text>
              <Text size="sm" c="dimmed">
                {selectedProject?.archived
                  ? 'This will make the project visible in the main projects list.'
                  : 'This will hide the project from the main view, but you can still access it from archived projects.'}
              </Text>
              <Group justify="flex-end">
                <Button
                  variant="subtle"
                  onClick={() => setArchiveModalOpened(false)}
                  disabled={archiveProjectMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  color={selectedProject?.archived ? 'blue' : 'orange'}
                  loading={archiveProjectMutation.isPending}
                  onClick={confirmArchive}
                >
                  {selectedProject?.archived ? 'Unarchive' : 'Archive'}
                </Button>
              </Group>
            </Stack>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            opened={deleteModalOpened}
            onClose={() => setDeleteModalOpened(false)}
            title="Delete Project"
            centered
          >
            <Stack spacing="md">
              <Alert color="red" variant="light">
                <Text fw={500} mb="xs">
                  This action cannot be undone!
                </Text>
                <Text size="sm">
                  You are about to permanently delete{' '}
                  <strong>"{selectedProject?.title}"</strong> and all its data
                  including tasks, columns, and attachments.
                </Text>
              </Alert>
              <Group justify="flex-end">
                <Button
                  variant="subtle"
                  onClick={() => setDeleteModalOpened(false)}
                  disabled={deleteProjectMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  color="red"
                  loading={deleteProjectMutation.isPending}
                  onClick={confirmDelete}
                >
                  Delete Project
                </Button>
              </Group>
            </Stack>
          </Modal>
        </Box>
      </AppLayout>
    </AuthGuard>
  );
}
