'use client';

import { use } from 'react';
import ProjectBoard from '@/features/projects/components/ProjectBoard';
import { useProject } from '@/features/projects/hooks/useProjectData';
import { Box, Title, LoadingOverlay, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: project, isLoading, isError } = useProject(id);

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
              Project not found or you don't have access to this project.
            </Alert>
          </Box>
        </AppLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AppLayout>
        <Box p="xl">
          {isLoading ? (
            <LoadingOverlay visible />
          ) : (
            <>
              <Title order={1} mb="xl">
                {project?.title}
              </Title>
              {project && <ProjectBoard project={project} />}
            </>
          )}
        </Box>
      </AppLayout>
    </AuthGuard>
  );
}
