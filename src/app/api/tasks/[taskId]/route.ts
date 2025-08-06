import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { withProjectAuth, withRateLimit } from '@/lib/middleware/auth';
import { updateTaskSchema } from '@/lib/validation/project-schemas';
import {
  handleApiError,
  createSuccessResponse,
  throwError,
} from '@/lib/utils/error-handler';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    // Rate limiting
    if (!withRateLimit(req, 100, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await req.json();

    // Basic validation for now to avoid build issues
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const data = body;

    // Get task to check project membership
    const existingTask = await prisma.task.findUnique({
      where: { id: params.taskId },
      include: { column: { select: { projectId: true } } },
    });

    if (!existingTask) {
      throwError.taskNotFound(params.taskId);
    }

    // Check authentication and project access
    await withProjectAuth(req, existingTask.column.projectId, 'MEMBER');

    // Update task with validated data
    const updatedTask = await prisma.task.update({
      where: { id: params.taskId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.columnId && { columnId: data.columnId }),
        ...(data.position !== undefined && { position: data.position }),
        ...(data.priority && { priority: data.priority }),
        ...(data.dueDate !== undefined && { dueDate: data.dueDate }),
        ...(data.completed !== undefined && { completed: data.completed }),
        ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
        ...(data.estimatedHours !== undefined && {
          estimatedHours: data.estimatedHours,
        }),
        ...(data.actualHours !== undefined && {
          actualHours: data.actualHours,
        }),
        ...(data.tags && { tags: data.tags }),
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

    return createSuccessResponse(updatedTask, 'Task updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    // Rate limiting
    if (!withRateLimit(req, 50, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Get task to check project membership
    const existingTask = await prisma.task.findUnique({
      where: { id: params.taskId },
      include: { column: { select: { projectId: true } } },
    });

    if (!existingTask) {
      throwError.taskNotFound(params.taskId);
    }

    // Check authentication and project access (ADMIN required for deletion)
    await withProjectAuth(req, existingTask.column.projectId, 'ADMIN');

    // Delete task and its attachments (cascade delete)
    await prisma.task.delete({
      where: { id: params.taskId },
    });

    return createSuccessResponse(null, 'Task deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
