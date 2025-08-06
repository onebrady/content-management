import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { withProjectAuth, withRateLimit } from '@/lib/middleware/auth';
import {
  handleApiError,
  createSuccessResponse,
  throwError,
} from '@/lib/utils/error-handler';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    if (!withRateLimit(req, 100, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Authentication and project access check
    await withProjectAuth(req, params.id, 'VIEWER');

    // Get project members including the owner
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            role: 'desc', // ADMIN first, then MEMBER, then VIEWER
          },
        },
      },
    });

    if (!project) {
      throwError.projectNotFound(params.id);
    }

    // Combine owner and members
    const allMembers = [
      {
        id: 'owner',
        role: 'OWNER',
        userId: project.owner.id,
        user: project.owner,
        projectId: project.id,
      },
      ...project.members,
    ];

    return createSuccessResponse(allMembers);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    if (!withRateLimit(req, 20, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Authentication and project access check (ADMIN required to add members)
    await withProjectAuth(req, params.id, 'ADMIN');

    // Parse request body
    const body = await req.json();
    const { userId, role = 'MEMBER' } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!['VIEWER', 'MEMBER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: params.id,
          userId: userId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a project member' },
        { status: 409 }
      );
    }

    // Check if user is the project owner
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: { ownerId: true },
    });

    if (project?.ownerId === userId) {
      return NextResponse.json(
        { error: 'Project owner cannot be added as a member' },
        { status: 400 }
      );
    }

    // Add user as project member
    const newMember = await prisma.projectMember.create({
      data: {
        projectId: params.id,
        userId: userId,
        role: role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return createSuccessResponse(newMember, 'Member added successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
