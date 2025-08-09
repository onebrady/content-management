import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchProject,
  fetchBoardData,
  updateCard,
} from '@/features/projects/api/projectApi';
import { projectKeys } from './queryKeys';
import type { ProjectCard } from '@/types/database';

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.list('all'),
    queryFn: async () => {
      // Fetch enough records so cross-column moves don't page the moved item out
      const r = await fetch('/api/projects?limit=1000&page=1');
      const json = await r.json().catch(() => ({}));
      if (!r.ok || (json && json.success === false)) {
        const message =
          json?.error || json?.message || 'Failed to load projects';
        throw new Error(message);
      }
      return json;
    },
    // Reduce refetch storms during drag operations
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 0,
    keepPreviousData: true,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => fetchProject(id),
    staleTime: 30_000,
    enabled: !!id, // Only run query if id is provided
  });
}

export function useBoardData(projectId: string) {
  return useQuery({
    queryKey: projectKeys.board(projectId),
    queryFn: () => fetchBoardData(projectId),
    staleTime: 30_000,
    enabled: !!projectId,
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCard,
    onMutate: async ({
      cardId,
      projectId,
      ...updates
    }: { cardId: string; projectId: string } & Partial<ProjectCard>) => {
      await queryClient.cancelQueries({
        queryKey: projectKeys.board(projectId),
      });

      const previous = queryClient.getQueryData(projectKeys.board(projectId));

      queryClient.setQueryData(projectKeys.board(projectId), (old: any) => ({
        ...old,
        lists: old.lists.map((list: any) => ({
          ...list,
          cards: list.cards.map((card: any) =>
            card.id === cardId ? { ...card, ...updates } : card
          ),
        })),
      }));

      return { previous, projectId };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          projectKeys.board(context.projectId),
          context.previous
        );
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.board(variables.projectId),
      });
    },
  });
}

// Legacy hook for backward compatibility
export function useUpdateTask() {
  console.warn('useUpdateTask is deprecated. Use useUpdateCard instead.');
  return useUpdateCard();
}
