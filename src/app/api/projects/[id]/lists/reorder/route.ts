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

// Validation schema for reordering lists
const reorderListsSchema = z.object({
  listOrders: z.array(
    z.object({
      id: z.string(),
      position: z.number().min(0),
    })
  ).min(1, 'At least one list order is required'),
});

/**
 * PATCH /api/projects/[id]/lists/reorder
 * Reorder lists within a project
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
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
    const projectId = params.id;

    // Check if user has write access to this project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: auth.user.id,
      },
    });

    // If not a member, check if user is the owner
    if (!projectMember) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true },
      });

      if (!project || project.ownerId !== auth.user.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = reorderListsSchema.parse(body);

    // Verify all lists belong to this project
    const listIds = validatedData.listOrders.map(order => order.id);
    const existingLists = await prisma.projectList.findMany({
      where: {
        id: { in: listIds },
        projectId,
        archived: false,
      },
      select: { id: true },
    });

    if (existingLists.length !== listIds.length) {
      return NextResponse.json(
        { error: 'One or more lists not found or do not belong to this project' },
        { status: 400 }
      );
    }

    // Reorder lists using BoardUtils
    await BoardUtils.moveLists(projectId, validatedData.listOrders);

    // Get updated lists to return
    const updatedLists = await prisma.projectList.findMany({
      where: {
        projectId,
        archived: false,
      },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        title: true,
        position: true,
        _count: {
          select: {
            cards: {
              where: { archived: false },
            },
          },
        },
      },
    });

    return createSuccessResponse({
      message: 'Lists reordered successfully',
      lists: updatedLists,
    });
  } catch (error) {
    console.error('Reorder Lists API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return handleApiError(error);
  }
}
