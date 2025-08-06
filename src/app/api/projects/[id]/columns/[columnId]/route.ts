import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { withProjectAuth, withRateLimit } from '@/lib/middleware/auth';
import {
  handleApiError,
  createSuccessResponse,
  throwError,
} from '@/lib/utils/error-handler';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; columnId: string } }
) {
  try {
    // Rate limiting
    if (!withRateLimit(req, 50, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Authentication and project access check (ADMIN required to manage columns)
    await withProjectAuth(req, params.id, 'ADMIN');

    // Parse request body
    const body = await req.json();
    const { title, color } = body;

    // Check if column exists and belongs to the project
    const existingColumn = await prisma.column.findFirst({
      where: {
        id: params.columnId,
        projectId: params.id,
      },
    });

    if (!existingColumn) {
      throwError.columnNotFound(params.columnId);
    }

    // Update the column
    const updatedColumn = await prisma.column.update({
      where: { id: params.columnId },
      data: {
        ...(title && { title }),
        ...(color && { color }),
      },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    return createSuccessResponse(updatedColumn, 'Column updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; columnId: string } }
) {
  try {
    // Rate limiting
    if (!withRateLimit(req, 20, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Authentication and project access check (ADMIN required to manage columns)
    await withProjectAuth(req, params.id, 'ADMIN');

    // Check if column exists and belongs to the project
    const existingColumn = await prisma.column.findFirst({
      where: {
        id: params.columnId,
        projectId: params.id,
      },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    if (!existingColumn) {
      throwError.columnNotFound(params.columnId);
    }

    // Check if column has tasks
    if (existingColumn._count.tasks > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete column with tasks',
          message:
            'Please move or delete all tasks before deleting this column',
        },
        { status: 400 }
      );
    }

    // Check if this is the last column in the project
    const columnCount = await prisma.column.count({
      where: { projectId: params.id },
    });

    if (columnCount <= 1) {
      return NextResponse.json(
        {
          error: 'Cannot delete the last column',
          message: 'A project must have at least one column',
        },
        { status: 400 }
      );
    }

    // Delete the column
    await prisma.column.delete({
      where: { id: params.columnId },
    });

    return createSuccessResponse(null, 'Column deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
