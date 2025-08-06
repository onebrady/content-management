import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withRateLimit } from '@/lib/middleware/auth';
import {
  handleApiError,
  createSuccessResponse,
  throwError,
} from '@/lib/utils/error-handler';
import { z } from 'zod';

// Validation schema for updating lists
const updateListSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long').optional(),
  archived: z.boolean().optional(),
});

/**
 * PATCH /api/lists/[listId]
 * Update list properties
 */
export async function PATCH(
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
    const validatedData = updateListSchema.parse(body);

    // Update the list
    const updatedList = await prisma.projectList.update({
      where: { id: listId },
      data: validatedData,
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
            _count: {
              select: {
                comments: true,
                checklists: true,
                attachments: true,
              },
            },
          },
        },
      },
    });

    return createSuccessResponse(updatedList);
  } catch (error) {
    console.error('Update List API Error:', error);
    
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
 * DELETE /api/lists/[listId]
 * Archive a list (soft delete)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { listId: string } }
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

    // Archive the list and all its cards using BoardUtils
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
    });

    return createSuccessResponse({ message: 'List archived successfully' });
  } catch (error) {
    console.error('Delete List API Error:', error);
    return handleApiError(error);
  }
}
