'use client';

import { useState, useEffect } from 'react';
import { BoardView } from '@/features/projects/components/BoardView';
import { UserPresence } from '@/features/projects/components/UserPresence';
import { ConflictResolutionModal } from '@/features/projects/components/ConflictResolutionModal';
import { useRealtimeBoard } from '@/hooks/useRealtimeBoard';
import { ConflictResolver } from '@/lib/conflict-resolution';
import { useBoardData } from '@/features/projects/hooks/useProjectData';
import { Box, Title, LoadingOverlay, Alert, Group, Paper } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useSession } from 'next-auth/react';

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string>('');

  useEffect(() => {
    params.then(({ id }) => setId(id));
  }, [params]);
  const { data: session } = useSession();
  const { data: project, isLoading, isError } = useBoardData(id);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [currentConflict, setCurrentConflict] = useState(null);

  // Initialize real-time collaboration
  const {
    isConnected,
    users,
    connectionError,
    updatePresence,
    emitCardMove,
    emitCardUpdate,
    emitListUpdate,
    emitChecklistUpdate,
  } = useRealtimeBoard({
    projectId: id,
    onCardMoved: (event) => {
      // Handle real-time card movements from other users
      console.log('Card moved by another user:', event);
    },
    onCardUpdated: (event) => {
      // Handle real-time card updates from other users
      console.log('Card updated by another user:', event);
    },
    onListUpdated: (event) => {
      // Handle real-time list updates from other users
      console.log('List updated by another user:', event);
    },
    onChecklistUpdated: (event) => {
      // Handle real-time checklist updates from other users
      console.log('Checklist updated by another user:', event);
    },
    onUserJoined: (user) => {
      console.log('User joined:', user);
    },
    onUserLeft: (user) => {
      console.log('User left:', user);
    },
    onUserPresence: (user) => {
      console.log('User presence updated:', user);
    },
  });

  // Handle conflict resolution
  const handleConflictResolved = (resolution: any) => {
    if (currentConflict) {
      ConflictResolver.resolveConflict(
        'card', // or 'list' or 'checklist'
        currentConflict.id,
        resolution
      );
      setCurrentConflict(null);
      setConflictModalOpen(false);
    }
  };

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
              {/* Project Header with Real-time Status */}
              <Group justify="space-between" mb="xl">
                <div>
                  <Title order={1} mb="xs">
                    {project?.title}
                  </Title>
                  {project?.description && (
                    <Title order={4} c="dimmed" fw={400}>
                      {project.description}
                    </Title>
                  )}
                </div>

                {/* Real-time Collaboration Status */}
                <Group gap="md">
                  {connectionError && (
                    <Alert color="red" variant="light" size="sm">
                      Connection Error: {connectionError}
                    </Alert>
                  )}
                  {!isConnected && !connectionError && (
                    <Alert color="yellow" variant="light" size="sm">
                      Connecting to real-time collaboration...
                    </Alert>
                  )}
                  {isConnected && (
                    <Alert color="green" variant="light" size="sm">
                      Real-time collaboration active
                    </Alert>
                  )}
                </Group>
              </Group>

              {/* User Presence Indicators */}
              {users.length > 0 && (
                <Paper p="sm" mb="md" withBorder>
                  <UserPresence
                    users={users}
                    currentUserId={session?.user?.id}
                    compact={true}
                  />
                </Paper>
              )}

              {/* Main Board Interface */}
              {id && (
                <BoardView
                  projectId={id}
                  projectData={project}
                  isLoading={isLoading}
                  onCardMove={emitCardMove}
                  onCardUpdate={emitCardUpdate}
                  onListUpdate={emitListUpdate}
                  onUserPresence={updatePresence}
                />
              )}

              {/* Conflict Resolution Modal */}
              <ConflictResolutionModal
                isOpen={conflictModalOpen}
                conflict={currentConflict}
                onResolve={handleConflictResolved}
                onClose={() => setConflictModalOpen(false)}
              />
            </>
          )}
        </Box>
      </AppLayout>
    </AuthGuard>
  );
}
