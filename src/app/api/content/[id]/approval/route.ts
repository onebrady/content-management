import { NextRequest, NextResponse } from 'next/server';
import { createProtectedHandler, requirePermission } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { ApprovalStatus } from '@prisma/client';
import { sendApprovalStatusNotification } from '@/lib/notification-service';

// GET /api/content/[id]/approval - Get all approvals for a content
export const GET = createProtectedHandler(async (req) => {
  const contentId = req.nextUrl.pathname.split('/')[3]; // Extract content ID from URL

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

    // Get all approvals for the content
    const approvals = await prisma.approval.findMany({
      where: { contentId },
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
    });

    return NextResponse.json(approvals);
  } catch (error) {
    console.error('Error fetching approvals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approvals' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.CONTENT_VIEW));

// POST /api/content/[id]/approval - Create a new approval
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
    const { status, comments } = body;

    // Validate required fields
    if (!status || !Object.values(ApprovalStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Valid approval status is required' },
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

    // Check if user has already submitted an approval for this content
    const existingApproval = await prisma.approval.findFirst({
      where: {
        contentId,
        userId: req.user!.id,
      },
    });

    let approval;

    if (existingApproval) {
      // Update existing approval
      approval = await prisma.approval.update({
        where: { id: existingApproval.id },
        data: {
          status,
          comments,
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
    } else {
      // Create new approval
      approval = await prisma.approval.create({
        data: {
          contentId,
          userId: req.user!.id,
          status,
          comments,
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
    }

    // Update content status based on approval
    await updateContentStatus(contentId);

    // Send notification if the approval status is APPROVED or REJECTED
    if (
      status === ApprovalStatus.APPROVED ||
      status === ApprovalStatus.REJECTED
    ) {
      await sendApprovalStatusNotification(
        contentId,
        status === ApprovalStatus.APPROVED ? 'APPROVED' : 'REJECTED',
        req.user!.id,
        comments
      );
    }

    return NextResponse.json(approval, { status: 201 });
  } catch (error) {
    console.error('Error creating approval:', error);
    return NextResponse.json(
      { error: 'Failed to create approval' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.CONTENT_APPROVE));

// Helper function to update content status based on approvals
async function updateContentStatus(contentId: string) {
  // Get all approvals for the content
  const approvals = await prisma.approval.findMany({
    where: { contentId },
  });

  // Get content
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    include: {
      approvals: true,
    },
  });

  if (!content) return;

  // Count approvals by status
  const approvalCounts = {
    APPROVED: approvals.filter((a) => a.status === ApprovalStatus.APPROVED)
      .length,
    REJECTED: approvals.filter((a) => a.status === ApprovalStatus.REJECTED)
      .length,
    PENDING: approvals.filter((a) => a.status === ApprovalStatus.PENDING)
      .length,
  };

  // Determine new content status based on approval counts
  let newStatus = content.status;

  // If there are any rejections, set to REJECTED
  if (approvalCounts.REJECTED > 0) {
    newStatus = 'REJECTED';
  }
  // If there are no rejections and at least 2 approvals, set to APPROVED
  else if (approvalCounts.APPROVED >= 2 && approvalCounts.REJECTED === 0) {
    newStatus = 'APPROVED';
  }
  // If there are approvals in progress, set to IN_REVIEW
  else if (approvals.length > 0) {
    newStatus = 'IN_REVIEW';
  }

  // Update content status if it's different
  if (newStatus !== content.status) {
    await prisma.content.update({
      where: { id: contentId },
      data: { status: newStatus },
    });
  }
}
