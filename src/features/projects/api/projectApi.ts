import type { Project, Task, TaskUpdatePayload } from '@/types/database';

export async function fetchProject(id: string): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch project');
  }
  return res.json();
}

export async function updateTask({
  taskId,
  ...data
}: {
  taskId: string;
} & TaskUpdatePayload): Promise<Task> {
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Failed to update task');
  }
  return res.json();
}
