'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Title, Text, Button, Group } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import ProjectCreateModal from '@/components/projects/ProjectCreateModal';

export default function CreateProjectPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const router = useRouter();

  const handleClose = () => {
    setIsModalOpen(false);
    router.push('/projects');
  };

  const handleProjectCreated = (project: any) => {
    setIsModalOpen(false);
    router.push(`/projects/${project.id}`);
  };

  return (
    <AuthGuard>
      <AppLayout>
        <Box p="xl">
          <Group mb="xl">
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => router.push('/projects')}
            >
              Back to Projects
            </Button>
          </Group>

          <div>
            <Title order={1} mb="xs">
              Create New Project
            </Title>
            <Text size="lg" c="dimmed" mb="xl">
              Set up a new project to organize your team's work and track
              progress
            </Text>
          </div>

          <ProjectCreateModal
            opened={isModalOpen}
            onClose={handleClose}
            onProjectCreated={handleProjectCreated}
          />
        </Box>
      </AppLayout>
    </AuthGuard>
  );
}
