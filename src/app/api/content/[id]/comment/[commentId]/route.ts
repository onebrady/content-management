import { NextRequest, NextResponse } from 'next/server';
import { createProtectedHandler, requirePermission } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

// GET /api/content/[id]/comment/[commentId] - Get a specific comment
export const GET = createProtectedHandler(async (req) => {
  const pathParts = req.nextUrl.pathname.split('/');
  const contentId = pathParts[3];
  const commentId = pathParts[5];

  if (!contentId || !commentId) {
    return NextResponse.json(
      { error: 'Content ID and Comment ID are required' },
      { status: 400 }
    );
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        replies: {
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
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (comment.contentId !== contentId) {
      return NextResponse.json(
        { error: 'Comment does not belong to the specified content' },
        { status: 400 }
      );
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error fetching comment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comment' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.CONTENT_VIEW));

// PUT /api/content/[id]/comment/[commentId] - Update a comment
export const PUT = createProtectedHandler(async (req) => {
  const pathParts = req.nextUrl.pathname.split('/');
  const contentId = pathParts[3];
  const commentId = pathParts[5];

  if (!contentId || !commentId) {
    return NextResponse.json(
      { error: 'Content ID and Comment ID are required' },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { commentText } = body;

    // Validate required fields
    if (
      !commentText ||
      typeof commentText !== 'string' ||
      commentText.trim() === ''
    ) {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      );
    }

    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (existingComment.contentId !== contentId) {
      return NextResponse.json(
        { error: 'Comment does not belong to the specified content' },
        { status: 400 }
      );
    }

    // Check if user is the comment author
    if (existingComment.userId !== req.user!.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this comment' },
        { status: 403 }
      );
    }

    // Update comment
    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        commentText,
        updatedAt: new Date(),
      },
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
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.CONTENT_COMMENT));

// DELETE /api/content/[id]/comment/[commentId] - Delete a comment
export const DELETE = createProtectedHandler(async (req) => {
  const pathParts = req.nextUrl.pathname.split('/');
  const contentId = pathParts[3];
  const commentId = pathParts[5];

  if (!contentId || !commentId) {
    return NextResponse.json(
      { error: 'Content ID and Comment ID are required' },
      { status: 400 }
    );
  }

  try {
    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (existingComment.contentId !== contentId) {
      return NextResponse.json(
        { error: 'Comment does not belong to the specified content' },
        { status: 400 }
      );
    }

    // Check if user is the comment author or has admin/moderator role
    if (
      existingComment.userId !== req.user!.id &&
      !['ADMIN', 'MODERATOR'].includes(req.user!.role)
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this comment' },
        { status: 403 }
      );
    }

    // If this is a parent comment, delete all replies first
    if (!existingComment.parentId) {
      await prisma.comment.deleteMany({
        where: { parentId: commentId },
      });
    }

    // Delete comment
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.CONTENT_COMMENT));
