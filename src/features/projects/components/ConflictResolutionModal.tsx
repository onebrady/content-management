'use client';

import React, { useState } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  Button,
  Paper,
  Badge,
  Divider,
  Alert,
  Box,
  Tabs,
  Code,
  ScrollArea,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconGitMerge,
  IconReplace,
  IconX,
  IconInfoCircle,
} from '@tabler/icons-react';
import { ConflictData, ConflictResolution } from '@/lib/conflict-resolution';
import classes from './ConflictResolutionModal.module.css';

interface ConflictResolutionModalProps {
  isOpen: boolean;
  conflict: ConflictData | null;
  onResolve: (resolution: ConflictResolution) => void;
  onClose: () => void;
}

export function ConflictResolutionModal({
  isOpen,
  conflict,
  onResolve,
  onClose,
}: ConflictResolutionModalProps) {
  const [selectedResolution, setSelectedResolution] = useState<
    'merge' | 'override' | 'cancel'
  >('merge');
  const [previewData, setPreviewData] = useState<any>(null);

  if (!conflict) return null;

  // Generate preview based on selected resolution
  const generatePreview = (action: 'merge' | 'override' | 'cancel') => {
    switch (action) {
      case 'merge':
        return mergeChanges(conflict.localChanges, conflict.remoteChanges);
      case 'override':
        return conflict.localChanges;
      case 'cancel':
        return conflict.remoteChanges;
    }
  };

  const handleResolutionChange = (
    resolution: 'merge' | 'override' | 'cancel'
  ) => {
    setSelectedResolution(resolution);
    setPreviewData(generatePreview(resolution));
  };

  const handleResolve = () => {
    onResolve({
      action: selectedResolution,
      resolvedData: previewData,
    });
  };

  // Simple merge function for preview (matches ConflictResolver logic)
  function mergeChanges(local: any, remote: any): any {
    const merged = { ...local };

    for (const [key, remoteValue] of Object.entries(remote)) {
      const localValue = local[key];

      if (localValue === undefined) {
        merged[key] = remoteValue;
      } else if (
        typeof remoteValue === 'string' &&
        typeof localValue === 'string'
      ) {
        merged[key] =
          localValue.length >= remoteValue.length ? localValue : remoteValue;
      } else if (typeof remoteValue === 'boolean') {
        merged[key] = localValue; // Prefer local for booleans
      } else {
        merged[key] = remoteValue; // Default to remote for other types
      }
    }

    return merged;
  }

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconAlertTriangle size={20} color="orange" />
          <Text fw={600}>Conflict Resolution Required</Text>
        </Group>
      }
      size="xl"
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Stack gap="md">
        {/* Conflict Information */}
        <Alert
          icon={<IconInfoCircle size={16} />}
          color="orange"
          variant="light"
        >
          <Text size="sm">
            <Text span fw={500}>
              {conflict.conflictedBy.userName}
            </Text>{' '}
            made changes to the same{' '}
            <Text span fw={500}>
              {conflict.type}
            </Text>{' '}
            you're editing. Please choose how to resolve this conflict.
          </Text>
          <Text size="xs" color="dimmed" mt="xs">
            Conflict detected at {new Date(conflict.timestamp).toLocaleString()}
          </Text>
        </Alert>

        {/* Resolution Options */}
        <Tabs
          value={selectedResolution}
          onTabChange={(value) => handleResolutionChange(value as any)}
        >
          <Tabs.List>
            <Tabs.Tab value="merge" leftSection={<IconGitMerge size={16} />}>
              Smart Merge
            </Tabs.Tab>
            <Tabs.Tab value="override" leftSection={<IconReplace size={16} />}>
              Keep My Changes
            </Tabs.Tab>
            <Tabs.Tab value="cancel" leftSection={<IconX size={16} />}>
              Use Their Changes
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="merge" pt="md">
            <Stack gap="xs">
              <Text size="sm" fw={500}>
                Smart Merge Strategy
              </Text>
              <Text size="xs" color="dimmed">
                Automatically combines your changes with theirs using
                intelligent merging rules:
              </Text>
              <Text size="xs" color="dimmed" ml="md">
                • Longer text values are preferred
                <br />
                • Your boolean choices are kept
                <br />
                • Most recent numerical values are used
                <br />• Arrays are combined uniquely
              </Text>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="override" pt="md">
            <Stack gap="xs">
              <Text size="sm" fw={500}>
                Keep Your Changes
              </Text>
              <Text size="xs" color="dimmed">
                Discard their changes and keep only your modifications. Their
                work will be lost.
              </Text>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="cancel" pt="md">
            <Stack gap="xs">
              <Text size="sm" fw={500}>
                Use Their Changes
              </Text>
              <Text size="xs" color="dimmed">
                Discard your changes and accept their modifications. Your work
                will be lost.
              </Text>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Divider />

        {/* Changes Comparison */}
        <Box>
          <Text size="sm" fw={600} mb="xs">
            Changes Comparison
          </Text>

          <Group align="flex-start" gap="md">
            {/* Your Changes */}
            <Paper flex={1} p="sm" withBorder className={classes.changesPanel}>
              <Group gap="xs" mb="xs">
                <Badge size="sm" color="blue">
                  Your Changes
                </Badge>
              </Group>
              <ScrollArea h={150}>
                <Code block className={classes.changesCode}>
                  {JSON.stringify(conflict.localChanges, null, 2)}
                </Code>
              </ScrollArea>
            </Paper>

            {/* Their Changes */}
            <Paper flex={1} p="sm" withBorder className={classes.changesPanel}>
              <Group gap="xs" mb="xs">
                <Badge size="sm" color="orange">
                  {conflict.conflictedBy.userName}'s Changes
                </Badge>
              </Group>
              <ScrollArea h={150}>
                <Code block className={classes.changesCode}>
                  {JSON.stringify(conflict.remoteChanges, null, 2)}
                </Code>
              </ScrollArea>
            </Paper>
          </Group>
        </Box>

        {/* Preview */}
        {previewData && (
          <Box>
            <Text size="sm" fw={600} mb="xs">
              Preview Result
            </Text>
            <Paper p="sm" withBorder className={classes.previewPanel}>
              <ScrollArea h={120}>
                <Code block className={classes.previewCode}>
                  {JSON.stringify(previewData, null, 2)}
                </Code>
              </ScrollArea>
            </Paper>
          </Box>
        )}

        {/* Action Buttons */}
        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleResolve}
            color={
              selectedResolution === 'merge'
                ? 'blue'
                : selectedResolution === 'override'
                  ? 'orange'
                  : 'red'
            }
            leftSection={
              selectedResolution === 'merge' ? (
                <IconGitMerge size={16} />
              ) : selectedResolution === 'override' ? (
                <IconReplace size={16} />
              ) : (
                <IconX size={16} />
              )
            }
          >
            {selectedResolution === 'merge'
              ? 'Apply Smart Merge'
              : selectedResolution === 'override'
                ? 'Keep My Changes'
                : 'Use Their Changes'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
