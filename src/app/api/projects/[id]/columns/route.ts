import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { withProjectAuth, withRateLimit } from '@/lib/middleware/auth';
import {
  handleApiError,
  createSuccessResponse,
  throwError,
} from '@/lib/utils/error-handler';

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

    // Authentication and project access check (ADMIN required to manage columns)
    await withProjectAuth(req, params.id, 'ADMIN');

    // Parse request body
    const body = await req.json();
    const { title, color = '#6c757d' } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Column title is required' },
        { status: 400 }
      );
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        columns: {
          orderBy: { position: 'desc' },
          take: 1,
        },
      },
    });

    if (!project) {
      throwError.projectNotFound(params.id);
    }

    // Calculate position for new column (add at the end)
    const lastColumn = project.columns[0];
    const position = lastColumn ? lastColumn.position + 1000 : 1000;

    // Create the column
    const newColumn = await prisma.column.create({
      data: {
        title,
        color,
        position,
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

    return createSuccessResponse(newColumn, 'Column created successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}

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

    // Get project columns
    const columns = await prisma.column.findMany({
      where: { projectId: params.id },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: { position: 'asc' },
    });

    return createSuccessResponse(columns);
  } catch (error) {
    return handleApiError(error);
  }
}
