import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withRateLimit } from '@/lib/middleware/auth';
import {
  handleApiError,
  createSuccessResponse,
  throwError,
} from '@/lib/utils/error-handler';
import { BoardUtils } from '@/lib/board-utils';
import { z } from 'zod';

// Validation schema for moving cards
const moveCardSchema = z.object({
  destinationListId: z.string().min(1, 'Destination list ID is required'),
  position: z.number().min(0, 'Position must be non-negative'),
});

/**
 * POST /api/cards/[cardId]/move
 * Move card to different list and/or position
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    // Rate limiting
    if (!withRateLimit(req, 30, 60 * 1000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Authentication
    const auth = await withAuth(req);
    const cardId = params.cardId;

    // Get the card and check permissions
    const card = await prisma.projectCard.findUnique({
      where: { id: cardId },
      include: {
        list: {
          include: {
            project: {
              select: { ownerId: true },
            },
          },
        },
      },
    });

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    if (card.archived) {
      return NextResponse.json(
        { error: 'Cannot move archived card' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = moveCardSchema.parse(body);
    const { destinationListId, position } = validatedData;

    // Get destination list and validate it exists and is in the same project
    const destinationList = await prisma.projectList.findUnique({
      where: { id: destinationListId },
      select: { 
        id: true, 
        projectId: true, 
        archived: true,
        project: {
          select: { ownerId: true },
        },
      },
    });

    if (!destinationList) {
      return NextResponse.json(
        { error: 'Destination list not found' },
        { status: 404 }
      );
    }

    if (destinationList.archived) {
      return NextResponse.json(
        { error: 'Cannot move card to archived list' },
        { status: 400 }
      );
    }

    // Ensure both lists are in the same project
    if (destinationList.projectId !== card.list.projectId) {
      return NextResponse.json(
        { error: 'Cannot move card between different projects' },
        { status: 400 }
      );
    }

    // Check if user has write access to this project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId: card.list.projectId,
        userId: auth.user.id,
      },
    });

    // Allow access if user is owner or project member
    if (!projectMember && card.list.project.ownerId !== auth.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Validate position doesn't exceed list length
    const cardsInDestinationList = await prisma.projectCard.count({
      where: {
        listId: destinationListId,
        archived: false,
        id: { not: cardId }, // Exclude the card being moved
      },
    });

    if (position > cardsInDestinationList) {
      return NextResponse.json(
        { error: `Position ${position} exceeds list length (${cardsInDestinationList})` },
        { status: 400 }
      );
    }

    // Move the card using BoardUtils
    await BoardUtils.moveCard(cardId, destinationListId, position);

    // Get the updated card with full details
    const updatedCard = await prisma.projectCard.findUnique({
      where: { id: cardId },
      include: {
        list: {
          select: {
            id: true,
            title: true,
            position: true,
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
        _count: {
          select: {
            comments: true,
            attachments: true,
            checklists: true,
          },
        },
      },
    });

    // Create activity record for the move
    await prisma.projectActivity.create({
      data: {
        action: 'CARD_MOVED',
        data: {
          cardTitle: updatedCard?.title,
          fromListId: card.listId,
          toListId: destinationListId,
          newPosition: position,
        },
        projectId: card.list.projectId,
        cardId: cardId,
        userId: auth.user.id,
      },
    });

    return createSuccessResponse({
      message: 'Card moved successfully',
      card: updatedCard,
    });
  } catch (error) {
    console.error('Move Card API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return handleApiError(error);
  }
}

/**
 * PATCH /api/cards/[cardId]/move
 * Alternative endpoint for moving cards (supports both POST and PATCH)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { cardId: string } }
) {
  // Delegate to POST handler for consistency
  return POST(req, { params });
}
