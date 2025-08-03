import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import {
  createProtectedHandler,
  requirePermission,
  requireAnyPermission,
} from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { ContentType, ContentStatus, Priority } from '@prisma/client';
import { generateUniqueSlug } from '@/lib/slug';

// GET /api/content - List all content
export const GET = createProtectedHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') as ContentStatus | null;
  const type = searchParams.get('type') as ContentType | null;
  const authorId = searchParams.get('authorId') || '';
  const sort = searchParams.get('sort') || 'updatedAt';
  const order = searchParams.get('order') || 'desc';

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { body: { path: ['content'], string_contains: search } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (type) {
    where.type = type;
  }

  if (authorId) {
    where.authorId = authorId;
  }

  // Build orderBy clause
  const orderBy: Prisma.ContentOrderByWithRelationInput = {};
  if (
    sort === 'createdAt' ||
    sort === 'updatedAt' ||
    sort === 'title' ||
    sort === 'type' ||
    sort === 'status'
  ) {
    orderBy[sort] = order as 'asc' | 'desc';
  } else {
    orderBy.updatedAt = 'desc';
  }

  try {
    const [content, total] = await Promise.all([
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
          attachments: true,
          _count: {
            select: {
              comments: true,
              approvals: true,
              attachments: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.content.count({ where }),
    ]);

    return NextResponse.json({
      content,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.CONTENT_VIEW));

// POST /api/content - Create new content
export const POST = createProtectedHandler(async (req) => {
  try {
    console.log('POST /api/content - Request received');
    console.log('User:', req.user);

    // Test database connection
    try {
      await prisma.$connect();
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const requestData = await req.json();
    console.log('Request data:', requestData);

    const {
      title,
      body: contentBody,
      type,
      priority,
      dueDate,
      assigneeId,
      tags,
      heroImage,
    } = requestData;

    // Validate required fields
    if (!title || !contentBody || !type) {
      console.log('Validation failed:', { title, contentBody, type });
      return NextResponse.json(
        { error: 'Title, body, and type are required' },
        { status: 400 }
      );
    }

    // Generate unique slug
    const existingSlugs = await prisma.content.findMany({
      select: { slug: true },
    });
    const slug = generateUniqueSlug(
      title,
      existingSlugs.map((c) => c.slug)
    );

    console.log('Creating content with data:', {
      title,
      slug,
      type,
      priority,
      dueDate,
      authorId: req.user!.id,
      assigneeId,
      tags,
      heroImage,
    });

    // Create content
    const content = await prisma.content.create({
      data: {
        title,
        slug,
        body: contentBody, // Store the HTML content directly
        type,
        priority: priority || Priority.MEDIUM,
        dueDate: dueDate ? new Date(dueDate) : null,
        heroImage: heroImage || null,
        authorId: req.user!.id,
        assigneeId: assigneeId || null,
        tags: tags
          ? {
              connect: tags.map((tagId: string) => ({ id: tagId })),
            }
          : undefined,
      },
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
      },
    });

    console.log('Content created successfully:', content);
    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'Failed to create content', details: error.message },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.CONTENT_CREATE));
