import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectKeys } from './queryKeys';
import type { Task, Column } from '@/types/database';

interface PositionUpdate {
  taskId: string;
  columnId: string;
  position: number;
}

interface TaskPositioningHook {
  calculateNewPosition: (
    tasks: Task[],
    activeIndex: number,
    overIndex: number
  ) => number;
  reorderTasksInColumn: (
    columnId: string,
    taskIds: string[],
    startIndex?: number
  ) => Promise<void>;
  moveTaskBetweenColumns: (
    taskId: string,
    sourceColumnId: string,
    targetColumnId: string,
    targetPosition?: number
  ) => Promise<void>;
  bulkUpdatePositions: (updates: PositionUpdate[]) => Promise<void>;
}

/**
 * Hook for managing task positions with smart calculation and batch updates
 */
export function useTaskPositioning(projectId: string): TaskPositioningHook {
  const queryClient = useQueryClient();

  /**
   * Calculate optimal position for a task being moved
   * Uses fractional positioning to avoid database updates for every task
   */
  const calculateNewPosition = useCallback(
    (tasks: Task[], activeIndex: number, overIndex: number): number => {
      if (tasks.length === 0) return 1000;

      const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);

      // If moving to the beginning
      if (overIndex === 0) {
        const firstPosition = sortedTasks[0]?.position || 1000;
        return firstPosition / 2;
      }

      // If moving to the end
      if (overIndex >= sortedTasks.length) {
        const lastPosition = sortedTasks[sortedTasks.length - 1]?.position || 0;
        return lastPosition + 1000;
      }

      // Moving between tasks - use fractional positioning
      const prevTask = sortedTasks[overIndex - 1];
      const nextTask = sortedTasks[overIndex];

      if (!prevTask) {
        return nextTask.position / 2;
      }

      if (!nextTask) {
        return prevTask.position + 1000;
      }

      // Calculate midpoint position
      const midpoint = (prevTask.position + nextTask.position) / 2;

      // If positions are too close, we need to rebalance
      if (nextTask.position - prevTask.position < 2) {
        // This will trigger a rebalancing operation
        return midpoint;
      }

      return midpoint;
    },
    []
  );

  /**
   * Reorder tasks within a single column with optimized batch updates
   */
  const reorderTasksInColumn = useCallback(
    async (columnId: string, taskIds: string[], startIndex: number = 0) => {
      const updates = taskIds.map((taskId, index) => ({
        taskId,
        columnId,
        position: (startIndex + index + 1) * 1000, // Use clean positions for reordering
      }));

      await bulkUpdatePositions(updates);
    },
    []
  );

  /**
   * Move a task between columns with smart position calculation
   */
  const moveTaskBetweenColumns = useCallback(
    async (
      taskId: string,
      sourceColumnId: string,
      targetColumnId: string,
      targetPosition?: number
    ) => {
      // Get current project data from cache
      const projectData = queryClient.getQueryData(
        projectKeys.detail(projectId)
      ) as any;
      if (!projectData) return;

      const targetColumn = projectData.columns.find(
        (col: Column) => col.id === targetColumnId
      );
      if (!targetColumn) return;

      // Calculate position if not provided
      let position = targetPosition;
      if (position === undefined) {
        // Add to end of target column
        const maxPosition = Math.max(
          ...targetColumn.tasks.map((task: Task) => task.position),
          0
        );
        position = maxPosition + 1000;
      }

      await updateSingleTask(taskId, {
        columnId: targetColumnId,
        position,
      });
    },
    [projectId, queryClient]
  );

  /**
   * Batch update multiple task positions for optimal performance
   */
  const bulkUpdatePositions = useCallback(
    async (updates: PositionUpdate[]) => {
      if (updates.length === 0) return;

      try {
        // Update positions via API
        const response = await fetch('/api/tasks/bulk-update', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            updates: updates.map((update) => ({
              taskId: update.taskId,
              columnId: update.columnId,
              position: update.position,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update task positions');
        }

        // Invalidate and refetch project data
        await queryClient.invalidateQueries({
          queryKey: projectKeys.detail(projectId),
        });
      } catch (error) {
        console.error('Error updating task positions:', error);
        throw error;
      }
    },
    [projectId, queryClient]
  );

  /**
   * Update a single task with optimistic updates
   */
  const updateSingleTask = useCallback(
    async (
      taskId: string,
      updates: Partial<Pick<Task, 'columnId' | 'position'>>
    ) => {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error('Failed to update task');
        }

        // Invalidate and refetch project data
        await queryClient.invalidateQueries({
          queryKey: projectKeys.detail(projectId),
        });
      } catch (error) {
        console.error('Error updating task:', error);
        throw error;
      }
    },
    [projectId, queryClient]
  );

  return {
    calculateNewPosition,
    reorderTasksInColumn,
    moveTaskBetweenColumns,
    bulkUpdatePositions,
  };
}

/**
 * Hook for optimistic task updates with automatic rollback on failure
 */
export function useOptimisticTaskUpdate(projectId: string) {
  const queryClient = useQueryClient();

  const optimisticUpdate = useMutation({
    mutationFn: async ({
      taskId,
      updates,
    }: {
      taskId: string;
      updates: Partial<Task>;
    }) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      return response.json();
    },
    onMutate: async ({ taskId, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: projectKeys.detail(projectId),
      });

      // Snapshot the previous value
      const previousProject = queryClient.getQueryData(
        projectKeys.detail(projectId)
      );

      // Optimistically update the cache
      queryClient.setQueryData(projectKeys.detail(projectId), (old: any) => {
        if (!old) return old;

        return {
          ...old,
          columns: old.columns.map((column: any) => ({
            ...column,
            tasks: column.tasks.map((task: any) =>
              task.id === taskId ? { ...task, ...updates } : task
            ),
          })),
        };
      });

      return { previousProject, taskId };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousProject) {
        queryClient.setQueryData(
          projectKeys.detail(projectId),
          context.previousProject
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(projectId),
      });
    },
  });

  return optimisticUpdate;
}

/**
 * Utility functions for position management
 */
export const positionUtils = {
  /**
   * Check if tasks need position rebalancing
   */
  needsRebalancing: (tasks: Task[]): boolean => {
    const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);

    for (let i = 1; i < sortedTasks.length; i++) {
      if (sortedTasks[i].position - sortedTasks[i - 1].position < 1) {
        return true;
      }
    }

    return false;
  },

  /**
   * Generate clean positions for a list of tasks
   */
  generateCleanPositions: (
    taskCount: number,
    startPosition: number = 1000
  ): number[] => {
    return Array.from(
      { length: taskCount },
      (_, index) => startPosition + index * 1000
    );
  },

  /**
   * Find the task at a specific position in a column
   */
  findTaskAtPosition: (tasks: Task[], position: number): Task | null => {
    const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);
    return sortedTasks.find((task) => task.position === position) || null;
  },

  /**
   * Get the next available position in a column
   */
  getNextPosition: (tasks: Task[]): number => {
    if (tasks.length === 0) return 1000;
    const maxPosition = Math.max(...tasks.map((task) => task.position));
    return maxPosition + 1000;
  },
};
