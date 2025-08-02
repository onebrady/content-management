import { NextRequest, NextResponse } from 'next/server';
import {
  createProtectedHandler,
  requirePermission,
  requireAnyPermission,
} from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { ContentType, ContentStatus, Priority } from '@prisma/client';
import { createContentVersion } from '@/lib/versioning';

// GET /api/content/[id] - Get single content
export const GET = createProtectedHandler(async (req) => {
  const id = req.nextUrl.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json(
      { error: 'Content ID is required' },
      { status: 400 }
    );
  }

  try {
    const content = await prisma.content.findUnique({
      where: { id },
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
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        approvals: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        attachments: {
          orderBy: { createdAt: 'desc' },
        },
        versions: {
          orderBy: {
            versionNumber: 'desc',
          },
          take: 5, // Get only the most recent 5 versions
        },
        _count: {
          select: {
            comments: true,
            approvals: true,
            attachments: true,
            versions: true,
          },
        },
      },
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.CONTENT_VIEW));

// PUT /api/content/[id] - Update content
export const PUT = createProtectedHandler(async (req) => {
  const id = req.nextUrl.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json(
      { error: 'Content ID is required' },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const {
      title,
      body: contentBody,
      type,
      priority,
      dueDate,
      assigneeId,
      tags,
      status,
    } = body;

    // Check if content exists
    const existingContent = await prisma.content.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!existingContent) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Check permissions - only author or admin can edit
    const canEdit =
      req.user!.role === 'ADMIN' || existingContent.authorId === req.user!.id;
    if (!canEdit) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this content' },
        { status: 403 }
      );
    }

    // Create a version of the current state before updating
    await createContentVersion(
      id,
      req.user!.id,
      body.changeDescription || 'Content updated'
    );

    // Update content
    const updatedContent = await prisma.content.update({
      where: { id },
      data: {
        title,
        body: contentBody || undefined,
        type,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || null,
        status,
        tags: tags
          ? {
              set: [], // Clear existing tags
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
        versions: {
          orderBy: {
            versionNumber: 'desc',
          },
          take: 1,
        },
      },
    });

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.CONTENT_EDIT));

// DELETE /api/content/[id] - Delete content
export const DELETE = createProtectedHandler(async (req, context) => {
  const id = req.nextUrl.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json(
      { error: 'Content ID is required' },
      { status: 400 }
    );
  }

  try {
    // Check if content exists
    const existingContent = await prisma.content.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!existingContent) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Check permissions - only author or admin can delete
    const canDelete =
      req.user!.role === 'ADMIN' || existingContent.authorId === req.user!.id;
    if (!canDelete) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this content' },
        { status: 403 }
      );
    }

    // Delete content (cascade will handle related records)
    await prisma.content.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.CONTENT_DELETE));
