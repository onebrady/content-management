'use client';

import { useState, useCallback } from 'react';
import { useProjects } from '@/features/projects/hooks/useProjectData';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectKeys } from '@/features/projects/hooks/queryKeys';
import { useRouter } from 'next/navigation';
import {
  Box,
  Title,
  LoadingOverlay,
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
  IconSettings,
} from '@tabler/icons-react';
import styles from './projects.module.css';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import ProjectCreateModal from '@/components/projects/ProjectCreateModal';
import { TextInput, Textarea, ColorInput, Select } from '@mantine/core';
import { useForm } from '@mantine/form';

// Define project status columns
const PROJECT_STATUSES = [
  { id: 'planning', title: 'Planning', color: '#94a3b8' },
  { id: 'in-progress', title: 'In Progress', color: '#3b82f6' },
  { id: 'review', title: 'Review', color: '#f59e0b' },
  { id: 'completed', title: 'Completed', color: '#10b981' },
];

// Project status options for Select component
const STATUS_OPTIONS = PROJECT_STATUSES.map((status) => ({
  value: status.id,
  label: status.title,
}));

// ProjectEditForm component
interface ProjectEditFormProps {
  project: any;
  onSave: (updates: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function ProjectEditForm({
  project,
  onSave,
  onCancel,
  isLoading,
}: ProjectEditFormProps) {
  const form = useForm({
    initialValues: {
      title: project.title || '',
      description: project.description || '',
      color: project.color || '#3b82f6',
      status: project.status || 'planning',
    },
    validate: {
      title: (value) => (value.length < 1 ? 'Project title is required' : null),
    },
  });

  const handleSubmit = (values: any) => {
    onSave(values);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Project Title"
          placeholder="Enter project name..."
          required
          {...form.getInputProps('title')}
        />

        <Textarea
          label="Description"
          placeholder="Add a description for this project..."
          rows={3}
          {...form.getInputProps('description')}
        />

        <Select
          label="Status"
          placeholder="Select project status"
          data={STATUS_OPTIONS}
          {...form.getInputProps('status')}
          required
        />

        <ColorInput
          label="Project Color"
          placeholder="Choose a color for this project"
          {...form.getInputProps('color')}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            Save Changes
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export default function ProjectsPage() {
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [archiveModalOpened, setArchiveModalOpened] = useState(false);
  const [projectDetailsOpened, setProjectDetailsOpened] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [initialStatus, setInitialStatus] = useState<string>('planning');
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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

  // Project update mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({
      projectId,
      updates,
    }: {
      projectId: string;
      updates: any;
    }) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update project');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      setIsEditingProject(false);
      notifications.show({
        title: 'Success',
        message: 'Project updated successfully',
        color: 'green',
      });
    },
  });

  // Project status update mutation - improved approach
  const updateProjectStatusMutation = useMutation({
    mutationFn: async (data: { projectId: string; status: string }) => {
      const response = await fetch(`/api/projects/${data.projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: data.status }),
      });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to update project status');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list('all') });
      notifications.show({
        title: 'Success',
        message: `Project moved to ${PROJECT_STATUSES.find((s) => s.id === variables.status)?.title || variables.status}`,
        color: 'green',
      });
    },
    onError: (error) => {
      console.error('Error updating project status:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to update project status',
        color: 'red',
      });
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

  const handleViewProject = (project: any) => {
    setSelectedProject(project);
    setProjectDetailsOpened(true);
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

  // Helper function to get project status or default
  const getProjectStatus = (project: any) => {
    return project.status || 'planning';
  };

  // Group projects by status
  const groupProjectsByStatus = (projects: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    PROJECT_STATUSES.forEach((status) => {
      grouped[status.id] = [];
    });

    projects.forEach((project) => {
      const status = getProjectStatus(project);
      if (grouped[status]) {
        grouped[status].push(project);
      } else {
        // If project has unknown status, put in planning
        grouped['planning'].push(project);
      }
    });

    return grouped;
  };

  // Handle drag end - simplified
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source, draggableId } = result;

      // Dropped outside or in same position
      if (
        !destination ||
        (destination.droppableId === source.droppableId &&
          destination.index === source.index)
      ) {
        return;
      }

      // Only handle status changes (moving between columns)
      if (destination.droppableId !== source.droppableId) {
        updateProjectStatusMutation.mutate({
          projectId: draggableId,
          status: destination.droppableId,
        });
      }
    },
    [updateProjectStatusMutation]
  );

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
  const groupedProjects = groupProjectsByStatus(projects);

  const handleProjectCreated = (project: any) => {
    setCreateModalOpened(false);
  };

  return (
    <AuthGuard>
      <AppLayout>
        <Box p="xl">
          {/* Header */}
          <Box mb="xl">
            <Title order={1} mb="xs">
              Projects
            </Title>
            <Text size="lg" c="dimmed">
              Drag projects between columns to update their status
            </Text>
          </Box>

          {isLoading ? (
            <LoadingOverlay visible />
          ) : projects.length === 0 ? (
            <Center style={{ minHeight: 400 }}>
              <Stack align="center" gap="md">
                <IconFolder size={64} color="var(--mantine-color-gray-5)" />
                <Title order={3} c="dimmed">
                  No projects yet
                </Title>
                <Text c="dimmed" ta="center" maw={400}>
                  Use the &quot;Add a project&quot; button in any column below
                  to create your first project. Projects will appear as cards
                  that you can drag between status columns.
                </Text>
              </Stack>
            </Center>
          ) : (
            /* Main Kanban Board */
            <DragDropContext onDragEnd={handleDragEnd}>
              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  overflowX: 'auto',
                  paddingBottom: '20px',
                }}
              >
                {PROJECT_STATUSES.map((status) => (
                  <Droppable
                    key={status.id}
                    droppableId={status.id}
                    type="project"
                  >
                    {(provided, snapshot) => (
                      <Paper
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`${styles.droppableColumn} ${
                          snapshot.isDraggingOver
                            ? styles.droppableColumnDragOver
                            : snapshot.draggingFromThisWith
                              ? styles.droppableColumnDragFrom
                              : ''
                        }`}
                        withBorder
                        radius="md"
                        style={{
                          minWidth: '320px',
                          width: '320px',
                          minHeight: '500px',
                          display: 'flex',
                          flexDirection: 'column',
                          background: snapshot.isDraggingOver
                            ? 'var(--mantine-color-blue-1)'
                            : snapshot.draggingFromThisWith
                              ? 'var(--mantine-color-gray-1)'
                              : 'var(--mantine-color-gray-0)',
                        }}
                        p="md"
                      >
                        {/* Column Header */}
                        <Group justify="space-between" align="center" mb="md">
                          <Group gap="xs">
                            <div
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: status.color,
                              }}
                            />
                            <Title order={4} fw={600}>
                              {status.title}
                            </Title>
                          </Group>
                          <Badge variant="light" size="sm">
                            {groupedProjects[status.id]?.length || 0}
                          </Badge>
                        </Group>

                        {/* Project Cards */}
                        <Stack
                          gap="sm"
                          style={{
                            flex: 1,
                            minHeight: '300px',
                            overflowY: 'auto',
                          }}
                        >
                          {groupedProjects[status.id]?.map((project, index) => (
                            <Draggable
                              key={project.id}
                              draggableId={project.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <Paper
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  data-testid={`draggable-${project.id}`}
                                  className={`${styles.projectCard} ${
                                    snapshot.isDragging ? styles.dragging : ''
                                  }`}
                                  onClick={(e) => {
                                    // Only open details on direct click, not during drag
                                    if (!snapshot.isDragging) {
                                      e.stopPropagation();
                                      handleViewProject(project);
                                    }
                                  }}
                                  p="md"
                                  withBorder
                                  shadow="sm"
                                >
                                  <Stack gap="xs">
                                    <Group
                                      justify="space-between"
                                      align="flex-start"
                                    >
                                      <Group gap="xs" style={{ flex: 1 }}>
                                        <div
                                          style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background:
                                              project.color || '#3b82f6',
                                            flexShrink: 0,
                                          }}
                                        />
                                        <Text
                                          fw={500}
                                          size="sm"
                                          lineClamp={2}
                                          style={{ flex: 1 }}
                                        >
                                          {project.title}
                                        </Text>
                                      </Group>
                                      <Menu shadow="md" withinPortal>
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
                                            leftSection={
                                              <IconArchive size={14} />
                                            }
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleArchiveProject(project);
                                            }}
                                          >
                                            {project.archived
                                              ? 'Unarchive'
                                              : 'Archive'}
                                          </Menu.Item>
                                          <Menu.Divider />
                                          <Menu.Item
                                            leftSection={
                                              <IconTrash size={14} />
                                            }
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

                                    {project.description && (
                                      <Text size="xs" c="dimmed" lineClamp={2}>
                                        {project.description}
                                      </Text>
                                    )}

                                    {/* Project Metadata */}
                                    <Group justify="space-between" gap="xs">
                                      <Group gap="xs">
                                        <IconCalendar
                                          size={12}
                                          color="var(--mantine-color-gray-6)"
                                        />
                                        <Text size="xs" c="dimmed">
                                          {new Date(
                                            project.updatedAt
                                          ).toLocaleDateString()}
                                        </Text>
                                      </Group>
                                      <Group gap="xs">
                                        <IconUsers
                                          size={12}
                                          color="var(--mantine-color-gray-6)"
                                        />
                                        <Text size="xs" c="dimmed">
                                          {(project.members?.length || 0) + 1}
                                        </Text>
                                      </Group>
                                    </Group>
                                  </Stack>
                                </Paper>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </Stack>

                        {/* Add Project Card Button */}
                        <Button
                          variant="subtle"
                          leftSection={<IconPlus size={14} />}
                          size="sm"
                          fullWidth
                          onClick={() => {
                            setInitialStatus(status.id);
                            setCreateModalOpened(true);
                          }}
                          style={{
                            marginTop: '8px',
                            color: 'var(--mantine-color-gray-6)',
                            justifyContent: 'flex-start',
                          }}
                        >
                          Add a project
                        </Button>
                      </Paper>
                    )}
                  </Droppable>
                ))}
              </div>
            </DragDropContext>
          )}
        </Box>

        {/* Project Modals */}
        <ProjectCreateModal
          opened={createModalOpened}
          onClose={() => setCreateModalOpened(false)}
          onProjectCreated={handleProjectCreated}
          initialStatus={initialStatus}
        />

        {/* Archive Confirmation Modal */}
        <Modal
          opened={archiveModalOpened}
          onClose={() => setArchiveModalOpened(false)}
          title={`${selectedProject?.archived ? 'Unarchive' : 'Archive'} Project`}
          centered
        >
          <Stack gap="md">
            <Text>
              Are you sure you want to{' '}
              {selectedProject?.archived ? 'unarchive' : 'archive'}{' '}
              <strong>&quot;{selectedProject?.title}&quot;</strong>?
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
          <Stack gap="md">
            <Alert color="red" variant="light">
              <Text fw={500} mb="xs">
                This action cannot be undone!
              </Text>
              <Text size="sm">
                You are about to permanently delete{' '}
                <strong>&quot;{selectedProject?.title}&quot;</strong> and all
                its data including tasks, columns, and attachments.
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

        {/* Project Details Modal */}
        <Modal
          opened={projectDetailsOpened}
          onClose={() => {
            setProjectDetailsOpened(false);
            setSelectedProject(null);
            setIsEditingProject(false);
          }}
          title={
            isEditingProject
              ? 'Edit Project'
              : selectedProject?.title || 'Project Details'
          }
          size="lg"
          centered
        >
          {selectedProject && !isEditingProject && (
            <Stack gap="md">
              <Group gap="xs">
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: selectedProject.color || '#3b82f6',
                  }}
                />
                <Badge variant="light" size="sm">
                  {PROJECT_STATUSES.find((s) => s.id === selectedProject.status)
                    ?.title || 'Unknown Status'}
                </Badge>
                {selectedProject.archived && (
                  <Badge color="gray" size="sm">
                    Archived
                  </Badge>
                )}
              </Group>

              {selectedProject.description ? (
                <div>
                  <Text fw={500} mb="xs">
                    Description
                  </Text>
                  <Text c="dimmed">{selectedProject.description}</Text>
                </div>
              ) : (
                <Text c="dimmed" fs="italic">
                  No description provided
                </Text>
              )}

              <Group justify="space-between">
                <div>
                  <Text fw={500} mb="xs">
                    Created
                  </Text>
                  <Group gap="xs">
                    <IconCalendar
                      size={16}
                      color="var(--mantine-color-gray-6)"
                    />
                    <Text size="sm" c="dimmed">
                      {new Date(selectedProject.createdAt).toLocaleDateString()}
                    </Text>
                  </Group>
                </div>
                <div>
                  <Text fw={500} mb="xs">
                    Last Updated
                  </Text>
                  <Group gap="xs">
                    <IconCalendar
                      size={16}
                      color="var(--mantine-color-gray-6)"
                    />
                    <Text size="sm" c="dimmed">
                      {new Date(selectedProject.updatedAt).toLocaleDateString()}
                    </Text>
                  </Group>
                </div>
              </Group>

              <div>
                <Text fw={500} mb="xs">
                  Team Members
                </Text>
                <Group gap="xs">
                  <IconUsers size={16} color="var(--mantine-color-gray-6)" />
                  <Text size="sm" c="dimmed">
                    {(selectedProject.members?.length || 0) + 1} members
                  </Text>
                </Group>
              </div>

              <Group justify="space-between" mt="md">
                <Button
                  variant="subtle"
                  onClick={() => setIsEditingProject(true)}
                >
                  Edit Project
                </Button>
                <Button
                  variant="light"
                  onClick={() => setProjectDetailsOpened(false)}
                >
                  Close
                </Button>
              </Group>
            </Stack>
          )}

          {selectedProject && isEditingProject && (
            <ProjectEditForm
              project={selectedProject}
              onSave={(updates) => {
                updateProjectMutation.mutate({
                  projectId: selectedProject.id,
                  updates,
                });
              }}
              onCancel={() => setIsEditingProject(false)}
              isLoading={updateProjectMutation.isPending}
            />
          )}
        </Modal>
      </AppLayout>
    </AuthGuard>
  );
}
