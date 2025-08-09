'use client';

import { useState, useCallback, useMemo, memo, useEffect, useRef } from 'react';
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
  TextInput,
  Textarea,
  ColorInput,
  Select,
  Avatar,
  Divider,
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
  IconEdit,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import styles from './projects.module.css';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import BoardDndKit from '@/features/projects/components/BoardDndKit';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import ProjectCreateModal from '@/components/projects/ProjectCreateModal';
import { useForm } from '@mantine/form';
import { computeNextStatusOrder } from '@/lib/projects/order';

// Default project status columns for new users
const DEFAULT_PROJECT_STATUSES = [
  { id: 'planning', title: 'Planning', color: '#94a3b8' },
  { id: 'in-progress', title: 'In Progress', color: '#3b82f6' },
  { id: 'review', title: 'Review', color: '#f59e0b' },
  { id: 'completed', title: 'Completed', color: '#10b981' },
];

function normalizeStatusIdClient(input?: string): string {
  if (!input) return 'planning';
  const s = input.toLowerCase().replace(/[_\s]+/g, '-');
  if (['planning', 'in-progress', 'review', 'completed'].includes(s)) return s;
  if (s.includes('progress')) return 'in-progress';
  if (s.includes('review')) return 'review';
  if (s.includes('complete')) return 'completed';
  // Allow custom status slugs without coercing to planning
  return s;
}

// Optimized ProjectCard component for smooth dragging
interface ProjectCardProps {
  project: any;
  index: number;
  onViewProject: (project: any) => void;
  onArchiveProject: (project: any) => void;
  onDeleteProject: (project: any) => void;
  onDebugMove?: (project: any, targetStatus: string) => void;
  showDebug?: boolean;
}

const ProjectCard = memo(
  ({
    project,
    index,
    onViewProject,
    onArchiveProject,
    onDeleteProject,
    onDebugMove,
    showDebug = false,
  }: ProjectCardProps) => {
    return (
      <Draggable draggableId={project.id} index={index}>
        {(provided, snapshot) => (
          <Paper
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            data-testid={`draggable-${project.id}`}
            className={`${styles.projectCard} ${styles.dragHandle} ${
              snapshot.isDragging ? styles.dragging : ''
            } ${snapshot.isDropAnimating ? styles.dropAnimating : ''}`}
            onClick={(e) => {
              // Only open details on direct click, not during drag
              if (!snapshot.isDragging) {
                e.stopPropagation();
                onViewProject(project);
              }
            }}
            p="md"
            withBorder
            shadow="sm"
            style={{
              ...(snapshot.isDropAnimating
                ? {
                    ...provided.draggableProps.style,
                    transitionDuration: '0.001s',
                  }
                : (provided.draggableProps.style as any)),
              position: 'relative',
              zIndex: snapshot.isDragging
                ? 1000
                : ((provided.draggableProps.style as any)?.zIndex ?? 'auto'),
              pointerEvents: snapshot.isDragging ? 'none' : 'auto',
            }}
          >
            <Stack gap="xs">
              <Group justify="space-between" align="flex-start">
                <Group gap="xs" style={{ flex: 1 }}>
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: project.color || '#3b82f6',
                      flexShrink: 0,
                    }}
                  />
                  <Text fw={500} size="sm" lineClamp={2} style={{ flex: 1 }}>
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
                      leftSection={<IconArchive size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onArchiveProject(project);
                      }}
                    >
                      {project.archived ? 'Unarchive' : 'Archive'}
                    </Menu.Item>
                    <Menu.Divider />
                    {showDebug && (
                      <Menu.Item
                        leftSection={<IconCheck size={14} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDebugMove?.(project, 'in-progress');
                        }}
                      >
                        Debug: Move to In Progress
                      </Menu.Item>
                    )}
                    {showDebug && (
                      <Menu.Item
                        leftSection={<IconCheck size={14} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDebugMove?.(project, 'planning');
                        }}
                      >
                        Debug: Move to Planning
                      </Menu.Item>
                    )}
                    {showDebug && <Menu.Divider />}
                    <Menu.Item
                      leftSection={<IconTrash size={14} />}
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(project);
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
                  <IconCalendar size={12} color="var(--mantine-color-gray-6)" />
                  <Text size="xs" c="dimmed">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </Text>
                </Group>
                <Group gap="xs">
                  <IconUsers size={12} color="var(--mantine-color-gray-6)" />
                  <Text size="xs" c="dimmed">
                    {(project.members?.length || 0) + 1}
                  </Text>
                </Group>
              </Group>
            </Stack>
          </Paper>
        )}
      </Draggable>
    );
  }
);

ProjectCard.displayName = 'ProjectCard';

// Optimized column component for better performance
interface ColumnProps {
  status: { id: string; title: string; color: string };
  projects: any[];
  onViewProject: (project: any) => void;
  onArchiveProject: (project: any) => void;
  onDeleteProject: (project: any) => void;
  onAddProject: (statusId: string) => void;
  onEditColumn?: (status: { id: string; title: string; color: string }) => void;
  onDeleteColumn?: (statusId: string) => void;
  canEdit?: boolean;
  // Debug helpers wired from parent so we don't reference parent-local state here
  onDebugMove?: (project: any, index: number, targetStatus: string) => void;
  showDebug?: boolean;
}

const ProjectColumn = memo(
  ({
    status,
    projects,
    onViewProject,
    onArchiveProject,
    onDeleteProject,
    onAddProject,
    onEditColumn,
    onDeleteColumn,
    canEdit = false,
    onDebugMove,
    showDebug = false,
  }: ColumnProps) => {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitle, setEditTitle] = useState(status.title);

    const handleTitleEdit = () => {
      if (isEditingTitle && editTitle.trim() && editTitle !== status.title) {
        onEditColumn?.({ ...status, title: editTitle.trim() });
      }
      setIsEditingTitle(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleTitleEdit();
      } else if (e.key === 'Escape') {
        setEditTitle(status.title);
        setIsEditingTitle(false);
      }
    };

    return (
      <Paper
        withBorder
        radius="md"
        className={`droppableColumn`}
        style={{
          minWidth: '320px',
          width: '320px',
          minHeight: '500px',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--mantine-color-gray-0)',
        }}
        p="md"
      >
        {/* Column Header */}
        <Group justify="space-between" align="center" mb="md">
          <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: status.color,
                flexShrink: 0,
              }}
            />
            <Title order={4} fw={600} style={{ flex: 1 }}>
              {status.title}
            </Title>
          </Group>
          <Badge variant="light" size="sm">
            {projects.length}
          </Badge>
        </Group>

        {/* Project Cards droppable area (only the list is droppable) */}
        <Droppable droppableId={status.id} type="project">
          {(provided, snapshot) => (
            <Stack
              ref={provided.innerRef}
              {...provided.droppableProps}
              gap="sm"
              /* Ensure this is the ONLY scroll parent for items */
              style={{
                flex: 1,
                minHeight: '300px',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
              data-testid={`column-${status.id}`}
              data-e2e-column-id={status.id}
              className={`${snapshot.isDraggingOver ? styles.dragOver : ''} ${styles.droppableList}`}
            >
              {projects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  onViewProject={onViewProject}
                  onArchiveProject={onArchiveProject}
                  onDeleteProject={onDeleteProject}
                  showDebug={showDebug}
                  onDebugMove={(p, target) => onDebugMove?.(p, index, target)}
                />
              ))}
              {provided.placeholder}
            </Stack>
          )}
        </Droppable>

        {/* Add Project Card Button */}
        <Button
          variant="subtle"
          leftSection={<IconPlus size={14} />}
          size="sm"
          fullWidth
          onClick={() => onAddProject(status.id)}
          style={{
            marginTop: '8px',
            color: 'var(--mantine-color-gray-6)',
            justifyContent: 'flex-start',
          }}
        >
          Add a project
        </Button>
      </Paper>
    );
  }
);

ProjectColumn.displayName = 'ProjectColumn';

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

  // Use the default statuses for now (in a real app, you'd get this from context/props)
  const statusOptions = DEFAULT_PROJECT_STATUSES.map((status) => ({
    value: status.id,
    label: status.title,
  }));

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
          data={statusOptions}
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
  const isE2ETest =
    typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_E2E_TEST === 'true';
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [archiveModalOpened, setArchiveModalOpened] = useState(false);
  const [projectDetailsOpened, setProjectDetailsOpened] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [initialStatus, setInitialStatus] = useState<string>('planning');
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  // Members & tasks state for project details modal
  const [projectMembers, setProjectMembers] = useState<any[] | null>(null);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<string | null>(
    null
  );
  const handleRemoveMember = useCallback(
    async (userId: string) => {
      if (!selectedProject?.id) return;
      try {
        const res = await fetch(
          `/api/projects/${selectedProject.id}/members?userId=${encodeURIComponent(userId)}`,
          { method: 'DELETE' }
        );
        if (!res.ok) throw new Error('Failed to remove member');
        setProjectMembers(
          (prev) => prev?.filter((m) => m.user.id !== userId) ?? []
        );
        notifications.show({
          title: 'Member removed',
          message: 'User removed from project',
          color: 'green',
        });
      } catch (e) {
        console.error(e);
        notifications.show({
          title: 'Error',
          message: (e as Error).message,
          color: 'red',
        });
      }
    },
    [selectedProject?.id]
  );

  const handleUpdateMemberRole = useCallback(
    async (userId: string, role: 'VIEWER' | 'MEMBER' | 'ADMIN') => {
      if (!selectedProject?.id) return;
      try {
        const res = await fetch(`/api/projects/${selectedProject.id}/members`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, role }),
        });
        if (!res.ok) throw new Error('Failed to update role');
        const updated = await res.json();
        const updatedMember = updated?.data ?? updated;
        setProjectMembers(
          (prev) =>
            prev?.map((m) => (m.user.id === userId ? updatedMember : m)) ?? []
        );
        notifications.show({
          title: 'Role updated',
          message: 'Member role updated',
          color: 'green',
        });
      } catch (e) {
        console.error(e);
        notifications.show({
          title: 'Error',
          message: (e as Error).message,
          color: 'red',
        });
      }
    },
    [selectedProject?.id]
  );
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskListId, setNewTaskListId] = useState<string | null>(null);

  // Column management state
  const [projectStatuses, setProjectStatuses] = useState(
    DEFAULT_PROJECT_STATUSES
  );
  // Persist custom statuses locally to survive page reloads
  useEffect(() => {
    try {
      const raw = localStorage.getItem('projects_board_statuses');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.every((s) => s?.id && s?.title)) {
          setProjectStatuses(parsed);
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        'projects_board_statuses',
        JSON.stringify(projectStatuses)
      );
    } catch {}
  }, [projectStatuses]);
  const [addColumnModalOpened, setAddColumnModalOpened] = useState(false);
  const [deleteColumnModalOpened, setDeleteColumnModalOpened] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);

  const { data: response, isLoading, isError } = useProjects();
  const queryClient = useQueryClient();
  const router = useRouter();
  const lastPersistRef = useRef<string | null>(null);

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

  // Compute a persistent statusOrder using neighbors for stable ordering after reloads
  const computeNewStatusOrder = useCallback(
    (args: {
      draggableId: string;
      sourceDroppableId: string;
      destDroppableId: string;
      sourceIndex: number;
      destIndex: number;
    }): number => {
      // Build grouped map for destination list
      const grouped: Record<string, any[]> = {};
      projectStatuses.forEach((s) => (grouped[s.id] = []));
      const projectsAll: any[] = response?.data?.projects || [];
      projectsAll.forEach((p) => {
        const sid = p.status || 'planning';
        if (grouped[sid]) grouped[sid].push(p);
      });

      const destList = [...(grouped[args.destDroppableId] || [])];
      // When reordering within same list, simulate removal/insert to compute neighbors
      if (args.sourceDroppableId === args.destDroppableId) {
        const list = destList;
        const [removed] = list.splice(args.sourceIndex, 1);
        const insertIndex =
          args.destIndex > args.sourceIndex
            ? args.destIndex - 1
            : args.destIndex;
        if (removed) list.splice(insertIndex, 0, removed);
        return computeNextStatusOrder(list as any, insertIndex);
      }

      const insertIndex = Math.min(args.destIndex, destList.length);
      return computeNextStatusOrder(destList as any, insertIndex);
    },
    [projectStatuses, response?.data?.projects]
  );

  // Project status update mutation - persist status and statusOrder
  const updateProjectStatusMutation = useMutation({
    mutationFn: async (data: {
      projectId: string;
      status: string;
      statusOrder?: number;
      destIndex?: number;
    }) => {
      const response = await fetch(`/api/projects/${data.projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Keep backward-compat fields
          status: data.status,
          statusOrder: data.statusOrder,
          // New authoritative intent
          destStatus: data.status,
          destIndex: data.destIndex,
        }),
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        // eslint-disable-next-line no-console
        console.error('[Projects DnD] PATCH failed', {
          status: response.status,
          body: text,
        });
        let msg = 'Failed to update project status';
        try {
          const jd = JSON.parse(text);
          msg = jd?.error || jd?.message || msg;
        } catch {}
        throw new Error(msg);
      }
      return response.json();
    },
    // Optimistic update - immediately update UI before API call
    onMutate: async (variables: {
      projectId: string;
      status: string;
      sourceIndex?: number;
      destIndex?: number;
      sourceDroppableId?: string;
      destDroppableId?: string;
      statusOrder?: number;
    }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: projectKeys.list('all') });

      // Snapshot the previous value
      const previousProjects = queryClient.getQueryData(
        projectKeys.list('all')
      );

      // Optimistically update to the new value with reordering
      queryClient.setQueryData(projectKeys.list('all'), (old: any) => {
        if (!old?.data?.projects) return old;
        const projects: any[] = old.data.projects;

        if (
          variables.sourceDroppableId &&
          variables.destDroppableId &&
          typeof variables.sourceIndex === 'number' &&
          typeof variables.destIndex === 'number'
        ) {
          // Build grouped map
          const grouped: Record<string, any[]> = {};
          projectStatuses.forEach((status) => {
            grouped[status.id] = [];
          });
          projects.forEach((p) => {
            const s = p.status || 'planning';
            if (grouped[s]) grouped[s].push(p);
          });

          // Remove from source
          const sourceList = grouped[variables.sourceDroppableId] || [];
          const [moved] = sourceList.splice(variables.sourceIndex, 1);

          // Insert into destination with same-list downward move correction
          if (moved) {
            const isSameList =
              variables.sourceDroppableId === variables.destDroppableId;
            moved.status = variables.destDroppableId;
            if (typeof variables.statusOrder === 'number') {
              moved.statusOrder = variables.statusOrder;
            }
            const destList = grouped[variables.destDroppableId] || [];
            let insertIndex = Math.min(variables.destIndex, destList.length);
            if (isSameList && variables.destIndex > variables.sourceIndex) {
              insertIndex = Math.min(variables.destIndex - 1, destList.length);
            }
            destList.splice(insertIndex, 0, moved);
          }

          // Flatten back to array preserving column order
          const flattened: any[] = [];
          projectStatuses.forEach((status) => {
            flattened.push(...(grouped[status.id] || []));
          });

          return {
            ...old,
            data: {
              ...old.data,
              projects: flattened,
            },
          };
        }

        // Fallback: just update status if indices are not available
        return {
          ...old,
          data: {
            ...old.data,
            projects: projects.map((project: any) =>
              project.id === variables.projectId
                ? { ...project, status: variables.status }
                : project
            ),
          },
        };
      });

      // Return a context object with the snapshotted value
      return { previousProjects };
    },
    onSuccess: (data, variables) => {
      // Single light invalidation; rely on optimistic update for immediate UI
      queryClient.invalidateQueries({ queryKey: projectKeys.list('all') });
      const statusTitle =
        projectStatuses.find((s) => s.id === variables.status)?.title ||
        variables.status;
      notifications.show({
        title: 'Success',
        message: `Project moved to ${statusTitle}`,
        color: 'green',
      });
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProjects) {
        queryClient.setQueryData(
          projectKeys.list('all'),
          context.previousProjects
        );
      }

      console.error('Error updating project status:', error);
      notifications.show({
        title: 'Error',
        message: (error as Error).message || 'Failed to update project status',
        color: 'red',
      });
    },
    // Avoid extra refetches; cache already updated optimistically
    onSettled: () => {},
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
    return normalizeStatusIdClient(project.status);
  };

  // Group projects by status (using dynamic projectStatuses)
  const groupProjectsByStatus = useCallback(
    (projects: any[]) => {
      const grouped: { [key: string]: any[] } = {};
      projectStatuses.forEach((status) => {
        grouped[status.id] = [];
      });

      projects.forEach((project) => {
        const status = getProjectStatus(project);
        if (grouped[status]) {
          grouped[status].push(project);
        } else {
          // If project has unknown status, put in first available column
          const firstColumn = projectStatuses[0];
          if (firstColumn) {
            grouped[firstColumn.id].push(project);
          }
        }
      });

      return grouped;
    },
    [projectStatuses]
  );

  // Handle drag start
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    // Disable pointer events to prevent hover effects during drag
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
    // eslint-disable-next-line no-console
    console.info('[Projects DnD] DragStart');
    if (process.env.NEXT_PUBLIC_E2E_TEST !== 'true') {
      // Diagnostic: log scroll parents for first droppable
      try {
        const firstDroppable = document.querySelector('[data-e2e-column-id]');
        const scrollParents: string[] = [];
        let p: any = firstDroppable?.parentElement;
        while (p) {
          const style = window.getComputedStyle(p);
          if (
            ['auto', 'scroll'].includes(style.overflow) ||
            ['auto', 'scroll'].includes(style.overflowY) ||
            ['auto', 'scroll'].includes(style.overflowX)
          ) {
            scrollParents.push(
              `${p.tagName.toLowerCase()}${p.className ? '.' + String(p.className).split(' ').join('.') : ''}`
            );
          }
          p = p.parentElement;
        }
        // Only emit if something interesting
        if (scrollParents.length) {
          // eslint-disable-next-line no-console
          console.warn(
            '[Projects DnD] Scroll parents detected for Droppable:',
            scrollParents
          );
        }
      } catch {}
    }
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      const { destination, source, draggableId } = result;
      if (
        !destination ||
        (destination.droppableId === source.droppableId &&
          destination.index === source.index)
      ) {
        return;
      }
      const sourceId = source.droppableId.toLowerCase().replace(/[ _]+/g, '-');
      const destId = destination.droppableId
        .toLowerCase()
        .replace(/[ _]+/g, '-');
      const statusOrder = computeNewStatusOrder({
        draggableId,
        sourceDroppableId: sourceId,
        destDroppableId: destId,
        sourceIndex: source.index,
        destIndex: destination.index,
      });

      // Diagnostics
      // eslint-disable-next-line no-console
      console.info('[Projects DnD] DragEnd', {
        draggableId,
        source: { id: sourceId, index: source.index },
        dest: { id: destId, index: destination.index },
        computedStatusOrder: statusOrder,
        placeholderSettled: true,
      });

      // Persist immediately
      (updateProjectStatusMutation as any)
        .mutateAsync({
          projectId: draggableId,
          status: destId,
          sourceIndex: source.index,
          destIndex: destination.index,
          sourceDroppableId: sourceId,
          destDroppableId: destId,
          statusOrder,
          destIndex: destination.index,
        })
        .catch(() => {
          /* handled in onError */
        });
    },
    [updateProjectStatusMutation, computeNewStatusOrder]
  );

  // Optional: log drag updates to confirm events are firing
  const handleDragUpdate = useCallback((update: any) => {
    try {
      const d = update?.destination;
      if (d) {
        // eslint-disable-next-line no-console
        console.info('[Projects DnD] DragUpdate', {
          dest: { id: d.droppableId, index: d.index },
        });
      }
    } catch {}
  }, []);

  // Column management handlers
  const handleEditColumn = useCallback(
    (updatedStatus: { id: string; title: string; color: string }) => {
      setProjectStatuses((prev) =>
        prev.map((status) =>
          status.id === updatedStatus.id ? updatedStatus : status
        )
      );
    },
    []
  );

  const handleDeleteColumn = useCallback((statusId: string) => {
    setColumnToDelete(statusId);
    setDeleteColumnModalOpened(true);
  }, []);

  const confirmDeleteColumn = useCallback(() => {
    if (columnToDelete && projectStatuses.length > 1) {
      setProjectStatuses((prev) =>
        prev.filter((status) => status.id !== columnToDelete)
      );
      setDeleteColumnModalOpened(false);
      setColumnToDelete(null);
    }
  }, [columnToDelete, projectStatuses.length]);

  const handleAddColumn = useCallback(() => {
    setAddColumnModalOpened(true);
  }, []);

  const addNewColumn = useCallback((title: string, color: string) => {
    const newColumn = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      color: color,
    };
    setProjectStatuses((prev) => [...prev, newColumn]);
    setAddColumnModalOpened(false);
  }, []);

  // Memoized handlers for better performance
  const handleAddProject = useCallback((statusId: string) => {
    setInitialStatus(statusId);
    setCreateModalOpened(true);
  }, []);

  // Backward/forward compatible response handling
  const projects = response?.data?.projects ?? response?.projects ?? [];

  // Memoize grouped projects for better performance
  const groupedProjects = useMemo(
    () => groupProjectsByStatus(projects),
    [projects]
  );

  // One-time diagnostic on mount: log ancestor scroll parents for first droppable
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_E2E_TEST === 'true') return;
    try {
      const el = document.querySelector('[data-e2e-column-id]');
      if (!el) return;
      const parents: string[] = [];
      let p: any = el.parentElement;
      while (p) {
        const style = window.getComputedStyle(p);
        if (
          ['auto', 'scroll'].includes(style.overflow) ||
          ['auto', 'scroll'].includes(style.overflowY) ||
          ['auto', 'scroll'].includes(style.overflowX)
        ) {
          parents.push(
            `${p.tagName.toLowerCase()}${p.className ? '.' + String(p.className).split(' ').join('.') : ''}`
          );
        }
        p = p.parentElement;
      }
      if (parents.length) {
        // eslint-disable-next-line no-console
        console.warn('[Projects DnD] Ancestor scroll parents:', parents);
      }
    } catch {}
  }, []);

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

  const handleProjectCreated = (project: any) => {
    setCreateModalOpened(false);
  };

  // Load project members and users when opening details
  if (typeof window !== 'undefined') {
    // no-op placeholder to satisfy SSR checks
  }

  const loadProjectDetail = useCallback(async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) return;
      const detail = await res.json();
      setSelectedProject((prev: any) => ({ ...prev, ...detail }));
    } catch {}
  }, []);

  const loadMembersAndUsers = useCallback(async (projectId: string) => {
    try {
      setIsLoadingMembers(true);
      const [membersRes, usersRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/members`),
        fetch('/api/users'),
      ]);
      if (membersRes.ok) {
        const membersJson = await membersRes.json();
        setProjectMembers(membersJson?.data ?? membersJson);
      }
      if (usersRes.ok) {
        const usersJson = await usersRes.json();
        setAllUsers(usersJson ?? []);
      }
    } catch (e) {
      console.error('Failed to load members/users', e);
    } finally {
      setIsLoadingMembers(false);
    }
  }, []);

  // Trigger load when modal opens
  useEffect(() => {
    if (projectDetailsOpened && selectedProject) {
      setProjectMembers(null);
      loadProjectDetail(selectedProject.id);
      loadMembersAndUsers(selectedProject.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectDetailsOpened, selectedProject?.id]);

  // Default quick task list when details are available
  useEffect(() => {
    if (
      projectDetailsOpened &&
      selectedProject?.lists?.length &&
      !newTaskListId
    ) {
      setNewTaskListId(selectedProject.lists[0].id);
    }
  }, [projectDetailsOpened, selectedProject?.lists, newTaskListId]);

  const handleAddMember = useCallback(async () => {
    if (!selectedProject?.id || !selectedUserToAdd) return;
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserToAdd, role: 'MEMBER' }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to add member');
      }
      const created = await res.json();
      const createdMember = created?.data ?? created;
      setProjectMembers((prev) =>
        prev ? [...prev, createdMember] : [createdMember]
      );
      setSelectedUserToAdd(null);
      notifications.show({
        title: 'Member added',
        message: 'User added to project',
        color: 'green',
      });
    } catch (e) {
      console.error(e);
      notifications.show({
        title: 'Error',
        message: (e as Error).message,
        color: 'red',
      });
    }
  }, [selectedProject?.id, selectedUserToAdd]);

  const handleAddTask = useCallback(async () => {
    if (!selectedProject?.id || !newTaskListId || !newTaskTitle.trim()) return;
    try {
      setIsAddingTask(true);
      const res = await fetch(`/api/lists/${newTaskListId}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to add task');
      }
      const created = await res.json().catch(() => null);
      setNewTaskTitle('');
      notifications.show({
        title: 'Task created',
        message: 'Task has been added',
        color: 'green',
      });
      // Refresh projects list to reflect counts
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      // Optimistically reflect in modal if lists loaded
      if (created) {
        setSelectedProject((prev: any) => {
          if (!prev?.lists) return prev;
          return {
            ...prev,
            lists: prev.lists.map((l: any) =>
              l.id === newTaskListId
                ? {
                    ...l,
                    cards: [
                      {
                        id: created?.id || `temp-${Date.now()}`,
                        title: created?.title || newTaskTitle.trim(),
                        description: created?.description || null,
                        position: created?.position || 0,
                        archived: false,
                        cover: null,
                        dueDate: null,
                        createdAt:
                          created?.createdAt || new Date().toISOString(),
                        updatedAt:
                          created?.updatedAt || new Date().toISOString(),
                      },
                      ...(l.cards || []),
                    ],
                  }
                : l
            ),
          };
        });
      }
    } catch (e) {
      console.error(e);
      notifications.show({
        title: 'Error',
        message: (e as Error).message,
        color: 'red',
      });
    } finally {
      setIsAddingTask(false);
    }
  }, [selectedProject?.id, newTaskListId, newTaskTitle, queryClient]);

  const useDndKit = useMemo(() => {
    if (typeof window === 'undefined') {
      return process.env.NEXT_PUBLIC_USE_DND_KIT === 'true';
    }
    const forced = new URLSearchParams(window.location.search).get('dnd');
    if (forced === 'kit') return true;
    if (forced === 'pangea') return false;
    return process.env.NEXT_PUBLIC_USE_DND_KIT === 'true';
  }, []);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.info(
      '[Projects Board] DnD library:',
      useDndKit ? 'dnd-kit' : 'hello-pangea/dnd'
    );
  }, [useDndKit]);

  const content = (
    <AppLayout>
      <Box p="xl" style={{ overflow: useDndKit ? 'visible' : 'hidden' }}>
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
        ) : useDndKit ? (
          <BoardDndKit
            statuses={projectStatuses}
            grouped={groupedProjects}
            onArchiveProject={handleArchiveProject}
            onDeleteProject={handleDeleteProject}
            onAddProject={handleAddProject}
            onEditColumn={handleEditColumn}
            onDeleteColumn={handleDeleteColumn}
            onAddColumn={handleAddColumn}
            onMove={({
              projectId,
              fromStatus,
              toStatus,
              fromIndex,
              toIndex,
            }) => {
              const key = `${projectId}:${fromStatus}->${toStatus}:${fromIndex}->${toIndex}`;
              if (lastPersistRef.current === key) return;
              lastPersistRef.current = key;
              const statusOrder = computeNewStatusOrder({
                draggableId: projectId,
                sourceDroppableId: fromStatus,
                destDroppableId: toStatus,
                sourceIndex: fromIndex,
                destIndex: toIndex,
              });
              (updateProjectStatusMutation as any)
                .mutateAsync({
                  projectId,
                  status: toStatus,
                  sourceIndex: fromIndex,
                  destIndex: toIndex,
                  sourceDroppableId: fromStatus,
                  destDroppableId: toStatus,
                  statusOrder,
                })
                .catch(() => {})
                .finally(() => {
                  // small debounce window for duplicate drops
                  setTimeout(() => {
                    if (lastPersistRef.current === key)
                      lastPersistRef.current = null;
                  }, 150);
                });
            }}
            onClickProject={handleViewProject}
          />
        ) : (
          /* Main Kanban Board */
          <DragDropContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragUpdate={handleDragUpdate}
          >
            <div
              className={`${styles.boardContainer} ${projectDetailsOpened ? styles.boardDisabled : ''}`}
              data-e2e-board
              style={{ overflow: 'visible' }}
            >
              {projectStatuses.map((status) => (
                <ProjectColumn
                  key={status.id}
                  status={status}
                  projects={groupedProjects[status.id] || []}
                  onViewProject={handleViewProject}
                  onArchiveProject={handleArchiveProject}
                  onDeleteProject={handleDeleteProject}
                  onAddProject={handleAddProject}
                  onEditColumn={handleEditColumn}
                  onDeleteColumn={handleDeleteColumn}
                  canEdit={true}
                  showDebug={true}
                  onDebugMove={(p, idx, target) => {
                    try {
                      // eslint-disable-next-line no-console
                      console.info(
                        '[Projects DnD] Debug move click',
                        p.id,
                        '->',
                        target
                      );
                      const sourceId = (p.status || 'planning')
                        .toLowerCase()
                        .replace(/[ _]+/g, '-');
                      const destId = target
                        .toLowerCase()
                        .replace(/[ _]+/g, '-');
                      const destIndex = 0;
                      const statusOrder = computeNewStatusOrder({
                        draggableId: p.id,
                        sourceDroppableId: sourceId,
                        destDroppableId: destId,
                        sourceIndex: idx,
                        destIndex,
                      });
                      (updateProjectStatusMutation as any)
                        .mutateAsync({
                          projectId: p.id,
                          status: destId,
                          destIndex,
                          statusOrder,
                        })
                        .catch(() => {});
                    } catch (e) {
                      // eslint-disable-next-line no-console
                      console.error('[Projects DnD] Debug move error', e);
                    }
                  }}
                />
              ))}

              {/* Add Column Button */}
              <Paper
                withBorder
                radius="md"
                style={{
                  minWidth: '320px',
                  width: '320px',
                  minHeight: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'var(--mantine-color-gray-0)',
                  borderStyle: 'dashed',
                }}
                p="md"
                onClick={handleAddColumn}
              >
                <Stack align="center" gap="sm">
                  <IconPlus size={32} color="var(--mantine-color-gray-6)" />
                  <Text size="sm" c="dimmed" fw={500}>
                    Add another list
                  </Text>
                </Stack>
              </Paper>
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
        <Stack gap="md">
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
        zIndex={3000}
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
                {projectStatuses.find((s) => s.id === selectedProject.status)
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
                  <IconCalendar size={16} color="var(--mantine-color-gray-6)" />
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
                  <IconCalendar size={16} color="var(--mantine-color-gray-6)" />
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
              <Stack gap="xs">
                <Group gap="xs" wrap="wrap">
                  {projectMembers?.map((m) => (
                    <Group key={m.user.id || m.id} gap={6} align="center">
                      <Avatar size="sm" radius="xl" color="blue">
                        {(m.user.name || m.user.email || '?')
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')}
                      </Avatar>
                      <Text size="xs">{m.user.name || m.user.email}</Text>
                      <Select
                        size="xs"
                        data={[
                          { value: 'VIEWER', label: 'Viewer' },
                          { value: 'MEMBER', label: 'Member' },
                          { value: 'ADMIN', label: 'Admin' },
                        ]}
                        value={m.role}
                        onChange={(val) =>
                          val && handleUpdateMemberRole(m.user.id, val as any)
                        }
                        w={120}
                      />
                      {m.role !== 'OWNER' && (
                        <Button
                          size="xs"
                          variant="subtle"
                          color="red"
                          onClick={() => handleRemoveMember(m.user.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </Group>
                  ))}
                </Group>
                <Group gap="xs">
                  <Select
                    placeholder={
                      isLoadingMembers ? 'Loading users...' : 'Add member...'
                    }
                    data={allUsers
                      .filter(
                        (u) =>
                          !projectMembers?.some((m) => m.user.id === u.id) &&
                          u.id !== selectedProject.ownerId
                      )
                      .map((u) => ({
                        value: u.id,
                        label: u.name || u.email,
                      }))}
                    searchable
                    value={selectedUserToAdd}
                    onChange={setSelectedUserToAdd}
                    nothingFoundMessage={
                      isLoadingMembers ? 'Loading...' : 'No users'
                    }
                    w={260}
                  />
                  <Button
                    size="xs"
                    onClick={handleAddMember}
                    disabled={!selectedUserToAdd}
                  >
                    Add
                  </Button>
                </Group>
              </Stack>
            </div>

            <Divider />

            {/* Quick add task into a list */}
            <div>
              <Text fw={500} mb="xs">
                Quick Task
              </Text>
              <Group align="flex-end" gap="xs" wrap="wrap">
                <TextInput
                  placeholder="Task title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  w={280}
                />
                <Select
                  placeholder="Select list"
                  data={(selectedProject?.lists || []).map((l: any) => ({
                    value: l.id,
                    label: l.title,
                  }))}
                  value={newTaskListId}
                  onChange={setNewTaskListId}
                  w={220}
                />
                <Button
                  size="sm"
                  loading={isAddingTask}
                  onClick={handleAddTask}
                  disabled={!newTaskTitle.trim() || !newTaskListId}
                >
                  Add Task
                </Button>
              </Group>
            </div>

            <Group justify="flex-end" mt="md">
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

      {/* Add Column Modal */}
      <Modal
        opened={addColumnModalOpened}
        onClose={() => setAddColumnModalOpened(false)}
        title="Add New Column"
        centered
      >
        <AddColumnForm
          onAdd={addNewColumn}
          onCancel={() => setAddColumnModalOpened(false)}
        />
      </Modal>

      {/* Delete Column Confirmation Modal */}
      <Modal
        opened={deleteColumnModalOpened}
        onClose={() => setDeleteColumnModalOpened(false)}
        title="Delete Column"
        centered
      >
        <Stack gap="md">
          <Alert color="red" variant="light">
            <Text fw={500} mb="xs">
              Are you sure you want to delete this column?
            </Text>
            <Text size="sm">
              All projects in this column will be moved to the first available
              column. This action cannot be undone.
            </Text>
          </Alert>
          <Group justify="flex-end">
            <Button
              variant="subtle"
              onClick={() => setDeleteColumnModalOpened(false)}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={confirmDeleteColumn}
              disabled={projectStatuses.length <= 1}
            >
              Delete Column
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AppLayout>
  );

  return isE2ETest ? content : <AuthGuard>{content}</AuthGuard>;
}

// Add Column Form Component
interface AddColumnFormProps {
  onAdd: (title: string, color: string) => void;
  onCancel: () => void;
}

function AddColumnForm({ onAdd, onCancel }: AddColumnFormProps) {
  const form = useForm({
    initialValues: {
      title: '',
      color: '#3b82f6',
    },
    validate: {
      title: (value) =>
        value.trim().length < 1 ? 'Column title is required' : null,
    },
  });

  const handleSubmit = (values: { title: string; color: string }) => {
    onAdd(values.title, values.color);
    form.reset();
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Column Title"
          placeholder="Enter column title..."
          required
          {...form.getInputProps('title')}
        />
        <ColorInput
          label="Column Color"
          placeholder="Choose a color"
          {...form.getInputProps('color')}
          swatches={[
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6',
            '#06b6d4',
            '#84cc16',
            '#f97316',
            '#ec4899',
            '#6b7280',
          ]}
        />
        <Group justify="flex-end">
          <Button variant="subtle" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Add Column</Button>
        </Group>
      </Stack>
    </form>
  );
}
