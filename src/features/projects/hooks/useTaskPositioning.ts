import { useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectKeys } from './queryKeys';

interface CardMoveUpdate {
  cardId: string;
  destinationListId: string;
  position: number;
}

interface ListMoveUpdate {
  listId: string;
  position: number;
}

interface TaskPositioningHook {
  moveCard: (
    cardId: string,
    sourceListId: string,
    destinationListId: string,
    position: number
  ) => Promise<void>;
  moveList: (listId: string, position: number) => Promise<void>;
  createCard: (listId: string, title: string) => Promise<void>;
  createList: (title: string) => Promise<void>;
  updateList: (listId: string, updates: { title?: string; archived?: boolean }) => Promise<void>;
  archiveList: (listId: string) => Promise<void>;
  isMoving: boolean;
}

/**
 * Hook for managing card and list positions with board operations
 */
export function useTaskPositioning(projectId: string): TaskPositioningHook {
  const queryClient = useQueryClient();
  const [isMoving, setIsMoving] = useState(false);

  /**
   * Move a card between lists or within the same list
   */
  const moveCard = useCallback(
    async (
      cardId: string,
      sourceListId: string,
      destinationListId: string,
      position: number
    ) => {
      setIsMoving(true);
      try {
        const response = await fetch(`/api/cards/${cardId}/move`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            destinationListId,
            position,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to move card');
        }

        // Invalidate project data to refetch
        await queryClient.invalidateQueries({
          queryKey: projectKeys.detail(projectId),
        });
      } catch (error) {
        console.error('Error moving card:', error);
        throw error;
      } finally {
        setIsMoving(false);
      }
    },
    [projectId, queryClient]
  );

  /**
   * Move a list to a new position
   */
  const moveList = useCallback(
    async (listId: string, position: number) => {
      setIsMoving(true);
      try {
        const response = await fetch(`/api/projects/${projectId}/lists/reorder`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            listOrders: [{ id: listId, position }],
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to move list');
        }

        // Invalidate project data to refetch
        await queryClient.invalidateQueries({
          queryKey: projectKeys.detail(projectId),
        });
      } catch (error) {
        console.error('Error moving list:', error);
        throw error;
      } finally {
        setIsMoving(false);
      }
    },
    [projectId, queryClient]
  );

  /**
   * Create a new card in a list
   */
  const createCard = useCallback(
    async (listId: string, title: string) => {
      try {
        const response = await fetch(`/api/lists/${listId}/cards`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title }),
        });

        if (!response.ok) {
          throw new Error('Failed to create card');
        }

        // Invalidate project data to refetch
        await queryClient.invalidateQueries({
          queryKey: projectKeys.detail(projectId),
        });
      } catch (error) {
        console.error('Error creating card:', error);
        throw error;
      }
    },
    [projectId, queryClient]
  );

  /**
   * Create a new list in the project
   */
  const createList = useCallback(
    async (title: string) => {
      try {
        const response = await fetch(`/api/projects/${projectId}/lists`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title }),
        });

        if (!response.ok) {
          throw new Error('Failed to create list');
        }

        // Invalidate project data to refetch
        await queryClient.invalidateQueries({
          queryKey: projectKeys.detail(projectId),
        });
      } catch (error) {
        console.error('Error creating list:', error);
        throw error;
      }
    },
    [projectId, queryClient]
  );

  /**
   * Update list properties (title, archived status)
   */
  const updateList = useCallback(
    async (listId: string, updates: { title?: string; archived?: boolean }) => {
      try {
        const response = await fetch(`/api/lists/${listId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error('Failed to update list');
        }

        // Invalidate project data to refetch
        await queryClient.invalidateQueries({
          queryKey: projectKeys.detail(projectId),
        });
      } catch (error) {
        console.error('Error updating list:', error);
        throw error;
      }
    },
    [projectId, queryClient]
  );

  /**
   * Archive a list (soft delete)
   */
  const archiveList = useCallback(
    async (listId: string) => {
      await updateList(listId, { archived: true });
    },
    [updateList]
  );

  return {
    moveCard,
    moveList,
    createCard,
    createList,
    updateList,
    archiveList,
    isMoving,
  };
}

/**
 * Utility functions for card and list position management
 */
export const boardPositionUtils = {
  /**
   * Calculate position for inserting a card at a specific index
   */
  calculateCardPosition: (cards: any[], targetIndex: number): number => {
    if (cards.length === 0) return 1000;
    
    const sortedCards = [...cards].sort((a, b) => a.position - b.position);
    
    // Insert at beginning
    if (targetIndex === 0) {
      const firstPosition = sortedCards[0]?.position || 1000;
      return firstPosition / 2;
    }
    
    // Insert at end
    if (targetIndex >= sortedCards.length) {
      const lastPosition = sortedCards[sortedCards.length - 1]?.position || 0;
      return lastPosition + 1000;
    }
    
    // Insert between cards
    const prevCard = sortedCards[targetIndex - 1];
    const nextCard = sortedCards[targetIndex];
    
    if (!prevCard) return nextCard.position / 2;
    if (!nextCard) return prevCard.position + 1000;
    
    return (prevCard.position + nextCard.position) / 2;
  },

  /**
   * Calculate position for inserting a list at a specific index
   */
  calculateListPosition: (lists: any[], targetIndex: number): number => {
    if (lists.length === 0) return 1000;
    
    const sortedLists = [...lists].sort((a, b) => a.position - b.position);
    
    // Insert at beginning
    if (targetIndex === 0) {
      const firstPosition = sortedLists[0]?.position || 1000;
      return firstPosition / 2;
    }
    
    // Insert at end
    if (targetIndex >= sortedLists.length) {
      const lastPosition = sortedLists[sortedLists.length - 1]?.position || 0;
      return lastPosition + 1000;
    }
    
    // Insert between lists
    const prevList = sortedLists[targetIndex - 1];
    const nextList = sortedLists[targetIndex];
    
    if (!prevList) return nextList.position / 2;
    if (!nextList) return prevList.position + 1000;
    
    return (prevList.position + nextList.position) / 2;
  },

  /**
   * Get the next available position for a new card
   */
  getNextCardPosition: (cards: any[]): number => {
    if (cards.length === 0) return 1000;
    const maxPosition = Math.max(...cards.map((card) => card.position));
    return maxPosition + 1000;
  },

  /**
   * Get the next available position for a new list
   */
  getNextListPosition: (lists: any[]): number => {
    if (lists.length === 0) return 1000;
    const maxPosition = Math.max(...lists.map((list) => list.position));
    return maxPosition + 1000;
  },
};
