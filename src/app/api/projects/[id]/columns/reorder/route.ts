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
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    if (!withRateLimit(req, 30, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Authentication and project access check (ADMIN required to manage columns)
    await withProjectAuth(req, params.id, 'ADMIN');

    // Parse request body
    const body = await req.json();
    const { columnOrders } = body;

    if (!Array.isArray(columnOrders) || columnOrders.length === 0) {
      return NextResponse.json(
        { error: 'Column orders array is required' },
        { status: 400 }
      );
    }

    // Validate column orders structure
    for (const order of columnOrders) {
      if (!order.id || typeof order.position !== 'number') {
        return NextResponse.json(
          { error: 'Each column order must have id and position' },
          { status: 400 }
        );
      }
    }

    // Verify all columns belong to the project
    const columnIds = columnOrders.map((order: any) => order.id);
    const columns = await prisma.column.findMany({
      where: {
        id: { in: columnIds },
        projectId: params.id,
      },
    });

    if (columns.length !== columnIds.length) {
      return NextResponse.json(
        { error: 'Some columns do not belong to this project' },
        { status: 400 }
      );
    }

    // Update column positions in a transaction
    const updatePromises = columnOrders.map((order: any) =>
      prisma.column.update({
        where: { id: order.id },
        data: { position: order.position },
      })
    );

    const updatedColumns = await prisma.$transaction(updatePromises);

    return createSuccessResponse(
      updatedColumns,
      'Column order updated successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
