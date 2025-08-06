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

// Validation schema for creating lists
const createListSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  position: z.number().optional(),
});

/**
 * POST /api/projects/[id]/lists
 * Create a new list in a project
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
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
    const validatedData = createListSchema.parse(body);

    // Get next position if not provided
    const position = validatedData.position ?? await BoardUtils.getNextListPosition(projectId);

    // Create the list
    const newList = await prisma.projectList.create({
      data: {
        title: validatedData.title,
        position,
        projectId,
      },
      include: {
        cards: {
          where: { archived: false },
          orderBy: { position: 'asc' },
        },
      },
    });

    return createSuccessResponse(newList, 201);
  } catch (error) {
    console.error('Create List API Error:', error);
    
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
 * GET /api/projects/[id]/lists
 * Get all lists for a project
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

      if (project.ownerId !== auth.user.id && project.visibility !== 'PUBLIC') {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Get lists with basic card counts
    const lists = await prisma.projectList.findMany({
      where: {
        projectId,
        archived: false,
      },
      orderBy: { position: 'asc' },
      include: {
        _count: {
          select: {
            cards: {
              where: { archived: false },
            },
          },
        },
      },
    });

    return createSuccessResponse(lists);
  } catch (error) {
    console.error('Get Lists API Error:', error);
    return handleApiError(error);
  }
}
