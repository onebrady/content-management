'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Card,
  Text,
  Badge,
  Group,
  Stack,
  Avatar,
  Tooltip,
  ActionIcon,
  Box,
  useComputedColorScheme,
  Checkbox,
} from '@mantine/core';
import {
  IconCalendar,
  IconPaperclip,
  IconUser,
  IconGripVertical,
} from '@tabler/icons-react';
import { TaskErrorBoundary } from '@/components/error/ProjectErrorBoundary';
import type { Task } from '@/types/database';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  style?: React.CSSProperties;
  isSelected?: boolean;
  onSelectionChange?: (taskId: string, selected: boolean) => void;
  showSelection?: boolean;
}

function TaskCardContent({
  task,
  isDragging,
  style: customStyle,
  isSelected = false,
  onSelectionChange,
  showSelection = false,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableIsDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const colorScheme = useComputedColorScheme();
  const isCurrentlyDragging = isDragging || sortableIsDragging;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isCurrentlyDragging ? 0.5 : 1,
    cursor: isCurrentlyDragging ? 'grabbing' : 'grab',
    ...customStyle,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'red';
      case 'HIGH':
        return 'orange';
      case 'LOW':
        return 'gray';
      default:
        return 'blue';
    }
  };

  const formatDueDate = (date: Date | null) => {
    if (!date) return null;
    const now = new Date();
    const dueDate = new Date(date);
    const diffDays = Math.ceil(
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return dueDate.toLocaleDateString();
  };

  const dueDateInfo = formatDueDate(task.dueDate);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      shadow={isCurrentlyDragging ? 'lg' : 'sm'}
      p="sm"
      radius="md"
      withBorder
      bg={colorScheme === 'dark' ? 'dark.7' : 'white'}
      role="button"
      aria-label={`Task: ${task.title}. ${task.priority} priority. ${task.completed ? 'Completed' : 'Not completed'}`}
      tabIndex={0}
    >
      <Stack spacing="xs">
        {/* Selection checkbox and task title */}
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group spacing="xs" style={{ flex: 1 }}>
            {showSelection && (
              <Checkbox
                checked={isSelected}
                onChange={(event) =>
                  onSelectionChange?.(task.id, event.currentTarget.checked)
                }
                size="sm"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <Text
              size="sm"
              fw={500}
              style={{
                flex: 1,
                textDecoration: task.completed ? 'line-through' : 'none',
                opacity: task.completed ? 0.7 : 1,
              }}
              lineClamp={2}
            >
              {task.title}
            </Text>
          </Group>

          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            {...listeners}
            style={{ cursor: 'grab' }}
            aria-label="Drag to move task"
          >
            <IconGripVertical size={12} />
          </ActionIcon>
        </Group>

        {/* Task description (if exists) */}
        {task.description && (
          <Text size="xs" c="dimmed" lineClamp={2}>
            {task.description}
          </Text>
        )}

        {/* Task metadata */}
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group spacing="xs">
            {/* Priority badge */}
            {task.priority !== 'MEDIUM' && (
              <Badge
                size="xs"
                color={getPriorityColor(task.priority)}
                variant="light"
              >
                {task.priority}
              </Badge>
            )}

            {/* Due date */}
            {dueDateInfo && (
              <Tooltip
                label={`Due: ${task.dueDate ? new Date(task.dueDate).toLocaleString() : ''}`}
              >
                <Badge
                  size="xs"
                  color={isOverdue ? 'red' : 'blue'}
                  variant="light"
                  leftSection={<IconCalendar size={10} />}
                >
                  {dueDateInfo}
                </Badge>
              </Tooltip>
            )}

            {/* Attachments indicator */}
            {task.attachments && task.attachments.length > 0 && (
              <Tooltip label={`${task.attachments.length} attachment(s)`}>
                <Badge
                  size="xs"
                  color="gray"
                  variant="light"
                  leftSection={<IconPaperclip size={10} />}
                >
                  {task.attachments.length}
                </Badge>
              </Tooltip>
            )}
          </Group>

          {/* Assignee avatar */}
          {task.assignee && (
            <Tooltip
              label={`Assigned to: ${task.assignee.name || task.assignee.email}`}
            >
              <Avatar
                size="sm"
                radius="xl"
                color="blue"
                name={task.assignee.name || task.assignee.email}
              >
                {task.assignee.name ? (
                  task.assignee.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                ) : (
                  <IconUser size={12} />
                )}
              </Avatar>
            </Tooltip>
          )}
        </Group>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <Group spacing={4}>
            {task.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} size="xs" color="gray" variant="dot">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge size="xs" color="gray" variant="light">
                +{task.tags.length - 3}
              </Badge>
            )}
          </Group>
        )}

        {/* Estimated vs actual hours */}
        {(task.estimatedHours || task.actualHours) && (
          <Group spacing="xs">
            {task.estimatedHours && (
              <Text size="xs" c="dimmed">
                Est: {task.estimatedHours}h
              </Text>
            )}
            {task.actualHours && (
              <Text size="xs" c="dimmed">
                Actual: {task.actualHours}h
              </Text>
            )}
          </Group>
        )}
      </Stack>
    </Card>
  );
}

export default function TaskCard(props: TaskCardProps) {
  return (
    <TaskErrorBoundary>
      <TaskCardContent {...props} />
    </TaskErrorBoundary>
  );
}
