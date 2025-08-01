import { NextRequest, NextResponse } from 'next/server';
import { createProtectedHandler, requirePermission } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { sendCommentNotification } from '@/lib/notification-service';

// GET /api/content/[id]/comment - Get all comments for a content
export const GET = createProtectedHandler(async (req) => {
  const contentId = req.nextUrl.pathname.split('/')[3]; // Extract content ID from URL
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const sort = searchParams.get('sort') || 'newest';
  const skip = (page - 1) * limit;

  if (!contentId) {
    return NextResponse.json(
      { error: 'Content ID is required' },
      { status: 400 }
    );
  }

  try {
    // Check if content exists
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Get top-level comments (no parentId)
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          contentId,
          parentId: null, // Only top-level comments
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
              createdAt: sort === 'newest' ? 'desc' : 'asc',
            },
          },
        },
        orderBy: {
          createdAt: sort === 'newest' ? 'desc' : 'asc',
        },
        skip,
        take: limit,
      }),
      prisma.comment.count({
        where: {
          contentId,
          parentId: null, // Only count top-level comments
        },
      }),
    ]);

    return NextResponse.json({
      comments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.CONTENT_VIEW));

// POST /api/content/[id]/comment - Create a new comment
export const POST = createProtectedHandler(async (req) => {
  const contentId = req.nextUrl.pathname.split('/')[3]; // Extract content ID from URL

  if (!contentId) {
    return NextResponse.json(
      { error: 'Content ID is required' },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { commentText, parentId } = body;

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

    // Check if content exists
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // If parentId is provided, check if parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment || parentComment.contentId !== contentId) {
        return NextResponse.json(
          {
            error:
              'Parent comment not found or does not belong to this content',
          },
          { status: 400 }
        );
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        commentText,
        contentId,
        userId: req.user!.id,
        parentId,
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

    // Create activity record for comment
    await prisma.contentActivity.create({
      data: {
        contentId,
        userId: req.user!.id,
        action: 'COMMENT_ADDED',
        details: `Comment added: ${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}`,
      },
    });

    // Send notification to content author (if not the commenter)
    if (content.authorId !== req.user!.id) {
      await sendCommentNotification(contentId, comment.id, req.user!.id);
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.CONTENT_COMMENT));
