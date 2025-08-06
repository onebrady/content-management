'use client';

import React, { useState, useCallback } from 'react';
import { Container, Title, Group, Button, Paper, Stack, Skeleton, Text } from '@mantine/core';
import { IconPlus, IconSettings } from '@tabler/icons-react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { notifications } from '@mantine/notifications';
import { BoardList } from './BoardList';
import { useProjectData } from '../hooks/useProjectData';
import { useTaskPositioning } from '../hooks/useTaskPositioning';
import classes from './BoardView.module.css';

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

interface ProjectData {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  lists: ProjectList[];
}

interface BoardViewProps {
  projectId: string;
  projectData?: ProjectData | null;
  isLoading?: boolean;
}

export function BoardView({ projectId, projectData, isLoading }: BoardViewProps) {
  const [selectedCard, setSelectedCard] = useState<ProjectCard | null>(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const { 
    moveCard, 
    moveList, 
    createCard, 
    createList, 
    updateList, 
    archiveList,
    isMoving 
  } = useTaskPositioning(projectId);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      if (type === 'list') {
        // Moving lists
        await moveList(draggableId, destination.index);
      } else {
        // Moving cards
        await moveCard(
          draggableId,
          source.droppableId,
          destination.droppableId,
          destination.index
        );
      }
    } catch (error) {
      console.error('Drag operation failed:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to move item. Please try again.',
        color: 'red',
      });
    }
  }, [moveCard, moveList]);

  const handleCardClick = useCallback((card: ProjectCard) => {
    setSelectedCard(card);
  }, []);

  const handleAddCard = useCallback(async (listId: string) => {
    try {
      await createCard(listId, 'New Card');
      notifications.show({
        title: 'Success',
        message: 'Card created successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to create card:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create card. Please try again.',
        color: 'red',
      });
    }
  }, [createCard]);

  const handleEditList = useCallback(async (listId: string, title: string) => {
    try {
      await updateList(listId, { title });
      notifications.show({
        title: 'Success',
        message: 'List updated successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to update list:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update list. Please try again.',
        color: 'red',
      });
    }
  }, [updateList]);

  const handleArchiveList = useCallback(async (listId: string) => {
    try {
      await archiveList(listId);
      notifications.show({
        title: 'Success',
        message: 'List archived successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to archive list:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to archive list. Please try again.',
        color: 'red',
      });
    }
  }, [archiveList]);

  const handleAddList = useCallback(async () => {
    if (newListTitle.trim()) {
      try {
        await createList(newListTitle.trim());
        setNewListTitle('');
        setIsAddingList(false);
        notifications.show({
          title: 'Success',
          message: 'List created successfully',
          color: 'green',
        });
      } catch (error) {
        console.error('Failed to create list:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to create list. Please try again.',
          color: 'red',
        });
      }
    }
  }, [newListTitle, createList]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddList();
    } else if (e.key === 'Escape') {
      setIsAddingList(false);
      setNewListTitle('');
    }
  };

  if (isLoading) {
    return (
      <Container fluid className={classes.container} data-testid="board-skeleton">
        <Stack gap="md">
          <Group justify="space-between">
            <Skeleton height={32} width={200} />
            <Group gap="sm">
              <Skeleton height={36} width={120} />
              <Skeleton height={36} width={36} />
            </Group>
          </Group>
          <div className={classes.boardContainer}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Paper key={i} className={classes.listSkeleton} p="md">
                <Skeleton height={20} width="60%" mb="md" />
                <Stack gap="xs">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} height={80} />
                  ))}
                </Stack>
              </Paper>
            ))}
          </div>
        </Stack>
      </Container>
    );
  }

  if (!projectData) {
    return (
      <Container fluid className={classes.container}>
        <div className={classes.errorState}>
          <Text size="lg" color="dimmed">
            Project not found
          </Text>
        </div>
      </Container>
    );
  }

  const activeLists = projectData.lists.filter(list => !list.archived);

  return (
    <Container fluid className={classes.container}>
      {/* Header */}
      <Group justify="space-between" align="center" mb="md" className={classes.header}>
        <Title order={2} size="h3">
          {projectData.title}
        </Title>
        <Group gap="sm">
          <Button
            leftSection={<IconSettings size={16} />}
            variant="light"
            size="sm"
          >
            Board settings
          </Button>
        </Group>
      </Group>

      {/* Board Container */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div 
          className={classes.boardContainer} 
          data-testid="board-container"
        >
          <Droppable 
            droppableId="board" 
            type="list" 
            direction="horizontal"
          >
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={classes.listsContainer}
              >
                {/* Lists */}
                {activeLists
                  .sort((a, b) => a.position - b.position)
                  .map((list, index) => (
                    <BoardList
                      key={list.id}
                      list={list}
                      index={index}
                      onCardClick={handleCardClick}
                      onAddCard={handleAddCard}
                      onEditList={handleEditList}
                      onArchiveList={handleArchiveList}
                      isDragging={isMoving}
                    />
                  ))}

                {/* Add List Section */}
                <div className={classes.addListSection}>
                  {isAddingList ? (
                    <Paper className={classes.addListForm} p="md">
                      <Stack gap="xs">
                        <input
                          type="text"
                          placeholder="Enter list title..."
                          value={newListTitle}
                          onChange={(e) => setNewListTitle(e.target.value)}
                          onKeyDown={handleKeyPress}
                          className={classes.addListInput}
                          autoFocus
                        />
                        <Group gap="xs">
                          <Button size="xs" onClick={handleAddList} disabled={!newListTitle.trim()}>
                            Add list
                          </Button>
                          <Button 
                            size="xs" 
                            variant="subtle" 
                            onClick={() => {
                              setIsAddingList(false);
                              setNewListTitle('');
                            }}
                          >
                            Cancel
                          </Button>
                        </Group>
                      </Stack>
                    </Paper>
                  ) : (
                    <Button
                      variant="light"
                      color="gray"
                      leftSection={<IconPlus size={16} />}
                      onClick={() => setIsAddingList(true)}
                      className={classes.addListButton}
                      size="md"
                    >
                      Add another list
                    </Button>
                  )}
                </div>

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>

      {/* Card Detail Modal - Placeholder for now */}
      {selectedCard && (
        <div className={classes.modalOverlay} onClick={() => setSelectedCard(null)}>
          <Paper className={classes.modalContent} onClick={(e) => e.stopPropagation()}>
            <Title order={3}>{selectedCard.title}</Title>
            <Text>{selectedCard.description || 'No description'}</Text>
            <Button onClick={() => setSelectedCard(null)}>Close</Button>
          </Paper>
        </div>
      )}
    </Container>
  );
}
