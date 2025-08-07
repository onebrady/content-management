import type { Project, ProjectCard } from '@/types/database';

export async function fetchProject(id: string): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch project');
  }
  const data = await res.json();
  return data.success ? data.data : data;
}

export async function fetchBoardData(projectId: string) {
  const res = await fetch(`/api/projects/${projectId}/board`);
  if (!res.ok) {
    throw new Error('Failed to fetch board data');
  }
  const data = await res.json();
  return data.success ? data.data : data;
}

export async function updateCard({
  cardId,
  ...data
}: {
  cardId: string;
} & Partial<ProjectCard>): Promise<ProjectCard> {
  const res = await fetch(`/api/cards/${cardId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Failed to update card');
  }
  const response = await res.json();
  return response.success ? response.data : response;
}

// Legacy function for backward compatibility
export async function updateTask(data: any) {
  console.warn('updateTask is deprecated. Use updateCard instead.');
  return updateCard(data);
}
