import { NextRequest, NextResponse } from 'next/server';
import { createProtectedHandler, requirePermission } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { ContentStatus } from '@prisma/client';
import {
  canTransitionStatus,
  submitForReview,
  publishContent,
  returnToDraft,
} from '@/lib/approvals';
import {
  sendApprovalRequestNotifications,
  sendPublishedContentNotification,
} from '@/lib/notification-service';

// POST /api/content/[id]/workflow - Perform workflow actions on content
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
    const { action, reason } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Get content
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Check if user is author
    const isAuthor = content.authorId === req.user!.id;

    // Perform action based on request
    switch (action) {
      case 'submit_for_review':
        // Check permissions
        if (
          !canTransitionStatus(
            content.status as ContentStatus,
            'IN_REVIEW',
            req.user!.role as any,
            isAuthor
          )
        ) {
          return NextResponse.json(
            {
              error:
                'You do not have permission to submit this content for review',
            },
            { status: 403 }
          );
        }

        await submitForReview(contentId, req.user!.id);

        // Send notifications to approvers
        await sendApprovalRequestNotifications(contentId);
        break;

      case 'publish':
        // Check permissions
        if (
          !canTransitionStatus(
            content.status as ContentStatus,
            'PUBLISHED',
            req.user!.role as any,
            isAuthor
          )
        ) {
          return NextResponse.json(
            { error: 'You do not have permission to publish this content' },
            { status: 403 }
          );
        }

        await publishContent(contentId, req.user!.id);

        // Send notification to author
        await sendPublishedContentNotification(contentId, req.user!.id);
        break;

      case 'return_to_draft':
        // Check permissions
        if (
          !canTransitionStatus(
            content.status as ContentStatus,
            'DRAFT',
            req.user!.role as any,
            isAuthor
          )
        ) {
          return NextResponse.json(
            {
              error:
                'You do not have permission to return this content to draft',
            },
            { status: 403 }
          );
        }

        await returnToDraft(
          contentId,
          req.user!.id,
          reason || 'Returned to draft'
        );
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get updated content
    const updatedContent = await prisma.content.findUnique({
      where: { id: contentId },
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
    });

    return NextResponse.json({
      message: 'Workflow action completed successfully',
      content: updatedContent,
    });
  } catch (error: any) {
    console.error('Error performing workflow action:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to perform workflow action' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.CONTENT_EDIT));
