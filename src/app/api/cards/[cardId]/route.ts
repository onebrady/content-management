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

// Validation schema for updating cards
const updateCardSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title too long')
    .optional(),
  description: z.string().max(5000, 'Description too long').optional(),
  completed: z.boolean().optional(),
  dueDate: z
    .string()
    .datetime()
    .optional()
    .or(z.date().optional())
    .or(z.null()),
  cover: z.string().url().optional().or(z.null()),
  archived: z.boolean().optional(),
  assigneeIds: z.array(z.string()).optional(),
  labelIds: z.array(z.string()).optional(),
  contentId: z.string().optional().or(z.null()),
});

/**
 * GET /api/cards/[cardId]
 * Get detailed card information
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    // Rate limiting
    if (!withRateLimit(req, 60, 60 * 1000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Authentication
    const auth = await withAuth(req);
    const cardId = params.cardId;

    // Get the card and check permissions
    const card = await BoardUtils.getCardDetails(cardId);

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Check if user has read access to this project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId: card.list.project.id,
        userId: auth.user.id,
      },
    });

    // Allow access if user is owner, member, or project is public
    if (!projectMember && card.list.project.ownerId !== auth.user.id) {
      // Check if project is public
      const project = await prisma.project.findUnique({
        where: { id: card.list.project.id },
        select: { visibility: true },
      });

      if (!project || project.visibility !== 'PUBLIC') {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    return createSuccessResponse(card);
  } catch (error) {
    console.error('Get Card API Error:', error);
    return handleApiError(error);
  }
}

/**
 * PATCH /api/cards/[cardId]
 * Update card properties
 */
export async function PATCH(
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
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Check if user has write access to this project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId: card.list.projectId,
        userId: auth.user.id,
      },
    });

    // Allow access if user is owner or project member
    if (
      !projectMember &&
      card.list.project.ownerId !== auth.user.id &&
      (auth as any)?.user?.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = updateCardSchema.parse(body);

    // Parse due date if provided
    let dueDate: Date | null = null;
    if (validatedData.dueDate !== undefined) {
      if (validatedData.dueDate === null) {
        dueDate = null;
      } else if (typeof validatedData.dueDate === 'string') {
        dueDate = new Date(validatedData.dueDate);
      } else {
        dueDate = validatedData.dueDate;
      }
    }

    // Update the card with transaction for atomicity
    const updatedCard = await prisma.$transaction(async (tx) => {
      // Prepare update data
      const updateData: any = {};

      if (validatedData.title !== undefined)
        updateData.title = validatedData.title;
      if (validatedData.description !== undefined)
        updateData.description = validatedData.description;
      if (validatedData.completed !== undefined)
        updateData.completed = validatedData.completed;
      if (validatedData.dueDate !== undefined) updateData.dueDate = dueDate;
      if (validatedData.cover !== undefined)
        updateData.cover = validatedData.cover;
      if (validatedData.archived !== undefined)
        updateData.archived = validatedData.archived;
      if (validatedData.contentId !== undefined)
        updateData.contentId = validatedData.contentId;

      // Update the card
      const card = await tx.projectCard.update({
        where: { id: cardId },
        data: updateData,
      });

      // Handle assignee updates
      if (validatedData.assigneeIds !== undefined) {
        // Remove all existing assignees
        await tx.projectCardAssignee.deleteMany({
          where: { cardId },
        });

        // Add new assignees
        if (validatedData.assigneeIds.length > 0) {
          await Promise.all(
            validatedData.assigneeIds.map((userId) =>
              tx.projectCardAssignee.create({
                data: {
                  cardId,
                  userId,
                },
              })
            )
          );
        }
      }

      // Get updated card with full details
      return await tx.projectCard.findUnique({
        where: { id: cardId },
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
          _count: {
            select: {
              comments: true,
              attachments: true,
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
    });

    return createSuccessResponse(updatedCard);
  } catch (error) {
    console.error('Update Card API Error:', error);

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
 * DELETE /api/cards/[cardId]
 * Archive a card (soft delete)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    // Rate limiting
    if (!withRateLimit(req, 20, 60 * 1000)) {
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
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Check if user has write access to this project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId: card.list.projectId,
        userId: auth.user.id,
      },
    });

    // Allow access if user is owner or project member
    if (
      !projectMember &&
      card.list.project.ownerId !== auth.user.id &&
      (auth as any)?.user?.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Archive the card using BoardUtils
    await BoardUtils.archiveCard(cardId);

    return createSuccessResponse({ message: 'Card archived successfully' });
  } catch (error) {
    console.error('Delete Card API Error:', error);
    return handleApiError(error);
  }
}
