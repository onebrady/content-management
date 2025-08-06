import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withRateLimit } from '@/lib/middleware/auth';
import {
  handleApiError,
  createSuccessResponse,
  throwError,
} from '@/lib/utils/error-handler';
import { z } from 'zod';

// Validation schema for updating checklist items
const updateItemSchema = z.object({
  text: z.string().min(1, 'Text is required').max(500, 'Text too long').optional(),
  completed: z.boolean().optional(),
  position: z.number().min(0).optional(),
  assigneeId: z.string().optional().or(z.null()),
});

/**
 * GET /api/checklist-items/[itemId]
 * Get a specific checklist item
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { itemId: string } }
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
    const itemId = params.itemId;

    // Get the item and check permissions
    const item = await prisma.projectChecklistItem.findUnique({
      where: { id: itemId },
      include: {
        checklist: {
          include: {
            card: {
              include: {
                list: {
                  include: {
                    project: {
                      select: { ownerId: true, visibility: true },
                    },
                  },
                },
              },
            },
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Checklist item not found' },
        { status: 404 }
      );
    }

    // Check if user has read access to this project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId: item.checklist.card.list.projectId,
        userId: auth.user.id,
      },
    });

    // Allow access if user is owner, member, or project is public
    if (
      !projectMember && 
      item.checklist.card.list.project.ownerId !== auth.user.id && 
      item.checklist.card.list.project.visibility !== 'PUBLIC'
    ) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return createSuccessResponse(item);
  } catch (error) {
    console.error('Get Checklist Item API Error:', error);
    return handleApiError(error);
  }
}

/**
 * PATCH /api/checklist-items/[itemId]
 * Update checklist item properties
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { itemId: string } }
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
    const itemId = params.itemId;

    // Get the item and check permissions
    const item = await prisma.projectChecklistItem.findUnique({
      where: { id: itemId },
      include: {
        checklist: {
          include: {
            card: {
              include: {
                list: {
                  include: {
                    project: {
                      select: { ownerId: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Checklist item not found' },
        { status: 404 }
      );
    }

    // Check if user has write access to this project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId: item.checklist.card.list.projectId,
        userId: auth.user.id,
      },
    });

    // Allow access if user is owner or project member
    if (!projectMember && item.checklist.card.list.project.ownerId !== auth.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = updateItemSchema.parse(body);

    // Validate assignee if provided
    if (validatedData.assigneeId) {
      const assignee = await prisma.projectMember.findFirst({
        where: {
          projectId: item.checklist.card.list.projectId,
          userId: validatedData.assigneeId,
        },
      });

      if (!assignee) {
        return NextResponse.json(
          { error: 'Assignee is not a member of this project' },
          { status: 400 }
        );
      }
    }

    // Update the item
    const updatedItem = await prisma.projectChecklistItem.update({
      where: { id: itemId },
      data: {
        ...(validatedData.text && { text: validatedData.text }),
        ...(validatedData.completed !== undefined && { completed: validatedData.completed }),
        ...(validatedData.position !== undefined && { position: validatedData.position }),
        ...(validatedData.assigneeId !== undefined && { assigneeId: validatedData.assigneeId }),
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create activity record for completion toggle
    if (validatedData.completed !== undefined) {
      await prisma.projectActivity.create({
        data: {
          action: validatedData.completed ? 'CHECKLIST_ITEM_COMPLETED' : 'CHECKLIST_ITEM_UNCOMPLETED',
          data: {
            itemText: updatedItem.text,
            checklistId: item.checklistId,
            cardId: item.checklist.cardId,
          },
          projectId: item.checklist.card.list.projectId,
          cardId: item.checklist.cardId,
          userId: auth.user.id,
        },
      });
    }

    return createSuccessResponse(updatedItem);
  } catch (error) {
    console.error('Update Checklist Item API Error:', error);
    
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
 * DELETE /api/checklist-items/[itemId]
 * Delete a checklist item
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { itemId: string } }
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
    const itemId = params.itemId;

    // Get the item and check permissions
    const item = await prisma.projectChecklistItem.findUnique({
      where: { id: itemId },
      include: {
        checklist: {
          include: {
            card: {
              include: {
                list: {
                  include: {
                    project: {
                      select: { ownerId: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Checklist item not found' },
        { status: 404 }
      );
    }

    // Check if user has write access to this project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId: item.checklist.card.list.projectId,
        userId: auth.user.id,
      },
    });

    // Allow access if user is owner or project member
    if (!projectMember && item.checklist.card.list.project.ownerId !== auth.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Delete the item
    await prisma.projectChecklistItem.delete({
      where: { id: itemId },
    });

    return createSuccessResponse({ message: 'Checklist item deleted successfully' });
  } catch (error) {
    console.error('Delete Checklist Item API Error:', error);
    return handleApiError(error);
  }
}
