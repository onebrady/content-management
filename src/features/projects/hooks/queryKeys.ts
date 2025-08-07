export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: string) => [...projectKeys.lists(), { filters }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  boards: () => [...projectKeys.all, 'board'] as const,
  board: (projectId: string) => [...projectKeys.boards(), projectId] as const,
};
