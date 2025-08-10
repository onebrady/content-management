import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withRateLimit } from '@/lib/middleware/auth';
import {
  handleApiError,
  createSuccessResponse,
  throwError,
} from '@/lib/utils/error-handler';
import { z } from 'zod';

// Validation schema for creating checklists
const createChecklistSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  position: z.number().min(0).optional(),
});

/**
 * POST /api/cards/[cardId]/checklists
 * Create a new checklist for a card
 */
export async function POST(
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

    if (card.archived) {
      return NextResponse.json(
        { error: 'Cannot add checklists to archived card' },
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
    if (
      !projectMember &&
      card.list.project.ownerId !== auth.user.id &&
      (auth as any)?.user?.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = createChecklistSchema.parse(body);

    // Get next position if not provided
    let position = validatedData.position;
    if (position === undefined) {
      const lastChecklist = await prisma.projectChecklist.findFirst({
        where: { cardId },
        orderBy: { position: 'desc' },
      });
      position = lastChecklist ? lastChecklist.position + 1000 : 1000;
    }

    // Create the checklist
    const newChecklist = await prisma.projectChecklist.create({
      data: {
        title: validatedData.title,
        position,
        cardId,
      },
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
    });

    return createSuccessResponse(newChecklist, 201);
  } catch (error) {
    console.error('Create Checklist API Error:', error);

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
 * GET /api/cards/[cardId]/checklists
 * Get all checklists for a card
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
    const card = await prisma.projectCard.findUnique({
      where: { id: cardId },
      include: {
        list: {
          include: {
            project: {
              select: { ownerId: true, visibility: true },
            },
          },
        },
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Check if user has read access to this project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId: card.list.projectId,
        userId: auth.user.id,
      },
    });

    // Allow access if user is owner, member, or project is public
    if (
      !projectMember &&
      card.list.project.ownerId !== auth.user.id &&
      card.list.project.visibility !== 'PUBLIC' &&
      (auth as any)?.user?.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get checklists with full details
    const checklists = await prisma.projectChecklist.findMany({
      where: { cardId },
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
    });

    return createSuccessResponse(checklists);
  } catch (error) {
    console.error('Get Checklists API Error:', error);
    return handleApiError(error);
  }
}
