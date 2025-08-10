'use client';

import React, { useState } from 'react';
import {
  Paper,
  Text,
  Group,
  Button,
  Stack,
  TextInput,
  ActionIcon,
  Menu,
  Badge,
} from '@mantine/core';
import {
  IconPlus,
  IconDots,
  IconArchive,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BoardCard } from './BoardCard';
import classes from './BoardList.module.css';

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
  assignees?: any[];
  labels?: any[];
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

interface ProjectList {
  id: string;
  title: string;
  position: number;
  archived?: boolean;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  cards: ProjectCard[];
}

interface BoardListProps {
  list: ProjectList;
  index: number;
  onCardClick: (card: ProjectCard) => void;
  onAddCard: (listId: string) => void;
  onEditList?: (listId: string, title: string) => void;
  onArchiveList?: (listId: string) => void;
  isDragging: boolean;
}

export function BoardList({
  list,
  index,
  onCardClick,
  onAddCard,
  onEditList,
  onArchiveList,
  isDragging,
}: BoardListProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);

  const activeCards = list.cards.filter((card) => !card.archived);
  const completedCount = activeCards.filter((card) => card.completed).length;

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onAddCard(list.id);
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  const handleEditTitle = () => {
    if (editTitle.trim() && editTitle !== list.title && onEditList) {
      onEditList(list.id, editTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: 'card' | 'title') => {
    if (e.key === 'Enter') {
      if (action === 'card') {
        handleAddCard();
      } else {
        handleEditTitle();
      }
    } else if (e.key === 'Escape') {
      if (action === 'card') {
        setIsAddingCard(false);
        setNewCardTitle('');
      } else {
        setIsEditingTitle(false);
        setEditTitle(list.title);
      }
    }
  };

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging: listDragging,
  } = useSortable({
    id: list.id,
    data: { type: 'list', listId: list.id },
  });

  const listStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Paper
      ref={setNodeRef}
      className={`
        ${classes.list} 
        ${isDragging || listDragging ? classes.dragging : ''}
      `}
      data-testid="board-list"
      shadow="sm"
      p="md"
      radius="md"
      withBorder
      style={listStyle}
    >
      {/* List Header */}
      <div {...listeners} {...attributes}>
        <Group justify="space-between" align="center" mb="md">
          {isEditingTitle ? (
            <TextInput
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleEditTitle}
              onKeyDown={(e) => handleKeyPress(e, 'title')}
              size="sm"
              variant="unstyled"
              autoFocus
              className={classes.titleInput}
            />
          ) : (
            <Group gap="xs" align="center">
              <Text fw={600} size="sm" lineClamp={1}>
                {list.title}
              </Text>
              <Badge size="sm" variant="light" color="gray">
                {activeCards.length}
              </Badge>
              {completedCount > 0 && (
                <Badge size="sm" variant="light" color="green">
                  {completedCount} done
                </Badge>
              )}
            </Group>
          )}

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="subtle" size="sm">
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEdit size={14} />}
                onClick={() => setIsEditingTitle(true)}
              >
                Edit list name
              </Menu.Item>
              <Menu.Item
                leftSection={<IconArchive size={14} />}
                onClick={() => onArchiveList?.(list.id)}
                color="orange"
              >
                Archive list
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color="red"
                disabled
              >
                Delete list
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </div>

      {/* Cards Container */}
      <div className={classes.cardsContainer} data-testid="cards-container">
        {activeCards.length > 0 ? (
          <Stack gap="xs">
            <SortableContext
              items={activeCards.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {activeCards
                .sort((a, b) => a.position - b.position)
                .map((card, cardIndex) => (
                  <BoardCard
                    key={card.id}
                    card={card}
                    index={cardIndex}
                    onCardClick={onCardClick}
                    isDragging={false}
                  />
                ))}
            </SortableContext>
          </Stack>
        ) : (
          <div className={classes.emptyState}>
            <Text size="sm" color="dimmed" ta="center">
              No cards yet
            </Text>
          </div>
        )}
      </div>

      {/* Add Card Section */}
      <div className={classes.addCardSection}>
        {isAddingCard ? (
          <Stack gap="xs">
            <TextInput
              placeholder="Enter a title for this card..."
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, 'card')}
              size="sm"
              autoFocus
            />
            <Group gap="xs">
              <Button
                size="xs"
                onClick={handleAddCard}
                disabled={!newCardTitle.trim()}
              >
                Add card
              </Button>
              <Button
                size="xs"
                variant="subtle"
                onClick={() => {
                  setIsAddingCard(false);
                  setNewCardTitle('');
                }}
              >
                Cancel
              </Button>
            </Group>
          </Stack>
        ) : (
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconPlus size={16} />}
            onClick={() => setIsAddingCard(true)}
            fullWidth
            justify="flex-start"
            size="sm"
            className={classes.addCardButton}
          >
            Add a card
          </Button>
        )}
      </div>
    </Paper>
  );
}
