import { NextRequest, NextResponse } from 'next/server';
import { createProtectedHandler, requirePermission } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { ApprovalStatus, ContentStatus } from '@prisma/client';

// GET /api/content/[id]/approval/[approvalId] - Get a specific approval
export const GET = createProtectedHandler(async (req) => {
  const pathParts = req.nextUrl.pathname.split('/');
  const contentId = pathParts[3];
  const approvalId = pathParts[5];

  if (!contentId || !approvalId) {
    return NextResponse.json(
      { error: 'Content ID and Approval ID are required' },
      { status: 400 }
    );
  }

  try {
    const approval = await prisma.approval.findUnique({
      where: { id: approvalId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        content: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    if (!approval) {
      return NextResponse.json(
        { error: 'Approval not found' },
        { status: 404 }
      );
    }

    if (approval.contentId !== contentId) {
      return NextResponse.json(
        { error: 'Approval does not belong to the specified content' },
        { status: 400 }
      );
    }

    return NextResponse.json(approval);
  } catch (error) {
    console.error('Error fetching approval:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approval' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.CONTENT_VIEW));

// PUT /api/content/[id]/approval/[approvalId] - Update an approval
export const PUT = createProtectedHandler(async (req) => {
  const pathParts = req.nextUrl.pathname.split('/');
  const contentId = pathParts[3];
  const approvalId = pathParts[5];

  if (!contentId || !approvalId) {
    return NextResponse.json(
      { error: 'Content ID and Approval ID are required' },
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

    // Check if approval exists
    const existingApproval = await prisma.approval.findUnique({
      where: { id: approvalId },
    });

    if (!existingApproval) {
      return NextResponse.json(
        { error: 'Approval not found' },
        { status: 404 }
      );
    }

    if (existingApproval.contentId !== contentId) {
      return NextResponse.json(
        { error: 'Approval does not belong to the specified content' },
        { status: 400 }
      );
    }

    // Check if user is the approval creator or an admin
    if (
      existingApproval.userId !== req.user!.id &&
      req.user!.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to update this approval' },
        { status: 403 }
      );
    }

    // Update approval
    const approval = await prisma.approval.update({
      where: { id: approvalId },
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

    // Update content status based on approvals
    const newStatus = await updateContentStatus(contentId);

    return NextResponse.json(approval);
  } catch (error) {
    console.error('Error updating approval:', error);
    return NextResponse.json(
      { error: 'Failed to update approval' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.APPROVAL_APPROVE));

// DELETE /api/content/[id]/approval/[approvalId] - Delete an approval
export const DELETE = createProtectedHandler(async (req, context) => {
  const pathParts = req.nextUrl.pathname.split('/');
  const contentId = pathParts[3];
  const approvalId = pathParts[5];

  if (!contentId || !approvalId) {
    return NextResponse.json(
      { error: 'Content ID and Approval ID are required' },
      { status: 400 }
    );
  }

  try {
    // Check if approval exists
    const existingApproval = await prisma.approval.findUnique({
      where: { id: approvalId },
    });

    if (!existingApproval) {
      return NextResponse.json(
        { error: 'Approval not found' },
        { status: 404 }
      );
    }

    if (existingApproval.contentId !== contentId) {
      return NextResponse.json(
        { error: 'Approval does not belong to the specified content' },
        { status: 400 }
      );
    }

    // Check if user is the approval creator or an admin
    if (
      existingApproval.userId !== req.user!.id &&
      req.user!.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this approval' },
        { status: 403 }
      );
    }

    // Delete approval
    await prisma.approval.delete({
      where: { id: approvalId },
    });

    // Update content status based on remaining approvals
    await updateContentStatus(contentId);

    return NextResponse.json({ message: 'Approval deleted successfully' });
  } catch (error) {
    console.error('Error deleting approval:', error);
    return NextResponse.json(
      { error: 'Failed to delete approval' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.APPROVAL_APPROVE));

// Helper function to update content status based on approvals
async function updateContentStatus(contentId: string): Promise<ContentStatus> {
  // Get all approvals for the content
  const approvals = await prisma.approval.findMany({
    where: { contentId },
  });

  // Get content
  const content = await prisma.content.findUnique({
    where: { id: contentId },
  });

  if (!content) {
    throw new Error('Content not found');
  }

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
  let newStatus: ContentStatus = content.status;

  // If there are any rejections, set to REJECTED
  if (approvalCounts.REJECTED > 0) {
    newStatus = 'REJECTED';
  }
  // If there are no rejections and at least 1 approval, set to APPROVED
  else if (approvalCounts.APPROVED >= 1 && approvalCounts.REJECTED === 0) {
    newStatus = 'APPROVED';
  }
  // If there are approvals in progress, set to IN_REVIEW
  else if (approvals.length > 0) {
    newStatus = 'IN_REVIEW';
  }
  // If no approvals exist, keep current status (should be DRAFT or IN_REVIEW)

  // Update content status if it's different
  if (newStatus !== content.status) {
    await prisma.content.update({
      where: { id: contentId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
    });
  }

  return newStatus;
}
