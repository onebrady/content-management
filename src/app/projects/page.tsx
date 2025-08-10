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
  Checkbox,
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
import BoardDndKit from '@/features/projects/components/BoardDndKit';
import { notifications } from '@mantine/notifications';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import ProjectCreateModal from '@/components/projects/ProjectCreateModal';
import { useForm } from '@mantine/form';
import { computeNextStatusOrder } from '@/lib/projects/order';
import TeamMembersSection from '@/features/projects/components/TeamMembersSection';
import QuickTaskSection from '@/features/projects/components/QuickTaskSection';

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

// Removed legacy hello-pangea/dnd components and columns

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
    process.env['NEXT_PUBLIC_E2E_TEST'] === 'true';
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
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [isSavingTaskId, setIsSavingTaskId] = useState<string | null>(null);
  const [isDeletingTaskId, setIsDeletingTaskId] = useState<string | null>(null);

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
      const projectsAll: any[] = ((response as any)?.data?.projects ||
        (response as any)?.projects ||
        []) as any[];
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
    [projectStatuses, (response as any)?.data?.projects]
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
        if (status && grouped[status]) {
          grouped[status].push(project);
        } else {
          // If project has unknown status, put in first available column
          const firstColumn = projectStatuses?.[0];
          const keys = Object.keys(grouped);
          const fallbackId: string | null =
            (firstColumn ? (firstColumn.id as string) : null) ??
            (keys.length > 0 ? (keys[0] as string) : null);
          if (fallbackId) {
            grouped[fallbackId]!.push(project);
          }
        }
      });

      return grouped;
    },
    [projectStatuses]
  );

  // Removed legacy drag handlers (hello-pangea/dnd)

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
  const projects =
    (response as any)?.data?.projects ?? (response as any)?.projects ?? [];

  // Memoize grouped projects for better performance
  const groupedProjects = useMemo(
    () => groupProjectsByStatus(projects),
    [projects]
  );

  // One-time diagnostic on mount: log ancestor scroll parents for first droppable
  useEffect(() => {
    if (process.env['NEXT_PUBLIC_E2E_TEST'] === 'true') return;
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
      let data = (detail?.data ?? detail) as any;
      // Fallback: if lists not present, hydrate from board endpoint
      if (
        !data?.lists ||
        !Array.isArray(data.lists) ||
        data.lists.length === 0
      ) {
        try {
          const boardRes = await fetch(`/api/projects/${projectId}/board`);
          if (boardRes.ok) {
            const boardJson = await boardRes.json().catch(() => ({}));
            const board = boardJson?.data ?? boardJson;
            if (board?.lists) {
              data = { ...data, lists: board.lists };
            }
          }
        } catch {}
      }
      setSelectedProject((prev: any) => ({ ...prev, ...data }));
      // Initialize quick task default list after lists load
      if (!newTaskListId && Array.isArray(data?.lists) && data.lists.length) {
        setNewTaskListId(data.lists[0].id);
      }
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
      const taskTitle = newTaskTitle.trim();
      const res = await fetch(`/api/lists/${newTaskListId}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: taskTitle }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to add task');
      }
      const createdRaw = await res.json().catch(() => null);
      const created = (createdRaw && (createdRaw.data ?? createdRaw)) || null;
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
                      ...(l.cards || []),
                      {
                        id: created?.id || `temp-${Date.now()}`,
                        title: created?.title || taskTitle,
                        description: created?.description || null,
                        position:
                          created?.position ??
                          (l.cards && l.cards.length
                            ? (l.cards[l.cards.length - 1].position ??
                              l.cards.length - 1)
                            : -1) + 1,
                        completed: created?.completed ?? false,
                        archived: false,
                        cover: null,
                        dueDate: null,
                        createdAt:
                          created?.createdAt || new Date().toISOString(),
                        updatedAt:
                          created?.updatedAt || new Date().toISOString(),
                      },
                    ],
                  }
                : l
            ),
          };
        });
      }
      // Rehydrate lists to ensure persistence is visible
      try {
        const boardRes = await fetch(
          `/api/projects/${selectedProject!.id}/board`
        );
        if (boardRes.ok) {
          const boardJson: any = await boardRes.json().catch(() => ({}) as any);
          const board = (boardJson && (boardJson.data ?? boardJson)) as any;
          if (board?.lists) {
            setSelectedProject((prev: any) => ({
              ...prev,
              lists: board.lists,
            }));
          }
        }
      } catch {}
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

  // Helpers to mutate tasks in local modal state
  const updateCardInState = useCallback(
    (cardId: string, updater: (c: any) => any) => {
      setSelectedProject((prev: any) => {
        if (!prev?.lists) return prev;
        return {
          ...prev,
          lists: prev.lists.map((l: any) => ({
            ...l,
            cards: (l.cards || []).map((c: any) =>
              c.id === cardId ? updater(c) : c
            ),
          })),
        };
      });
    },
    []
  );

  const removeCardFromState = useCallback((cardId: string) => {
    setSelectedProject((prev: any) => {
      if (!prev?.lists) return prev;
      return {
        ...prev,
        lists: prev.lists.map((l: any) => ({
          ...l,
          cards: (l.cards || []).filter((c: any) => c.id !== cardId),
        })),
      };
    });
  }, []);

  const handleToggleTaskCompleted = useCallback(
    async (cardId: string, nextCompleted: boolean) => {
      try {
        setIsSavingTaskId(cardId);
        updateCardInState(cardId, (c) => ({ ...c, completed: nextCompleted }));
        const res = await fetch(`/api/cards/${cardId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: nextCompleted }),
        });
        if (!res.ok) throw new Error('Failed to update task');
      } catch (e) {
        updateCardInState(cardId, (c) => ({ ...c, completed: !nextCompleted }));
        notifications.show({
          title: 'Error',
          message: (e as Error).message,
          color: 'red',
        });
      } finally {
        setIsSavingTaskId(null);
      }
    },
    [updateCardInState]
  );

  const handleStartEditTask = useCallback((cardId: string, title: string) => {
    setEditingTaskId(cardId);
    setEditingTaskTitle(title);
  }, []);

  const handleCancelEditTask = useCallback(() => {
    setEditingTaskId(null);
    setEditingTaskTitle('');
  }, []);

  const handleSaveTaskTitle = useCallback(async () => {
    if (!editingTaskId) return;
    const cardId = editingTaskId;
    const title = editingTaskTitle.trim();
    if (!title) return;
    try {
      setIsSavingTaskId(cardId);
      updateCardInState(cardId, (c) => ({ ...c, title }));
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error('Failed to rename task');
      setEditingTaskId(null);
      setEditingTaskTitle('');
    } catch (e) {
      notifications.show({
        title: 'Error',
        message: (e as Error).message,
        color: 'red',
      });
    } finally {
      setIsSavingTaskId(null);
    }
  }, [editingTaskId, editingTaskTitle, updateCardInState]);

  const handleDeleteTask = useCallback(
    async (cardId: string) => {
      try {
        setIsDeletingTaskId(cardId);
        removeCardFromState(cardId);
        const res = await fetch(`/api/cards/${cardId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete task');
        notifications.show({
          title: 'Task deleted',
          message: '',
          color: 'green',
        });
      } catch (e) {
        notifications.show({
          title: 'Error',
          message: (e as Error).message,
          color: 'red',
        });
        try {
          if (selectedProject?.id) {
            const boardRes = await fetch(
              `/api/projects/${selectedProject!.id}/board`
            );
            if (boardRes.ok) {
              const boardJson: any = await boardRes
                .json()
                .catch(() => ({}) as any);
              const board = (boardJson && (boardJson.data ?? boardJson)) as any;
              if (board?.lists) {
                setSelectedProject((prev: any) => ({
                  ...prev,
                  lists: board.lists,
                }));
              }
            }
          }
        } catch {}
      } finally {
        setIsDeletingTaskId(null);
      }
    },
    [removeCardFromState, selectedProject?.id]
  );

  // Single implementation: dnd-kit

  const content = (
    <AppLayout>
      <Box p="xl" style={{ overflow: 'visible' }}>
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
        ) : (
          <BoardDndKit
            statuses={projectStatuses}
            grouped={groupedProjects}
            onArchiveProject={handleArchiveProject}
            onDeleteProject={handleDeleteProject}
            onAddProject={handleAddProject}
            onEditColumn={handleEditColumn}
            onDeleteColumn={handleDeleteColumn}
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
              <Button
                size="xs"
                variant="light"
                leftSection={<IconEdit size={14} />}
                onClick={() => setIsEditingProject(true)}
              >
                Edit
              </Button>
            </Group>

            <TeamMembersSection
              projectId={selectedProject.id}
              projectOwnerId={selectedProject.ownerId}
              members={projectMembers || []}
              allUsers={allUsers}
              isLoading={isLoadingMembers}
              onAddMember={() => {
                if (!selectedUserToAdd) return;
                handleAddMember();
              }}
              onRemoveMember={handleRemoveMember}
            />

            <Divider />

            <QuickTaskSection
              projectId={selectedProject.id}
              lists={selectedProject?.lists || []}
              onReplaceLists={(lists) =>
                setSelectedProject((prev: any) => ({ ...prev, lists }))
              }
            />

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
