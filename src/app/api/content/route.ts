import { NextRequest, NextResponse } from 'next/server';
import {
  createProtectedHandler,
  requirePermission,
  requireAnyPermission,
} from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { ContentType, ContentStatus, Priority } from '@prisma/client';

// GET /api/content - List all content
export const GET = createProtectedHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') as ContentStatus | null;
  const type = searchParams.get('type') as ContentType | null;
  const authorId = searchParams.get('authorId') || '';

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
          _count: {
            select: {
              comments: true,
              approvals: true,
              attachments: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
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
    const requestData = await req.json();
    const {
      title,
      body: contentBody,
      type,
      priority,
      dueDate,
      assigneeId,
      tags,
    } = requestData;

    // Validate required fields
    if (!title || !contentBody || !type) {
      return NextResponse.json(
        { error: 'Title, body, and type are required' },
        { status: 400 }
      );
    }

    // Create content
    const content = await prisma.content.create({
      data: {
        title,
        body: contentBody, // Store the HTML content directly
        type,
        priority: priority || Priority.MEDIUM,
        dueDate: dueDate ? new Date(dueDate) : null,
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

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.CONTENT_CREATE));
