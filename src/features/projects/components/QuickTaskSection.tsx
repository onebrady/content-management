'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  ActionIcon,
  Button,
  Checkbox,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconCheck, IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface QuickTaskSectionProps {
  projectId: string;
  lists: Array<{
    id: string;
    title: string;
    cards?: Array<{
      id: string;
      title: string;
      completed?: boolean | null;
      position?: number | null;
    }>;
  }>;
  onReplaceLists: (lists: any[]) => void; // upstream setter to replace lists after rehydrate
}

export default function QuickTaskSection({
  projectId,
  lists,
  onReplaceLists,
}: QuickTaskSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [listId, setListId] = useState<string | null>(
    () => lists?.[0]?.id ?? null
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selectedList = useMemo(
    () => lists.find((l) => l.id === listId),
    [lists, listId]
  );
  const recentCards = useMemo(() => {
    const cards = selectedList?.cards || [];
    return cards.slice(-5).reverse();
  }, [selectedList]);

  const replaceListsLocal = useCallback(
    (updater: (prev: any[]) => any[]) => {
      onReplaceLists(updater(lists));
    },
    [lists, onReplaceLists]
  );

  const handleCreate = useCallback(async () => {
    if (!listId || !newTitle.trim()) return;
    const title = newTitle.trim();
    try {
      setIsAdding(true);
      const res = await fetch(`/api/lists/${listId}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to add task');
      }
      const createdRaw = await res.json().catch(() => null);
      const created = (createdRaw && (createdRaw.data ?? createdRaw)) || null;
      setNewTitle('');

      // optimistic append to end
      if (created) {
        replaceListsLocal((prev) =>
          prev.map((l) =>
            l.id === listId
              ? {
                  ...l,
                  cards: [
                    ...(l.cards || []),
                    {
                      id: created.id,
                      title: created.title || title,
                      completed: created.completed ?? false,
                      position:
                        created.position ??
                        (l.cards && l.cards.length
                          ? (l.cards[l.cards.length - 1].position ??
                            l.cards.length - 1)
                          : -1) + 1,
                    },
                  ],
                }
              : l
          )
        );
      }

      // rehydrate board lists to ensure persistence is visible
      try {
        const boardRes = await fetch(`/api/projects/${projectId}/board`);
        if (boardRes.ok) {
          const boardJson = await boardRes.json().catch(() => ({}));
          const board = boardJson?.data ?? boardJson;
          if (board?.lists) onReplaceLists(board.lists);
        }
      } catch {}

      notifications.show({
        title: 'Task created',
        message: 'Task has been added',
        color: 'green',
      });
    } catch (e) {
      notifications.show({
        title: 'Error',
        message: (e as Error).message,
        color: 'red',
      });
    } finally {
      setIsAdding(false);
    }
  }, [listId, newTitle, projectId, replaceListsLocal, onReplaceLists]);

  const toggleCompleted = useCallback(
    async (cardId: string, next: boolean) => {
      try {
        setSavingId(cardId);
        replaceListsLocal((prev) =>
          prev.map((l) => ({
            ...l,
            cards: (l.cards || []).map((c) =>
              c.id === cardId ? { ...c, completed: next } : c
            ),
          }))
        );
        const res = await fetch(`/api/cards/${cardId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: next }),
        });
        if (!res.ok) throw new Error('Failed to update task');
      } catch (e) {
        replaceListsLocal((prev) =>
          prev.map((l) => ({
            ...l,
            cards: (l.cards || []).map((c) =>
              c.id === cardId ? { ...c, completed: !next } : c
            ),
          }))
        );
        notifications.show({
          title: 'Error',
          message: (e as Error).message,
          color: 'red',
        });
      } finally {
        setSavingId(null);
      }
    },
    [replaceListsLocal]
  );

  const startEdit = useCallback((cardId: string, title: string) => {
    setEditingId(cardId);
    setEditingTitle(title);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingTitle('');
  }, []);

  const saveTitle = useCallback(async () => {
    if (!editingId) return;
    const cardId = editingId;
    const title = editingTitle.trim();
    if (!title) return;
    try {
      setSavingId(cardId);
      replaceListsLocal((prev) =>
        prev.map((l) => ({
          ...l,
          cards: (l.cards || []).map((c) =>
            c.id === cardId ? { ...c, title } : c
          ),
        }))
      );
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error('Failed to rename task');
      setEditingId(null);
      setEditingTitle('');
    } catch (e) {
      notifications.show({
        title: 'Error',
        message: (e as Error).message,
        color: 'red',
      });
    } finally {
      setSavingId(null);
    }
  }, [editingId, editingTitle, replaceListsLocal]);

  const deleteTask = useCallback(
    async (cardId: string) => {
      try {
        setDeletingId(cardId);
        replaceListsLocal((prev) =>
          prev.map((l) => ({
            ...l,
            cards: (l.cards || []).filter((c) => c.id !== cardId),
          }))
        );
        const res = await fetch(`/api/cards/${cardId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete task');
        notifications.show({
          title: 'Task deleted',
          message: '',
          color: 'green',
        });
      } catch (e) {
        notifications.show({
          title: 'Error',
          message: (e as Error).message,
          color: 'red',
        });
        try {
          const boardRes = await fetch(`/api/projects/${projectId}/board`);
          if (boardRes.ok) {
            const boardJson = await boardRes.json().catch(() => ({}));
            const board = boardJson?.data ?? boardJson;
            if (board?.lists) onReplaceLists(board.lists);
          }
        } catch {}
      } finally {
        setDeletingId(null);
      }
    },
    [projectId, replaceListsLocal, onReplaceLists]
  );

  return (
    <div>
      <Group gap="xs" align="center" mb="xs">
        <Text fw={500}>Quick Task</Text>
      </Group>

      <Group align="flex-end" gap="xs" wrap="wrap">
        <TextInput
          placeholder="Task title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          w={280}
        />
        <Select
          placeholder="Select list"
          data={(lists || []).map((l) => ({ value: l.id, label: l.title }))}
          value={listId}
          onChange={setListId}
          w={220}
        />
        <Button
          size="sm"
          loading={isAdding}
          onClick={handleCreate}
          disabled={!newTitle.trim() || !listId}
        >
          Add Task
        </Button>
      </Group>

      {lists && listId && (
        <Stack gap="xs" mt="sm">
          <Text size="sm" fw={500} c="dimmed">
            Recent tasks in selected list
          </Text>
          <Stack gap={6}>
            {recentCards.map((c) => {
              const isEditing = editingId === c.id;
              return (
                <Group key={c.id} gap={8} wrap="nowrap" justify="space-between">
                  <Group gap={8} wrap="nowrap">
                    <Checkbox
                      size="xs"
                      checked={!!c.completed}
                      disabled={savingId === c.id}
                      onChange={(e) =>
                        toggleCompleted(c.id, e.currentTarget.checked)
                      }
                    />
                    {isEditing ? (
                      <TextInput
                        size="xs"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.currentTarget.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveTitle();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        w={320}
                        autoFocus
                      />
                    ) : (
                      <Text
                        size="sm"
                        style={{ maxWidth: 360, cursor: 'pointer' }}
                        onClick={() => startEdit(c.id, c.title)}
                        title="Click to edit"
                      >
                        {c.title}
                      </Text>
                    )}
                  </Group>
                  <Group gap={6} wrap="nowrap">
                    {isEditing ? (
                      <>
                        <ActionIcon
                          size="sm"
                          variant="light"
                          color="green"
                          onClick={saveTitle}
                          loading={savingId === c.id}
                        >
                          <IconCheck size={16} />
                        </ActionIcon>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="gray"
                          onClick={cancelEdit}
                        >
                          <IconX size={16} />
                        </ActionIcon>
                      </>
                    ) : (
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="blue"
                        onClick={() => startEdit(c.id, c.title)}
                        title="Edit"
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                    )}
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="red"
                      onClick={() => deleteTask(c.id)}
                      loading={deletingId === c.id}
                      title="Delete"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
              );
            })}
            {(selectedList?.cards || []).length === 0 && (
              <Text size="xs" c="dimmed">
                No tasks yet
              </Text>
            )}
          </Stack>
        </Stack>
      )}
    </div>
  );
}
