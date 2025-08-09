export interface ProjectLite {
  id: string;
  statusOrder: number | null | undefined;
}

/**
 * Compute the next statusOrder for inserting at destIndex within an ordered list.
 * Assumes projects are pre-sorted by statusOrder ascending for the target status.
 */
export function computeNextStatusOrder(
  projectsInTarget: ProjectLite[],
  destIndex: number
): number {
  const safeIndex = Math.max(0, Math.min(destIndex, projectsInTarget.length));
  const prev = projectsInTarget[safeIndex - 1];
  const next = projectsInTarget[safeIndex];

  const prevOrder =
    typeof prev?.statusOrder === 'number' ? (prev.statusOrder as number) : null;
  const nextOrder =
    typeof next?.statusOrder === 'number' ? (next.statusOrder as number) : null;

  if (prevOrder != null && nextOrder != null) {
    const gap = nextOrder - prevOrder;
    if (gap > 1) return prevOrder + Math.floor(gap / 2);
    return prevOrder + 1;
  }
  if (prevOrder != null) return prevOrder + 1000;
  if (nextOrder != null) return nextOrder - 1000;
  return 0;
}
