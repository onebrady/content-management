import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withRateLimit } from '@/lib/middleware/auth';
import {
  handleApiError,
  createSuccessResponse,
  throwError,
} from '@/lib/utils/error-handler';
import { z } from 'zod';

// Validation schema for updating checklists
const updateChecklistSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  position: z.number().min(0).optional(),
});

/**
 * GET /api/checklists/[checklistId]
 * Get a specific checklist with all items
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { checklistId: string } }
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
    const checklistId = params.checklistId;

    // Get the checklist and check permissions
    const checklist = await prisma.projectChecklist.findUnique({
      where: { id: checklistId },
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

    if (!checklist) {
      return NextResponse.json(
        { error: 'Checklist not found' },
        { status: 404 }
      );
    }

    // Check if user has read access to this project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId: checklist.card.list.projectId,
        userId: auth.user.id,
      },
    });

    // Allow access if user is owner, member, or project is public
    if (
      !projectMember && 
      checklist.card.list.project.ownerId !== auth.user.id && 
      checklist.card.list.project.visibility !== 'PUBLIC'
    ) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return createSuccessResponse(checklist);
  } catch (error) {
    console.error('Get Checklist API Error:', error);
    return handleApiError(error);
  }
}

/**
 * PATCH /api/checklists/[checklistId]
 * Update checklist properties
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { checklistId: string } }
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
    const checklistId = params.checklistId;

    // Get the checklist and check permissions
    const checklist = await prisma.projectChecklist.findUnique({
      where: { id: checklistId },
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
    });

    if (!checklist) {
      return NextResponse.json(
        { error: 'Checklist not found' },
        { status: 404 }
      );
    }

    // Check if user has write access to this project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId: checklist.card.list.projectId,
        userId: auth.user.id,
      },
    });

    // Allow access if user is owner or project member
    if (!projectMember && checklist.card.list.project.ownerId !== auth.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = updateChecklistSchema.parse(body);

    // Update the checklist
    const updatedChecklist = await prisma.projectChecklist.update({
      where: { id: checklistId },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.position !== undefined && { position: validatedData.position }),
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

    return createSuccessResponse(updatedChecklist);
  } catch (error) {
    console.error('Update Checklist API Error:', error);
    
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
 * DELETE /api/checklists/[checklistId]
 * Delete a checklist and all its items
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { checklistId: string } }
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
    const checklistId = params.checklistId;

    // Get the checklist and check permissions
    const checklist = await prisma.projectChecklist.findUnique({
      where: { id: checklistId },
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
    });

    if (!checklist) {
      return NextResponse.json(
        { error: 'Checklist not found' },
        { status: 404 }
      );
    }

    // Check if user has write access to this project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId: checklist.card.list.projectId,
        userId: auth.user.id,
      },
    });

    // Allow access if user is owner or project member
    if (!projectMember && checklist.card.list.project.ownerId !== auth.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Delete the checklist (cascades to items)
    await prisma.projectChecklist.delete({
      where: { id: checklistId },
    });

    return createSuccessResponse({ message: 'Checklist deleted successfully' });
  } catch (error) {
    console.error('Delete Checklist API Error:', error);
    return handleApiError(error);
  }
}
