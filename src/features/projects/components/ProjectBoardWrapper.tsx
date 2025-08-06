'use client';

import { useProject } from '../hooks/useProjectData';
import ProjectBoard from './ProjectBoard';
import { Skeleton } from '@mantine/core';

export default function ProjectBoardWrapper({
  projectId,
}: {
  projectId: string;
}) {
  const { data: project, isLoading } = useProject(projectId);

  if (isLoading || !project) {
    return (
      <div>
        <Skeleton height={30} mb="sm" width={200} />
        <Skeleton height={200} />
      </div>
    );
  }

  return <ProjectBoard project={project} />;
}
