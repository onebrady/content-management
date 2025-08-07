'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  TextInput,
  Textarea,
  Button,
  Badge,
  Avatar,
  ActionIcon,
  Divider,
  Box,
  Paper,
  Title,
  ScrollArea,
  Checkbox,
  Menu,
  Select,
  Switch,
} from '@mantine/core';
import {
  IconX,
  IconCalendar,
  IconUser,
  IconTag,
  IconPaperclip,
  IconChecklist,
  IconMessageCircle,
  IconMove,
  IconArchive,
  IconCheck,
  IconTrash,
  IconPlus,
  IconClock,
  IconEdit,
  IconDots,
} from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { useDebouncedCallback } from '@mantine/hooks';
import { format } from 'date-fns';
import classes from './CardModal.module.css';

interface CardLabel {
  label: {
    id: string;
    name: string;
    color: string;
  };
}

interface CardAssignee {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  position: number;
  assignee?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface Checklist {
  id: string;
  title: string;
  position: number;
  items: ChecklistItem[];
}

interface Comment {
  id: string;
  text: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ProjectCard {
  id: string;
  title: string;
  description?: string | null;
  position: number;
  completed: boolean;
  dueDate?: Date | null;
  cover?: string | null;
  archived: boolean;
  listId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  list?: {
    id: string;
    title: string;
    position: number;
    project?: {
      id: string;
      title: string;
      ownerId: string;
    };
  };
  assignees?: CardAssignee[];
  labels?: CardLabel[];
  checklists?: Checklist[];
  attachments?: any[];
  comments?: Comment[];
  activities?: any[];
  _count?: {
    comments: number;
    attachments: number;
    checklists: number;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  content?: any;
}

interface CardModalProps {
  card: ProjectCard;
  isOpen: boolean;
  onClose: () => void;
  // Real-time collaboration props
  onEditStart?: (cardId: string, field: string) => void;
  onEditEnd?: (cardId: string, field: string) => void;
  onEditUpdate?: (cardId: string, field: string, value: any) => void;
  editingUsers?: Array<{ userId: string; userName: string; field: string }>;
}

export function CardModal({
  card,
  isOpen,
  onClose,
  onEditStart,
  onEditEnd,
  onEditUpdate,
  editingUsers = [],
}: CardModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [dueDate, setDueDate] = useState<Date | null>(card.dueDate || null);
  const [completed, setCompleted] = useState(card.completed);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>(
    'idle'
  );

  // Auto-save functionality
  const debouncedSave = useDebouncedCallback(
    async (updates: Partial<ProjectCard>) => {
      setSaveStatus('saving');
      try {
        const response = await fetch(`/api/cards/${card.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error('Failed to save changes');
        }

        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Auto-save error:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to save changes',
          color: 'red',
        });
        setSaveStatus('idle');
      }
    },
    1000
  );

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Handle title change
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle);
      if (newTitle !== card.title) {
        debouncedSave({ title: newTitle });
      }
    },
    [card.title, debouncedSave]
  );

  // Handle description change
  const handleDescriptionChange = useCallback(
    (newDescription: string) => {
      setDescription(newDescription);
      if (newDescription !== (card.description || '')) {
        debouncedSave({ description: newDescription || null });
      }
    },
    [card.description, debouncedSave]
  );

  // Handle due date change
  const handleDueDateChange = useCallback(
    (newDueDate: Date | null) => {
      setDueDate(newDueDate);
      debouncedSave({ dueDate: newDueDate });
    },
    [debouncedSave]
  );

  // Handle completion toggle
  const handleCompletionToggle = useCallback(() => {
    const newCompleted = !completed;
    setCompleted(newCompleted);
    debouncedSave({ completed: newCompleted });

    notifications.show({
      title: newCompleted ? 'Card completed' : 'Card marked incomplete',
      message: `"${title}" has been ${newCompleted ? 'completed' : 'marked as incomplete'}`,
      color: newCompleted ? 'green' : 'blue',
    });
  }, [completed, title, debouncedSave]);

  // Handle card archiving
  const handleArchive = useCallback(async () => {
    try {
      const response = await fetch(`/api/cards/${card.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to archive card');
      }

      notifications.show({
        title: 'Card archived',
        message: `"${title}" has been archived`,
        color: 'orange',
      });

      onClose();
    } catch (error) {
      console.error('Archive error:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to archive card',
        color: 'red',
      });
    }
  }, [card.id, title, onClose]);

  // Handle comment submission
  const handleAddComment = useCallback(async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/content/${card.id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newComment }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      setNewComment('');
      notifications.show({
        title: 'Comment added',
        message: 'Your comment has been added',
        color: 'green',
      });
    } catch (error) {
      console.error('Comment error:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to add comment',
        color: 'red',
      });
    }
  }, [card.id, newComment]);

  // Calculate checklist progress
  const getChecklistProgress = useCallback((checklist: Checklist) => {
    const completed = checklist.items.filter((item) => item.completed).length;
    const total = checklist.items.length;
    return {
      completed,
      total,
      percentage: total > 0 ? (completed / total) * 100 : 0,
    };
  }, []);

  if (!isOpen) return null;

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      size="xl"
      centered
      classNames={{
        content: classes.modalContent,
        header: classes.modalHeader,
        body: classes.modalBody,
      }}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
        'data-testid': 'modal-overlay',
      }}
      withCloseButton={false}
    >
      <div className={classes.modalContainer}>
        {/* Header */}
        <Group justify="space-between" align="flex-start" mb="md">
          <Box flex={1}>
            {/* Card Cover */}
            {card.cover && (
              <div
                className={classes.cardCover}
                style={{ backgroundImage: `url(${card.cover})` }}
              />
            )}

            {/* Card Title */}
            <Group align="center" gap="xs" mb="xs">
              <IconEdit size={16} color="gray" />
              {isEditingTitle ? (
                <TextInput
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => {
                    setIsEditingTitle(false);
                    handleTitleChange(title);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditingTitle(false);
                      handleTitleChange(title);
                    }
                  }}
                  size="lg"
                  variant="unstyled"
                  className={classes.titleInput}
                  autoFocus
                />
              ) : (
                <Box style={{ position: 'relative' }}>
                  <Title
                    order={2}
                    className={classes.cardTitle}
                    onClick={() => {
                      setIsEditingTitle(true);
                      onEditStart?.(card.id, 'title');
                    }}
                  >
                    {title}
                  </Title>

                  {/* Show editing indicators */}
                  {editingUsers.filter((u) => u.field === 'title').length >
                    0 && (
                    <Group gap="xs" mt="xs">
                      {editingUsers
                        .filter((u) => u.field === 'title')
                        .map((user) => (
                          <Badge
                            key={user.userId}
                            size="xs"
                            color="blue"
                            variant="light"
                          >
                            {user.userName} is editing title
                          </Badge>
                        ))}
                    </Group>
                  )}
                </Box>
              )}
            </Group>

            {/* List Location */}
            <Text size="sm" color="dimmed" mb="md">
              in list{' '}
              <Text span fw={500}>
                {card.list?.title}
              </Text>
            </Text>
          </Box>

          {/* Close Button */}
          <ActionIcon
            onClick={onClose}
            variant="subtle"
            aria-label="Close modal"
            className={classes.closeButton}
          >
            <IconX size={18} />
          </ActionIcon>
        </Group>

        <Group align="flex-start" gap="xl">
          {/* Main Content */}
          <Box flex={1}>
            {/* Labels */}
            {card.labels && card.labels.length > 0 && (
              <Box mb="md">
                <Text size="sm" fw={600} mb="xs">
                  Labels
                </Text>
                <Group gap="xs">
                  {card.labels.map((labelRef) => (
                    <Badge
                      key={labelRef.label.id}
                      size="md"
                      variant="filled"
                      style={{ backgroundColor: labelRef.label.color }}
                      rightSection={
                        <ActionIcon
                          size="xs"
                          variant="transparent"
                          aria-label={`Remove ${labelRef.label.name} label`}
                        >
                          <IconX size={12} />
                        </ActionIcon>
                      }
                    >
                      {labelRef.label.name}
                    </Badge>
                  ))}
                </Group>
              </Box>
            )}

            {/* Description */}
            <Box mb="xl">
              <Group align="center" gap="xs" mb="xs">
                <IconEdit size={16} color="gray" />
                <Text size="sm" fw={600}>
                  Description
                </Text>
              </Group>

              {isEditingDescription ? (
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => {
                    setIsEditingDescription(false);
                    handleDescriptionChange(description);
                  }}
                  placeholder="Add a more detailed description..."
                  minRows={4}
                  autosize
                  autoFocus
                />
              ) : (
                <Box
                  className={classes.descriptionBox}
                  onClick={() => setIsEditingDescription(true)}
                >
                  {description ? (
                    <Text>{description}</Text>
                  ) : (
                    <Text color="dimmed">
                      Add a more detailed description...
                    </Text>
                  )}
                </Box>
              )}
            </Box>

            {/* Checklists */}
            {card.checklists &&
              card.checklists.map((checklist) => {
                const progress = getChecklistProgress(checklist);
                return (
                  <Box key={checklist.id} mb="xl">
                    <Group justify="space-between" align="center" mb="xs">
                      <Group align="center" gap="xs">
                        <IconChecklist size={16} color="gray" />
                        <Text size="sm" fw={600}>
                          {checklist.title}
                        </Text>
                        <Text size="sm" color="dimmed">
                          {progress.completed}/{progress.total}
                        </Text>
                      </Group>
                      <Menu>
                        <Menu.Target>
                          <ActionIcon variant="subtle" size="sm">
                            <IconDots size={14} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item leftSection={<IconTrash size={14} />}>
                            Delete checklist
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>

                    {/* Progress Bar */}
                    <Box className={classes.progressBar} mb="xs">
                      <div
                        className={classes.progressFill}
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </Box>

                    {/* Checklist Items */}
                    <Stack gap="xs">
                      {checklist.items.map((item) => (
                        <Group key={item.id} align="center" gap="xs">
                          <Checkbox
                            checked={item.completed}
                            onChange={() => {
                              // Handle checklist item toggle
                            }}
                            aria-label={item.text}
                          />
                          <Text
                            size="sm"
                            td={item.completed ? 'line-through' : undefined}
                            color={item.completed ? 'dimmed' : undefined}
                            flex={1}
                          >
                            {item.text}
                          </Text>
                          {item.assignee && (
                            <Avatar size="xs" src={null}>
                              {item.assignee.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </Avatar>
                          )}
                        </Group>
                      ))}
                    </Stack>
                  </Box>
                );
              })}

            {/* Add Checklist */}
            {isAddingChecklist ? (
              <Box mb="xl">
                <TextInput
                  placeholder="Checklist title"
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                  mb="xs"
                />
                <Group gap="xs">
                  <Button size="xs">Add checklist</Button>
                  <Button
                    size="xs"
                    variant="subtle"
                    onClick={() => {
                      setIsAddingChecklist(false);
                      setNewChecklistTitle('');
                    }}
                  >
                    Cancel
                  </Button>
                </Group>
              </Box>
            ) : (
              <Button
                variant="light"
                leftSection={<IconChecklist size={16} />}
                onClick={() => setIsAddingChecklist(true)}
                mb="xl"
              >
                Add checklist
              </Button>
            )}

            {/* Comments Section */}
            <Box>
              <Group align="center" gap="xs" mb="md">
                <IconMessageCircle size={16} color="gray" />
                <Text size="sm" fw={600}>
                  Activity ({card._count?.comments || 0})
                </Text>
              </Group>

              {/* Add Comment */}
              <Box mb="md">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  minRows={3}
                  mb="xs"
                />
                <Group gap="xs">
                  <Button
                    size="sm"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    Comment
                  </Button>
                </Group>
              </Box>

              {/* Comments List */}
              <Stack gap="md">
                {card.comments &&
                  card.comments.map((comment) => (
                    <Paper key={comment.id} p="md" withBorder>
                      <Group justify="space-between" align="center" mb="xs">
                        <Group gap="xs">
                          <Avatar size="sm" src={null}>
                            {comment.user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </Avatar>
                          <Text size="sm" fw={500}>
                            {comment.user.name}
                          </Text>
                          <Text size="xs" color="dimmed">
                            {format(
                              new Date(comment.createdAt),
                              'MMM dd, yyyy at h:mm a'
                            )}
                          </Text>
                        </Group>
                      </Group>
                      <Text size="sm">{comment.text}</Text>
                    </Paper>
                  ))}
              </Stack>
            </Box>
          </Box>

          {/* Sidebar Actions */}
          <Box w={200}>
            <Stack gap="md">
              {/* Save Status */}
              {saveStatus !== 'idle' && (
                <Text
                  size="xs"
                  color={saveStatus === 'saving' ? 'blue' : 'green'}
                >
                  {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
                </Text>
              )}

              {/* Actions */}
              <Text size="sm" fw={600} color="dimmed">
                Actions
              </Text>

              {/* Assignees */}
              <Box>
                <Text size="xs" fw={500} mb="xs">
                  Members
                </Text>
                {card.assignees && card.assignees.length > 0 ? (
                  <Group gap="xs" mb="xs">
                    {card.assignees.map((assignee) => (
                      <Avatar
                        key={assignee.user.id}
                        size="sm"
                        src={null}
                        title={assignee.user.name}
                      >
                        {assignee.user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                        <ActionIcon
                          size="xs"
                          variant="filled"
                          color="red"
                          pos="absolute"
                          top={-4}
                          right={-4}
                          aria-label={`Remove ${assignee.user.name}`}
                        >
                          <IconX size={8} />
                        </ActionIcon>
                      </Avatar>
                    ))}
                  </Group>
                ) : null}
                <Button
                  variant="light"
                  size="xs"
                  leftSection={<IconUser size={14} />}
                >
                  Add assignee
                </Button>
              </Box>

              {/* Labels */}
              <Button
                variant="light"
                size="xs"
                leftSection={<IconTag size={14} />}
              >
                Add label
              </Button>

              {/* Due Date */}
              <Box>
                {dueDate ? (
                  <Group gap="xs" mb="xs">
                    <Group gap={4} flex={1}>
                      <IconCalendar size={14} />
                      <Text size="xs">{format(dueDate, 'MMM dd, yyyy')}</Text>
                    </Group>
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      onClick={() => handleDueDateChange(null)}
                      aria-label="Remove due date"
                    >
                      <IconX size={12} />
                    </ActionIcon>
                  </Group>
                ) : null}
                <DatePickerInput
                  placeholder="Add due date"
                  value={dueDate}
                  onChange={handleDueDateChange}
                  leftSection={<IconCalendar size={14} />}
                  size="xs"
                  clearable
                />
              </Box>

              {/* Attachments */}
              <Button
                variant="light"
                size="xs"
                leftSection={<IconPaperclip size={14} />}
              >
                Attach file
              </Button>

              <Divider />

              {/* Card Status */}
              <Group justify="space-between" align="center">
                <Text size="xs" fw={500}>
                  Complete
                </Text>
                <Switch
                  checked={completed}
                  onChange={handleCompletionToggle}
                  size="sm"
                />
              </Group>

              {/* Move Card */}
              <Button
                variant="light"
                size="xs"
                leftSection={<IconMove size={14} />}
              >
                Move
              </Button>

              {/* Archive */}
              <Button
                variant="light"
                size="xs"
                leftSection={<IconArchive size={14} />}
                onClick={handleArchive}
                color="orange"
              >
                Archive
              </Button>
            </Stack>
          </Box>
        </Group>
      </div>
    </Modal>
  );
}
