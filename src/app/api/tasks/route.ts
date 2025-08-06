import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRateLimit } from '@/lib/middleware/auth';
import { createTaskSchema } from '@/lib/validation/project-schemas';
import {
  handleApiError,
  createSuccessResponse,
  throwError,
} from '@/lib/utils/error-handler';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    if (!withRateLimit(req, 60, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Authentication
    const auth = await withAuth(req);

    // Parse request body
    const body = await req.json();

    // Basic validation
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      columnId,
      position,
      priority = 'MEDIUM',
      dueDate,
      assigneeId,
      estimatedHours,
      tags,
      projectId,
    } = body;

    // Validate required fields
    if (!title || !columnId || !projectId) {
      return NextResponse.json(
        { error: 'Title, columnId, and projectId are required' },
        { status: 400 }
      );
    }

    // Check if column exists and belongs to the project
    const column = await prisma.column.findFirst({
      where: {
        id: columnId,
        projectId: projectId,
      },
      include: {
        project: {
          select: {
            ownerId: true,
            members: {
              where: {
                userId: auth.user.id,
              },
              select: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!column) {
      throwError.notFound('Column not found');
    }

    // Check permissions
    const project = column.project;
    const isOwner = project.ownerId === auth.user.id;
    const isMember = project.members.some((member) =>
      ['MEMBER', 'ADMIN'].includes(member.role)
    );

    if (!isOwner && !isMember) {
      throwError.forbidden('Insufficient permissions');
    }

    // Validate assignee if provided
    if (assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId },
      });

      if (!assignee) {
        return NextResponse.json(
          { error: 'Assigned user not found' },
          { status: 400 }
        );
      }

      // Check if assignee is a project member
      const assigneeMembership = await prisma.projectMember.findFirst({
        where: {
          projectId: projectId,
          userId: assigneeId,
        },
      });

      if (!assigneeMembership && assigneeId !== project.ownerId) {
        return NextResponse.json(
          { error: 'Assigned user is not a project member' },
          { status: 400 }
        );
      }
    }

    // Calculate position if not provided
    let taskPosition = position;
    if (taskPosition === undefined) {
      const lastTask = await prisma.task.findFirst({
        where: { columnId },
        orderBy: { position: 'desc' },
        select: { position: true },
      });
      taskPosition = (lastTask?.position || 0) + 1000;
    }

    // Create the task
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        columnId,
        position: taskPosition,
        priority: priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId,
        estimatedHours,
        tags: tags || [],
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attachments: true,
      },
    });

    return createSuccessResponse(newTask, 'Task created successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    if (!withRateLimit(req, 100, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Authentication
    const auth = await withAuth(req);

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const columnId = searchParams.get('columnId');
    const assigneeId = searchParams.get('assigneeId');
    const priority = searchParams.get('priority');
    const completed = searchParams.get('completed');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    // Build where clause
    const where: any = {};

    if (projectId) {
      // Verify user has access to the project
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: auth.user.id },
            {
              members: {
                some: {
                  userId: auth.user.id,
                },
              },
            },
          ],
        },
      });

      if (!project) {
        throwError.forbidden('No access to this project');
      }

      where.column = { projectId };
    }

    if (columnId) {
      where.columnId = columnId;
    }

    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    if (priority) {
      where.priority = priority;
    }

    if (completed !== null && completed !== undefined) {
      where.completed = completed === 'true';
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ];
    }

    // Get tasks with pagination
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          attachments: true,
          column: {
            select: {
              id: true,
              title: true,
              projectId: true,
            },
          },
        },
        orderBy: [{ columnId: 'asc' }, { position: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return createSuccessResponse({
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
