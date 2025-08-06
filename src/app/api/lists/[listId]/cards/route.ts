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

// Validation schema for creating cards
const createCardSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(5000, 'Description too long').optional(),
  position: z.number().min(0).optional(),
  dueDate: z.string().datetime().optional().or(z.date().optional()),
  assigneeIds: z.array(z.string()).optional(),
  labelIds: z.array(z.string()).optional(),
  contentId: z.string().optional(),
});

/**
 * POST /api/lists/[listId]/cards
 * Create a new card in a list
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { listId: string } }
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
    const listId = params.listId;

    // Get the list and check permissions
    const list = await prisma.projectList.findUnique({
      where: { id: listId },
      include: {
        project: {
          select: { ownerId: true },
        },
      },
    });

    if (!list) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    if (list.archived) {
      return NextResponse.json(
        { error: 'Cannot add cards to archived list' },
        { status: 400 }
      );
    }

    // Check if user has write access to this project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId: list.projectId,
        userId: auth.user.id,
      },
    });

    // Allow access if user is owner or project member
    if (!projectMember && list.project.ownerId !== auth.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = createCardSchema.parse(body);

    // Get next position if not provided
    const position = validatedData.position ?? await BoardUtils.getNextCardPosition(listId);

    // Parse due date if provided
    let dueDate: Date | null = null;
    if (validatedData.dueDate) {
      dueDate = typeof validatedData.dueDate === 'string' 
        ? new Date(validatedData.dueDate) 
        : validatedData.dueDate;
    }

    // Create the card with transaction for atomicity
    const newCard = await prisma.$transaction(async (tx) => {
      // Create the card
      const card = await tx.projectCard.create({
        data: {
          title: validatedData.title,
          description: validatedData.description || null,
          position,
          dueDate,
          listId,
          createdById: auth.user.id,
          contentId: validatedData.contentId || null,
        },
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
        },
      });

      // Add assignees if provided
      if (validatedData.assigneeIds && validatedData.assigneeIds.length > 0) {
        await Promise.all(
          validatedData.assigneeIds.map(userId =>
            tx.projectCardAssignee.create({
              data: {
                cardId: card.id,
                userId,
              },
            })
          )
        );

        // Refetch with assignees
        return await tx.projectCard.findUnique({
          where: { id: card.id },
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
          },
        });
      }

      return card;
    });

    return createSuccessResponse(newCard, 201);
  } catch (error) {
    console.error('Create Card API Error:', error);
    
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
 * GET /api/lists/[listId]/cards
 * Get all cards in a list
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { listId: string } }
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
    const listId = params.listId;

    // Get the list and check permissions
    const list = await prisma.projectList.findUnique({
      where: { id: listId },
      include: {
        project: {
          select: { ownerId: true, visibility: true },
        },
      },
    });

    if (!list) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    // Check if user has read access to this project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId: list.projectId,
        userId: auth.user.id,
      },
    });

    // Allow access if user is owner, member, or project is public
    if (
      !projectMember && 
      list.project.ownerId !== auth.user.id && 
      list.project.visibility !== 'PUBLIC'
    ) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get cards with full details
    const cards = await prisma.projectCard.findMany({
      where: {
        listId,
        archived: false,
      },
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
      },
    });

    return createSuccessResponse(cards);
  } catch (error) {
    console.error('Get Cards API Error:', error);
    return handleApiError(error);
  }
}
