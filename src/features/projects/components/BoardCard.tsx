'use client';

import React from 'react';
import { Card, Group, Text, Badge, Avatar, Stack, ActionIcon } from '@mantine/core';
import { IconCalendar, IconMessageCircle, IconPaperclip, IconChecklist, IconEye } from '@tabler/icons-react';
import { Draggable } from '@hello-pangea/dnd';
import { format } from 'date-fns';
import classes from './BoardCard.module.css';

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
  assignees?: CardAssignee[];
  labels?: CardLabel[];
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
}

interface BoardCardProps {
  card: ProjectCard;
  index: number;
  onCardClick: (card: ProjectCard) => void;
  isDragging: boolean;
}

export function BoardCard({ card, index, onCardClick, isDragging }: BoardCardProps) {
  const hasAttachments = card._count?.attachments && card._count.attachments > 0;
  const hasComments = card._count?.comments && card._count.comments > 0;
  const hasChecklists = card._count?.checklists && card._count.checklists > 0;
  const isOverdue = card.dueDate && new Date() > new Date(card.dueDate) && !card.completed;

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            ${classes.card} 
            ${card.completed ? classes.completed : ''} 
            ${isDragging || snapshot.isDragging ? classes.dragging : ''}
            ${isOverdue ? classes.overdue : ''}
          `}
          onClick={() => onCardClick(card)}
          data-testid="board-card"
          shadow="sm"
          padding="sm"
          radius="md"
          withBorder
        >
          {/* Cover Image */}
          {card.cover && (
            <Card.Section>
              <div 
                className={classes.cover}
                style={{ backgroundImage: `url(${card.cover})` }}
              />
            </Card.Section>
          )}

          {/* Labels */}
          {card.labels && card.labels.length > 0 && (
            <Group gap="xs" mb="xs">
              {card.labels.slice(0, 4).map((labelRef) => (
                <Badge
                  key={labelRef.label.id}
                  size="xs"
                  variant="filled"
                  style={{ backgroundColor: labelRef.label.color }}
                >
                  {labelRef.label.name}
                </Badge>
              ))}
              {card.labels.length > 4 && (
                <Badge size="xs" variant="light" color="gray">
                  +{card.labels.length - 4}
                </Badge>
              )}
            </Group>
          )}

          {/* Card Title */}
          <Text size="sm" fw={500} mb="xs" lineClamp={3}>
            {card.title}
          </Text>

          {/* Card Meta Information */}
          <Stack gap="xs">
            {/* Due Date */}
            {card.dueDate && (
              <Group gap="xs">
                <IconCalendar size={14} color={isOverdue ? 'red' : 'gray'} />
                <Text 
                  size="xs" 
                  color={isOverdue ? 'red' : card.completed ? 'green' : 'dimmed'}
                  td={card.completed ? 'line-through' : undefined}
                >
                  {format(new Date(card.dueDate), 'MMM dd')}
                </Text>
              </Group>
            )}

            {/* Bottom Row: Icons and Assignees */}
            <Group justify="space-between" align="center">
              {/* Activity Icons */}
              <Group gap="xs">
                {hasComments && (
                  <Group gap={4}>
                    <IconMessageCircle size={14} color="gray" />
                    <Text size="xs" color="dimmed">
                      {card._count?.comments}
                    </Text>
                  </Group>
                )}
                
                {hasAttachments && (
                  <Group gap={4}>
                    <IconPaperclip size={14} color="gray" />
                    <Text size="xs" color="dimmed">
                      {card._count?.attachments}
                    </Text>
                  </Group>
                )}
                
                {hasChecklists && (
                  <Group gap={4}>
                    <IconChecklist size={14} color="gray" />
                    <Text size="xs" color="dimmed">
                      {card._count?.checklists}
                    </Text>
                  </Group>
                )}

                {card.description && (
                  <IconEye size={14} color="gray" />
                )}
              </Group>

              {/* Assignees */}
              {card.assignees && card.assignees.length > 0 && (
                <Group gap={-8}>
                  {card.assignees.slice(0, 3).map((assignee, idx) => (
                    <Avatar
                      key={assignee.user.id}
                      size="sm"
                      src={null}
                      alt={assignee.user.name}
                      radius="xl"
                      style={{ zIndex: 3 - idx }}
                      className={classes.assigneeAvatar}
                    >
                      {assignee.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </Avatar>
                  ))}
                  {card.assignees.length > 3 && (
                    <Avatar size="sm" radius="xl" color="gray">
                      +{card.assignees.length - 3}
                    </Avatar>
                  )}
                </Group>
              )}
            </Group>
          </Stack>

          {/* Completion Indicator */}
          {card.completed && (
            <div className={classes.completionBadge}>
              <Badge size="xs" color="green" variant="filled">
                Done
              </Badge>
            </div>
          )}
        </Card>
      )}
    </Draggable>
  );
}
