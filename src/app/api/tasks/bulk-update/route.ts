import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRateLimit } from '@/lib/middleware/auth';
import {
  bulkUpdateTasksSchema,
  bulkPositionUpdateSchema,
} from '@/lib/validation/project-schemas';
import {
  handleApiError,
  createSuccessResponse,
  throwError,
} from '@/lib/utils/error-handler';

export async function PATCH(req: NextRequest) {
  try {
    // Rate limiting
    if (!withRateLimit(req, 50, 15 * 60 * 1000)) {
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
    if (!body || !Array.isArray(body.taskIds) || !body.updates) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { taskIds, updates } = body;

    // Get all tasks and their project IDs to verify permissions
    const tasks = await prisma.task.findMany({
      where: {
        id: { in: taskIds },
      },
      include: {
        column: {
          select: {
            projectId: true,
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
        },
      },
    });

    if (tasks.length !== taskIds.length) {
      throwError.notFound('One or more tasks not found');
    }

    // Check permissions for all projects involved
    const projectIds = new Set(tasks.map((task) => task.column.projectId));

    for (const projectId of projectIds) {
      const task = tasks.find((t) => t.column.projectId === projectId);
      if (!task) continue;

      const project = task.column.project;
      const isOwner = project.ownerId === auth.user.id;
      const isMember = project.members.some((member) =>
        ['MEMBER', 'ADMIN'].includes(member.role)
      );

      if (!isOwner && !isMember) {
        throwError.forbidden(
          'Insufficient permissions for one or more projects'
        );
      }
    }

    // Perform bulk update using transaction for consistency
    const updatedTasks = await prisma.$transaction(async (tx) => {
      const updatePromises = taskIds.map((taskId) =>
        tx.task.update({
          where: { id: taskId },
          data: {
            ...(updates.columnId && { columnId: updates.columnId }),
            ...(updates.position !== undefined && {
              position: updates.position,
            }),
            ...(updates.priority && { priority: updates.priority }),
            ...(updates.dueDate !== undefined && { dueDate: updates.dueDate }),
            ...(updates.completed !== undefined && {
              completed: updates.completed,
            }),
            ...(updates.assigneeId !== undefined && {
              assigneeId: updates.assigneeId,
            }),
            ...(updates.estimatedHours !== undefined && {
              estimatedHours: updates.estimatedHours,
            }),
            ...(updates.actualHours !== undefined && {
              actualHours: updates.actualHours,
            }),
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
        })
      );

      return Promise.all(updatePromises);
    });

    return createSuccessResponse(
      {
        tasks: updatedTasks,
        updatedCount: updatedTasks.length,
      },
      `Successfully updated ${updatedTasks.length} tasks`
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    if (!withRateLimit(req, 30, 15 * 60 * 1000)) {
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
    if (!body || !Array.isArray(body.updates)) {
      return NextResponse.json(
        { error: 'Updates array is required' },
        { status: 400 }
      );
    }

    const { updates } = body;

    // Get all tasks to verify permissions
    const taskIds = updates.map((update: any) => update.taskId);
    const tasks = await prisma.task.findMany({
      where: {
        id: { in: taskIds },
      },
      include: {
        column: {
          select: {
            projectId: true,
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
        },
      },
    });

    if (tasks.length !== taskIds.length) {
      throwError.notFound('One or more tasks not found');
    }

    // Check permissions
    const projectIds = new Set(tasks.map((task) => task.column.projectId));

    for (const projectId of projectIds) {
      const task = tasks.find((t) => t.column.projectId === projectId);
      if (!task) continue;

      const project = task.column.project;
      const isOwner = project.ownerId === auth.user.id;
      const isMember = project.members.some((member) =>
        ['MEMBER', 'ADMIN'].includes(member.role)
      );

      if (!isOwner && !isMember) {
        throwError.forbidden(
          'Insufficient permissions for one or more projects'
        );
      }
    }

    // Perform bulk position updates
    const updatePromises = updates.map((update: any) =>
      prisma.task.update({
        where: { id: update.taskId },
        data: {
          ...(update.columnId && { columnId: update.columnId }),
          ...(update.position !== undefined && { position: update.position }),
        },
      })
    );

    const updatedTasks = await prisma.$transaction(updatePromises);

    return createSuccessResponse(
      {
        tasks: updatedTasks,
        updatedCount: updatedTasks.length,
      },
      `Successfully updated positions for ${updatedTasks.length} tasks`
    );
  } catch (error) {
    return handleApiError(error);
  }
}
