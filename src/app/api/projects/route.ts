import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRateLimit } from '@/lib/middleware/auth';
import { createProjectSchema } from '@/lib/validation/project-schemas';
import {
  handleApiError,
  createSuccessResponse,
  throwError,
} from '@/lib/utils/error-handler';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    if (!withRateLimit(req, 20, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Authentication
    const auth = await withAuth(req);

    // Verify user exists in database
    const userExists = await prisma.user.findUnique({
      where: { id: auth.user.id },
    });

    if (!userExists) {
      console.error('User not found in database:', auth.user.id);
      return NextResponse.json(
        { error: 'User account not found. Please contact support.' },
        { status: 400 }
      );
    }

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
      color = 'blue',
      defaultColumns = [
        { title: 'To Do', color: 'gray' },
        { title: 'In Progress', color: 'blue' },
        { title: 'Done', color: 'green' },
      ],
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Project title is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(defaultColumns) || defaultColumns.length === 0) {
      return NextResponse.json(
        { error: 'At least one default column is required' },
        { status: 400 }
      );
    }

    if (defaultColumns.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 columns allowed per project' },
        { status: 400 }
      );
    }

    // Validate column structure
    for (const column of defaultColumns) {
      if (!column.title || typeof column.title !== 'string') {
        return NextResponse.json(
          { error: 'Each column must have a valid title' },
          { status: 400 }
        );
      }
    }

    // Create project with columns in a transaction
    const newProject = await prisma.$transaction(async (tx) => {
      try {
        // Create the project
        const project = await tx.project.create({
          data: {
            title,
            description,
            color,
            ownerId: auth.user.id,
          },
        });

        console.log('Project created successfully:', project.id);

        // Create the default columns
        const columns = await Promise.all(
          defaultColumns.map((column, index) =>
            tx.column.create({
              data: {
                title: column.title,
                color: column.color || 'gray',
                position: (index + 1) * 1000,
                projectId: project.id,
              },
            })
          )
        );

        return {
          ...project,
          columns,
          members: [],
          owner: {
            id: auth.user.id,
            name: auth.user.name,
            email: auth.user.email,
          },
        };
      } catch (transactionError) {
        console.error(
          'Transaction error during project creation:',
          transactionError
        );
        throw transactionError;
      }
    });

    return createSuccessResponse(
      newProject,
      'Project created successfully',
      201
    );
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
    const search = searchParams.get('search');
    const archived = searchParams.get('archived');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    // Build where clause
    const where: any = {
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
    };

    if (search) {
      where.AND = [
        where.OR ? { OR: where.OR } : {},
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
      delete where.OR;
    }

    if (archived !== null && archived !== undefined) {
      where.archived = archived === 'true';
    }

    // Get projects with pagination
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          columns: {
            include: {
              _count: {
                select: {
                  tasks: true,
                },
              },
            },
            orderBy: {
              position: 'asc',
            },
          },
          _count: {
            select: {
              columns: true,
            },
          },
        },
        orderBy: [{ archived: 'asc' }, { updatedAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return createSuccessResponse({
      projects,
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
