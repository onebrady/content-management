'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Text,
  List,
  Button,
  Badge,
  Tooltip,
  Loader,
  Alert,
  Modal,
  Menu,
  Group,
  Stack,
  Paper,
  Divider,
} from '@mantine/core';
import {
  IconDotsVertical,
  IconGitCompare,
  IconHistory,
  IconArrowBackUp,
} from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { CONTENT_PERMISSIONS } from '@/lib/permissions';

interface Version {
  id: string;
  versionNumber: number;
  title: string;
  createdAt: string;
  changeDescription: string | null;
  createdBy: {
    id: string;
    name: string;
  };
}

interface VersionHistoryProps {
  contentId: string;
  currentVersion: number;
  onVersionRestore?: (versionNumber: number) => Promise<void>;
  onVersionCompare?: (version1: number, version2: number) => void;
}

export function VersionHistory({
  contentId,
  currentVersion,
  onVersionRestore,
  onVersionCompare,
}: VersionHistoryProps) {
  const { user } = useAuth();
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<number | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersions, setCompareVersions] = useState<number[]>([]);

  // Fetch versions
  useEffect(() => {
    const fetchVersions = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/content/${contentId}/versions`);

        if (!response.ok) {
          throw new Error('Failed to fetch versions');
        }

        const data = await response.json();
        setVersions(data.versions);
      } catch (err) {
        console.error('Error fetching versions:', err);
        setError('Failed to load version history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (contentId) {
      fetchVersions();
    }
  }, [contentId]);

  // Check if user can restore versions
  const canRestoreVersion =
    user && CONTENT_PERMISSIONS.canRestoreVersion(user.role);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Handle version restore
  const handleRestoreClick = (versionNumber: number) => {
    setVersionToRestore(versionNumber);
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (versionToRestore !== null && onVersionRestore) {
      try {
        await onVersionRestore(versionToRestore);
        setRestoreDialogOpen(false);
        setVersionToRestore(null);
      } catch (err) {
        console.error('Error restoring version:', err);
        setError('Failed to restore version. Please try again.');
      }
    }
  };

  // Handle compare mode
  const handleCompareClick = () => {
    setCompareMode(true);
  };

  const handleVersionSelect = (versionNumber: number) => {
    if (compareMode) {
      if (compareVersions.includes(versionNumber)) {
        // Remove if already selected
        setCompareVersions(compareVersions.filter((v) => v !== versionNumber));
      } else if (compareVersions.length < 2) {
        // Add if less than 2 versions selected
        setCompareVersions([...compareVersions, versionNumber]);
      }
    }
  };

  const handleCompare = () => {
    if (compareVersions.length === 2 && onVersionCompare) {
      onVersionCompare(compareVersions[0], compareVersions[1]);
      setCompareMode(false);
      setCompareVersions([]);
    }
  };

  const handleCancelCompare = () => {
    setCompareMode(false);
    setCompareVersions([]);
  };

  return (
    <Box>
      <Group justify="space-between" align="center" mb="md">
        <Group gap="xs">
          <IconHistory size={20} />
          <Text size="lg" fw={600}>
            Version History
          </Text>
        </Group>

        {compareMode ? (
          <Group gap="xs">
            <Button
              variant="outline"
              onClick={handleCompare}
              disabled={compareVersions.length !== 2}
            >
              Compare ({compareVersions.length}/2)
            </Button>
            <Button variant="subtle" onClick={handleCancelCompare}>
              Cancel
            </Button>
          </Group>
        ) : (
          <Button
            variant="outline"
            leftSection={<IconGitCompare size={16} />}
            onClick={() => setCompareMode(true)}
            disabled={versions.length < 2}
          >
            Compare Versions
          </Button>
        )}
      </Group>

      {/* Error message */}
      {error && (
        <Alert color="red" title="Error" mb="md">
          {error}
        </Alert>
      )}

      {/* Version list */}
      {loading ? (
        <Box ta="center" py="xl">
          <Loader />
        </Box>
      ) : versions.length === 0 ? (
        <Alert color="blue" title="No versions">
          No version history available
        </Alert>
      ) : (
        <Stack gap="xs">
          {versions.map((version) => (
            <Paper
              key={version.id}
              p="md"
              withBorder
              style={{
                borderLeft: compareVersions.includes(version.versionNumber)
                  ? '4px solid var(--mantine-color-blue-6)'
                  : version.versionNumber === currentVersion
                    ? '4px dashed var(--mantine-color-gray-4)'
                    : '4px solid transparent',
                cursor: compareMode ? 'pointer' : 'default',
              }}
              onClick={
                compareMode
                  ? () => handleVersionSelect(version.versionNumber)
                  : undefined
              }
            >
              <Group justify="space-between" align="flex-start">
                <Box style={{ flex: 1 }}>
                  <Group gap="xs" mb="xs">
                    <Text size="sm" fw={500}>
                      {version.title}
                    </Text>
                    <Badge
                      size="sm"
                      variant={
                        version.versionNumber === currentVersion
                          ? 'filled'
                          : 'outline'
                      }
                      color={
                        version.versionNumber === currentVersion
                          ? 'blue'
                          : 'gray'
                      }
                    >
                      v{version.versionNumber}
                    </Badge>
                    {version.versionNumber === currentVersion && (
                      <Badge size="sm" color="green">
                        Current
                      </Badge>
                    )}
                  </Group>
                  <Text size="sm" c="dimmed" mb="xs">
                    {version.changeDescription || 'No description provided'}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Created by {version.createdBy.name}{' '}
                    {formatDate(version.createdAt)}
                  </Text>
                </Box>

                {!compareMode && version.versionNumber !== currentVersion && (
                  <Group gap="xs">
                    {canRestoreVersion && (
                      <Tooltip label="Restore this version">
                        <Button
                          size="xs"
                          variant="subtle"
                          leftSection={<IconArrowBackUp size={14} />}
                          onClick={() =>
                            handleRestoreClick(version.versionNumber)
                          }
                        >
                          Restore
                        </Button>
                      </Tooltip>
                    )}
                    <Menu>
                      <Menu.Target>
                        <Button size="xs" variant="subtle">
                          <IconDotsVertical size={14} />
                        </Button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconGitCompare size={14} />}
                          onClick={handleCompareClick}
                        >
                          Compare with another version
                        </Menu.Item>
                        {canRestoreVersion &&
                          selectedVersion !== currentVersion && (
                            <Menu.Item
                              leftSection={<IconArrowBackUp size={14} />}
                              onClick={() => {
                                if (selectedVersion !== null) {
                                  handleRestoreClick(selectedVersion);
                                }
                              }}
                            >
                              Restore this version
                            </Menu.Item>
                          )}
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                )}
              </Group>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Restore confirmation modal */}
      <Modal
        opened={restoreDialogOpen}
        onClose={() => setRestoreDialogOpen(false)}
        title="Restore Version"
      >
        <Text mb="md">
          Are you sure you want to restore version {versionToRestore}? This will
          replace the current content with the content from this version. A
          backup of the current version will be created automatically.
        </Text>

        <Group justify="flex-end" gap="xs">
          <Button variant="outline" onClick={() => setRestoreDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleRestoreConfirm}>Restore</Button>
        </Group>
      </Modal>
    </Box>
  );
}
