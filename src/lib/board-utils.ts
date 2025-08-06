import { PrismaClient, ProjectList, ProjectCard, ProjectChecklist, ProjectChecklistItem } from '@prisma/client';
import prisma from './prisma';

/**
 * Utility functions for board operations
 */
export class BoardUtils {
  /**
   * Get next position for a new list in a project
   */
  static async getNextListPosition(projectId: string): Promise<number> {
    const lastList = await prisma.projectList.findFirst({
      where: { projectId, archived: false },
      orderBy: { position: 'desc' },
    });
    
    return lastList ? lastList.position + 1 : 0;
  }

  /**
   * Get next position for a new card in a list
   */
  static async getNextCardPosition(listId: string): Promise<number> {
    const lastCard = await prisma.projectCard.findFirst({
      where: { listId, archived: false },
      orderBy: { position: 'desc' },
    });
    
    return lastCard ? lastCard.position + 1 : 0;
  }

  /**
   * Reorder cards when moving between lists
   */
  static async moveCard(
    cardId: string,
    destinationListId: string,
    newPosition: number
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Get the card to move
      const card = await tx.projectCard.findUnique({
        where: { id: cardId },
      });
      
      if (!card) {
        throw new Error('Card not found');
      }

      const sourceListId = card.listId;

      // If moving to different list, update positions in both lists
      if (sourceListId !== destinationListId) {
        // Decrease positions in source list (cards that were after the moved card)
        await tx.projectCard.updateMany({
          where: {
            listId: sourceListId,
            position: { gt: card.position },
            archived: false,
          },
          data: {
            position: { decrement: 1 },
          },
        });

        // Increase positions in destination list (cards at or after new position)
        await tx.projectCard.updateMany({
          where: {
            listId: destinationListId,
            position: { gte: newPosition },
            archived: false,
          },
          data: {
            position: { increment: 1 },
          },
        });
      } else {
        // Moving within same list
        if (newPosition > card.position) {
          // Moving down: decrease positions of cards between old and new position
          await tx.projectCard.updateMany({
            where: {
              listId: sourceListId,
              position: { gt: card.position, lte: newPosition },
              archived: false,
            },
            data: {
              position: { decrement: 1 },
            },
          });
        } else if (newPosition < card.position) {
          // Moving up: increase positions of cards between new and old position
          await tx.projectCard.updateMany({
            where: {
              listId: sourceListId,
              position: { gte: newPosition, lt: card.position },
              archived: false,
            },
            data: {
              position: { increment: 1 },
            },
          });
        }
      }

      // Update the moved card
      await tx.projectCard.update({
        where: { id: cardId },
        data: {
          listId: destinationListId,
          position: newPosition,
        },
      });
    });
  }

  /**
   * Reorder lists within a project
   */
  static async moveLists(projectId: string, listOrders: Array<{ id: string; position: number }>): Promise<void> {
    await prisma.$transaction(async (tx) => {
      for (const { id, position } of listOrders) {
        await tx.projectList.update({
          where: { id },
          data: { position },
        });
      }
    });
  }

  /**
   * Get complete board data with nested lists and cards
   */
  static async getBoardData(projectId: string) {
    return await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        lists: {
          where: { archived: false },
          orderBy: { position: 'asc' },
          include: {
            cards: {
              where: { archived: false },
              orderBy: { position: 'asc' },
              include: {
                assignees: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      },
                    },
                  },
                },
                labels: {
                  include: {
                    label: true,
                  },
                },
                checklists: {
                  orderBy: { position: 'asc' },
                  include: {
                    items: {
                      orderBy: { position: 'asc' },
                      include: {
                        assignee: {
                          select: {
                            id: true,
                            name: true,
                            email: true,
                          },
                        },
                      },
                    },
                  },
                },
                attachments: {
                  include: {
                    uploadedBy: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      },
                    },
                  },
                },
                _count: {
                  select: {
                    comments: true,
                  },
                },
              },
            },
          },
        },
        labels: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get card details with all relationships
   */
  static async getCardDetails(cardId: string) {
    return await prisma.projectCard.findUnique({
      where: { id: cardId },
      include: {
        list: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                ownerId: true,
              },
            },
          },
        },
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        labels: {
          include: {
            label: true,
          },
        },
        checklists: {
          orderBy: { position: 'asc' },
          include: {
            items: {
              orderBy: { position: 'asc' },
              include: {
                assignee: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        attachments: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        content: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Calculate checklist completion percentage for a card
   */
  static calculateChecklistProgress(checklists: Array<{
    items: Array<{ completed: boolean }>;
  }>): { completed: number; total: number; percentage: number } {
    const allItems = checklists.flatMap(checklist => checklist.items);
    const completed = allItems.filter(item => item.completed).length;
    const total = allItems.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  }

  /**
   * Archive a list and all its cards
   */
  static async archiveList(listId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Archive all cards in the list
      await tx.projectCard.updateMany({
        where: { listId },
        data: { archived: true },
      });

      // Archive the list
      await tx.projectList.update({
        where: { id: listId },
        data: { archived: true },
      });

      // Update positions of remaining lists
      const list = await tx.projectList.findUnique({
        where: { id: listId },
        select: { projectId: true, position: true },
      });

      if (list) {
        await tx.projectList.updateMany({
          where: {
            projectId: list.projectId,
            position: { gt: list.position },
            archived: false,
          },
          data: {
            position: { decrement: 1 },
          },
        });
      }
    });
  }

  /**
   * Archive a card and update positions
   */
  static async archiveCard(cardId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const card = await tx.projectCard.findUnique({
        where: { id: cardId },
        select: { listId: true, position: true },
      });

      if (!card) {
        throw new Error('Card not found');
      }

      // Archive the card
      await tx.projectCard.update({
        where: { id: cardId },
        data: { archived: true },
      });

      // Update positions of remaining cards
      await tx.projectCard.updateMany({
        where: {
          listId: card.listId,
          position: { gt: card.position },
          archived: false,
        },
        data: {
          position: { decrement: 1 },
        },
      });
    });
  }

  /**
   * Create default lists for a new project
   */
  static async createDefaultLists(projectId: string): Promise<ProjectList[]> {
    const defaultLists = [
      { title: 'To Do', position: 0 },
      { title: 'In Progress', position: 1 },
      { title: 'Review', position: 2 },
      { title: 'Done', position: 3 },
    ];

    const lists = await Promise.all(
      defaultLists.map(async (listData) =>
        prisma.projectList.create({
          data: {
            ...listData,
            projectId,
          },
        })
      )
    );

    return lists;
  }
}
