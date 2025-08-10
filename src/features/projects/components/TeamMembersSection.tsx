'use client';

import { useMemo, useState } from 'react';
import {
  Group,
  Stack,
  Text,
  Avatar,
  Select,
  Button,
  Badge,
} from '@mantine/core';

interface TeamMembersSectionProps {
  projectId: string;
  projectOwnerId: string;
  members: Array<{ user: { id: string; name?: string | null; email: string } }>; // simplified
  allUsers: Array<{ id: string; name?: string | null; email: string }>;
  isLoading: boolean;
  onAddMember: (userId: string) => void | Promise<void>;
  onRemoveMember: (userId: string) => void | Promise<void>;
}

export default function TeamMembersSection({
  projectId,
  projectOwnerId,
  members,
  allUsers,
  isLoading,
  onAddMember,
  onRemoveMember,
}: TeamMembersSectionProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const availableOptions = useMemo(
    () =>
      allUsers
        .filter(
          (u) =>
            !members?.some((m) => m.user.id === u.id) && u.id !== projectOwnerId
        )
        .map((u) => ({ value: u.id, label: u.name || u.email })),
    [allUsers, members, projectOwnerId]
  );

  return (
    <div>
      <Group gap="xs" align="center" mb="xs">
        <Text fw={500}>Team Members</Text>
        <Badge size="xs" variant="light" color="teal">
          Updated
        </Badge>
        <Text size="xs" c="dimmed">
          ({members?.length ?? 0} members, {allUsers.length} users)
        </Text>
      </Group>

      <Stack gap="xs">
        <Group gap="xs" wrap="wrap">
          {members?.map((m) => (
            <Group key={m.user.id} gap={6} align="center">
              <Avatar size="sm" radius="xl" color="blue">
                {(m.user.name || m.user.email || '?')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </Avatar>
              <Text size="xs">{m.user.name || m.user.email}</Text>
              <Button
                size="xs"
                variant="subtle"
                color="red"
                onClick={() => onRemoveMember(m.user.id)}
              >
                Remove
              </Button>
            </Group>
          ))}
        </Group>

        <Group gap="xs">
          <Select
            placeholder={isLoading ? 'Loading users...' : 'Add member...'}
            data={availableOptions}
            searchable
            comboboxProps={{ withinPortal: true, zIndex: 4000 }}
            value={selectedUserId}
            onChange={setSelectedUserId}
            nothingFoundMessage={isLoading ? 'Loading...' : 'No users'}
            w={260}
          />
          <Button
            size="xs"
            onClick={() => selectedUserId && onAddMember(selectedUserId)}
            disabled={!selectedUserId}
          >
            Add
          </Button>
        </Group>

        {allUsers.length > 0 && (
          <Text size="xs" c="dimmed">
            {availableOptions.length === 0 ? 'No available users to add' : ''}
          </Text>
        )}
      </Stack>
    </div>
  );
}
