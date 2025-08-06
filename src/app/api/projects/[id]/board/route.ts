import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withRateLimit } from '@/lib/middleware/auth';
import {
  handleApiError,
  createSuccessResponse,
  throwError,
} from '@/lib/utils/error-handler';
import { BoardUtils } from '@/lib/board-utils';

/**
 * GET /api/projects/[id]/board
 * Get complete board data with lists and cards
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
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
    const projectId = params.id;

    // Check if user has access to this project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: auth.user.id,
      },
    });

    // If not a member, check if user is the owner or if project is public
    if (!projectMember) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true, visibility: true },
      });

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      // Allow access if user is owner or project is public
      if (project.ownerId !== auth.user.id && project.visibility !== 'PUBLIC') {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Get complete board data
    const boardData = await BoardUtils.getBoardData(projectId);

    if (!boardData) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    return createSuccessResponse(boardData);
  } catch (error) {
    console.error('Board API Error:', error);
    return handleApiError(error);
  }
}
