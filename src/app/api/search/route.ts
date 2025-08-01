import { NextRequest, NextResponse } from 'next/server';
import { createProtectedHandler, requirePermission } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { ContentStatus, ContentType, Priority } from '@prisma/client';

// GET /api/search - Search content with advanced filtering
export const GET = createProtectedHandler(async (req) => {
  try {
    const { searchParams } = new URL(req.url);

    // Parse search parameters
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Parse filters
    const status = searchParams.getAll('status');
    const types = searchParams.getAll('type');
    const priorities = searchParams.getAll('priority');
    const tags = searchParams.getAll('tag');
    const author = searchParams.get('author');
    const assignee = searchParams.get('assignee');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause for search and filters
    const where: any = {};

    // Text search
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { body: { path: ['content'], string_contains: query } }, // Search in JSON body
      ];
    }

    // Status filter
    if (status.length > 0) {
      where.status = { in: status as ContentStatus[] };
    }

    // Type filter
    if (types.length > 0) {
      where.type = { in: types as ContentType[] };
    }

    // Priority filter
    if (priorities.length > 0) {
      where.priority = { in: priorities as Priority[] };
    }

    // Tags filter
    if (tags.length > 0) {
      where.tags = {
        some: {
          name: { in: tags },
        },
      };
    }

    // Author filter
    if (author) {
      where.authorId = author;
    }

    // Assignee filter
    if (assignee) {
      where.assigneeId = assignee;
    }

    // Date range filter
    if (startDate || endDate) {
      where.updatedAt = {};

      if (startDate) {
        where.updatedAt.gte = new Date(startDate);
      }

      if (endDate) {
        where.updatedAt.lte = new Date(endDate);
      }
    }

    // Execute search query with count
    const [results, total] = await Promise.all([
      prisma.content.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          tags: true,
          _count: {
            select: {
              comments: true,
              approvals: true,
              attachments: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.content.count({ where }),
    ]);

    // Format response
    return NextResponse.json({
      results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.CONTENT_VIEW));
