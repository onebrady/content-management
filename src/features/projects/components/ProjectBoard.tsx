'use client';

import React, { useState, useCallback } from 'react';
import {
  DndContext,
  closestCorners,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  CollisionDetection,
  closestCenter,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Stack,
  Paper,
  Title,
  Group,
  Badge,
  Box,
  useComputedColorScheme,
  Grid,
  Button,
  ActionIcon,
  Tooltip,
  Flex,
  Modal,
} from '@mantine/core';
import { IconPlus, IconSettings } from '@tabler/icons-react';
import { useUpdateTask } from '../hooks/useProjectData';
import TaskCard from './TaskCard';
import TaskCreateModal from '@/components/tasks/TaskCreateModal';
import ProjectSettings from '@/components/projects/ProjectSettings';
import {
  ProjectErrorBoundary,
  ColumnErrorBoundary,
} from '@/components/error/ProjectErrorBoundary';
import { OptimisticUpdateIndicator } from '@/components/loading/ProjectLoadingStates';
import type { Project, Task } from '@/types/database';

interface ProjectBoardProps {
  project: Project;
}

function ProjectBoardContent({ project }: ProjectBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Set<string>>(
    new Set()
  );
  const [taskCreateModalOpened, setTaskCreateModalOpened] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [settingsModalOpened, setSettingsModalOpened] = useState(false);
  const updateTask = useUpdateTask();
  const colorScheme = useComputedColorScheme();

  // Enhanced sensors for better drag experience
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevent accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Enhanced collision detection for better drop zones
  const customCollisionDetection: CollisionDetection = useCallback((args) => {
    const { droppableContainers, active } = args;

    // First check for column containers (for empty columns)
    const columnCollisions = droppableContainers.filter((container) =>
      container.id.toString().startsWith('column-')
    );

    if (columnCollisions.length > 0) {
      return closestCenter({
        ...args,
        droppableContainers: columnCollisions,
      });
    }

    // Then check for task containers
    return closestCorners(args);
  }, []);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const task = findTaskById(active.id as string);
      setDraggedTask(task);

      // Announce for screen readers
      announceForScreenReaders(`Started dragging task ${task?.title}`);
    },
    [project]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setDraggedTask(null);

      if (!over || active.id === over.id) {
        announceForScreenReaders('Drag cancelled');
        return;
      }

      const taskId = active.id as string;
      const task = findTaskById(taskId);

      if (!task) return;

      // Determine target column and position
      let targetColumnId: string;
      let targetPosition: number;

      if (over.id.toString().startsWith('column-')) {
        // Dropped on empty column
        targetColumnId = over.id.toString().replace('column-', '');
        targetPosition = 0;
      } else {
        // Dropped on another task
        const targetTask = findTaskById(over.id as string);
        if (!targetTask) return;

        targetColumnId = targetTask.columnId;
        targetPosition = targetTask.position;
      }

      // Skip update if task is already in the same position
      if (
        task.columnId === targetColumnId &&
        task.position === targetPosition
      ) {
        return;
      }

      // Add to optimistic updates
      setOptimisticUpdates((prev) => new Set([...prev, taskId]));

      // Announce the action
      const targetColumn = project.columns.find(
        (col) => col.id === targetColumnId
      );
      announceForScreenReaders(
        `Moved task ${task.title} to ${targetColumn?.title}`
      );

      updateTask.mutate(
        {
          taskId,
          projectId: project.id,
          columnId: targetColumnId,
          position: targetPosition,
        },
        {
          onSettled: () => {
            // Remove from optimistic updates
            setOptimisticUpdates((prev) => {
              const newSet = new Set(prev);
              newSet.delete(taskId);
              return newSet;
            });
          },
          onError: (error) => {
            console.error('Failed to update task position:', error);
            announceForScreenReaders(`Failed to move task: ${error.message}`);
          },
        }
      );
    },
    [project, updateTask]
  );

  const handleDragCancel = useCallback(() => {
    setDraggedTask(null);
    announceForScreenReaders('Drag cancelled');
  }, []);

  const findTaskById = useCallback(
    (taskId: string): Task | null => {
      for (const column of project.columns) {
        const task = column.tasks.find((t) => t.id === taskId);
        if (task) return task;
      }
      return null;
    },
    [project]
  );

  const announceForScreenReaders = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  const handleAddTask = (columnId: string) => {
    setSelectedColumnId(columnId);
    setTaskCreateModalOpened(true);
  };

  const handleTaskCreated = () => {
    setTaskCreateModalOpened(false);
    setSelectedColumnId(null);
  };

  return (
    <>
      {/* Project Header */}
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2} mb="xs">
            {project.title}
          </Title>
          {project.description && (
            <Text size="sm" c="dimmed">
              {project.description}
            </Text>
          )}
        </div>
        <Button
          variant="light"
          leftSection={<IconSettings size={16} />}
          onClick={() => setSettingsModalOpened(true)}
        >
          Project Settings
        </Button>
      </Group>

      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <Box style={{ position: 'relative' }}>
          <Flex
            gap="md"
            style={{
              overflowX: 'auto',
              paddingBottom: '1rem',
              minHeight: '500px',
            }}
          >
            {project.columns.map((column) => (
              <ColumnErrorBoundary key={column.id}>
                <Paper
                  key={column.id}
                  p="md"
                  w={300}
                  style={{
                    minHeight: 400,
                    position: 'relative',
                    backgroundColor:
                      colorScheme === 'dark'
                        ? 'var(--mantine-color-dark-6)'
                        : 'white',
                  }}
                  withBorder
                  radius="md"
                >
                  <Group justify="space-between" mb="md">
                    <Title order={5} c={`${column.color}.6`}>
                      {column.title}
                    </Title>
                    <Badge size="sm" variant="light" color={column.color}>
                      {column.tasks.length}
                    </Badge>
                  </Group>

                  {/* Add Task Button */}
                  <Button
                    variant="light"
                    fullWidth
                    leftSection={<IconPlus size={16} />}
                    onClick={() => handleAddTask(column.id)}
                    mb="md"
                    size="sm"
                  >
                    Add Task
                  </Button>

                  {/* Drop zone for empty columns */}
                  <div
                    id={`column-${column.id}`}
                    style={{ minHeight: '20px', width: '100%' }}
                  />

                  <SortableContext
                    items={column.tasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <Stack spacing="xs">
                      {column.tasks.map((task) => (
                        <Box key={task.id} style={{ position: 'relative' }}>
                          <TaskCard
                            task={task}
                            isDragging={draggedTask?.id === task.id}
                          />
                          {optimisticUpdates.has(task.id) && (
                            <OptimisticUpdateIndicator
                              isUpdating={true}
                              operation="moving"
                            />
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </SortableContext>
                </Paper>
              </ColumnErrorBoundary>
            ))}
          </Flex>

          {/* Drag overlay for smooth dragging experience */}
          <DragOverlay>
            {draggedTask && (
              <div
                style={{
                  transform: 'rotate(5deg)',
                  opacity: 0.9,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                }}
              >
                <TaskCard
                  task={draggedTask}
                  isDragging={true}
                  style={{
                    cursor: 'grabbing',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            )}
          </DragOverlay>
        </Box>
      </DndContext>

      {/* Task Creation Modal */}
      {selectedColumnId && (
        <TaskCreateModal
          opened={taskCreateModalOpened}
          onClose={() => setTaskCreateModalOpened(false)}
          project={project}
          columnId={selectedColumnId}
          onTaskCreated={handleTaskCreated}
        />
      )}

      {/* Project Settings Modal */}
      <Modal
        opened={settingsModalOpened}
        onClose={() => setSettingsModalOpened(false)}
        title="Project Settings"
        size="xl"
        centered
      >
        <ProjectSettings project={project} />
      </Modal>
    </>
  );
}

export default function ProjectBoard({ project }: ProjectBoardProps) {
  return (
    <ProjectErrorBoundary>
      <ProjectBoardContent project={project} />
    </ProjectErrorBoundary>
  );
}
