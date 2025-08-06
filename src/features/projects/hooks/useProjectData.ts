import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProject, updateTask } from '@/features/projects/api/projectApi';
import { projectKeys } from './queryKeys';
import type { TaskUpdatePayload } from '@/types/database';

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.list('all'),
    queryFn: () => fetch('/api/projects').then((r) => r.json()),
    staleTime: 30_000,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => fetchProject(id),
    staleTime: 30_000,
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    onMutate: async ({
      taskId,
      projectId,
      ...updates
    }: { taskId: string; projectId: string } & TaskUpdatePayload) => {
      await queryClient.cancelQueries({
        queryKey: projectKeys.detail(projectId),
      });

      const previous = queryClient.getQueryData(projectKeys.detail(projectId));

      queryClient.setQueryData(projectKeys.detail(projectId), (old: any) => ({
        ...old,
        columns: old.columns.map((col: any) => ({
          ...col,
          tasks: col.tasks.map((task: any) =>
            task.id === taskId ? { ...task, ...updates } : task
          ),
        })),
      }));

      return { previous, projectId };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          projectKeys.detail(context.projectId),
          context.previous
        );
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(variables.projectId),
      });
    },
  });
}
