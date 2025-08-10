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
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    // Rate limiting
    if (!withRateLimit(req, 100, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Authentication and project access check
    await withProjectAuth(req, id, 'VIEWER');

    // Get project members including the owner
    const project = await prisma.project.findUnique({
      where: { id },
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
      throwError.projectNotFound(id);
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

// Remove a member via /api/projects/[id]/members?userId=...
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!withRateLimit(req, 20, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Allow ADMIN globally or any project member/owner to add members
    await withProjectAuth(req, id, 'VIEWER');

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await prisma.projectMember.delete({
      where: {
        projectId_userId: { projectId: id, userId },
      },
    });

    return createSuccessResponse({ success: true }, 'Member removed', 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    // Rate limiting
    if (!withRateLimit(req, 20, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Authentication and project access check (ADMIN required to add members)
    // Allow ADMIN globally or any project member/owner to update roles
    await withProjectAuth(req, id, 'VIEWER');

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
          projectId: id,
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
      where: { id },
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
        projectId: id,
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

// Update member role
export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!withRateLimit(req, 20, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Allow ADMIN globally or any project member/owner to update roles per simplified rules
    await withProjectAuth(req, id, 'VIEWER');
    const body = await req.json();
    const { userId, role } = body || {};
    if (!userId || !['VIEWER', 'MEMBER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const updated = await prisma.projectMember.update({
      where: {
        projectId_userId: { projectId: id, userId },
      },
      data: { role },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return createSuccessResponse(updated, 'Member role updated', 200);
  } catch (error) {
    return handleApiError(error);
  }
}
