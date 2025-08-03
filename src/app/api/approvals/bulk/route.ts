import { NextRequest, NextResponse } from 'next/server';
import { createProtectedHandler, requirePermission } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { ApprovalStatus } from '@prisma/client';
import { sendApprovalStatusNotification } from '@/lib/notification-service';
import { updateContentStatusBasedOnApprovals } from '@/lib/approvals';

// POST /api/approvals/bulk - Perform bulk approval actions
export const POST = createProtectedHandler(async (req) => {
  try {
    const body = await req.json();
    const { action, approvalIds, comments } = body;

    if (
      !action ||
      !approvalIds ||
      !Array.isArray(approvalIds) ||
      approvalIds.length === 0
    ) {
      return NextResponse.json(
        { error: 'Invalid request. Action and approvalIds are required' },
        { status: 400 }
      );
    }

    // Check if all approvals exist
    const approvals = await prisma.approval.findMany({
      where: {
        id: { in: approvalIds },
      },
      include: {
        content: true,
      },
    });

    if (approvals.length !== approvalIds.length) {
      return NextResponse.json(
        { error: 'One or more approvals not found' },
        { status: 404 }
      );
    }

    // Process based on action
    switch (action) {
      case 'approve':
        // Update all approvals to APPROVED
        await Promise.all(
          approvals.map(async (approval) => {
            await prisma.approval.update({
              where: { id: approval.id },
              data: {
                status: ApprovalStatus.APPROVED,
                comments: comments || 'Bulk approved',
              },
            });

            // Update content status
            await updateContentStatusBasedOnApprovals(approval.contentId);

            // Send notification
            await sendApprovalStatusNotification(
              approval.contentId,
              'APPROVED',
              req.user!.id,
              comments || 'Bulk approved'
            );
          })
        );
        break;

      case 'reject':
        if (!comments) {
          return NextResponse.json(
            { error: 'Comments are required for rejection' },
            { status: 400 }
          );
        }

        // Update all approvals to REJECTED
        await Promise.all(
          approvals.map(async (approval) => {
            await prisma.approval.update({
              where: { id: approval.id },
              data: {
                status: ApprovalStatus.REJECTED,
                comments,
              },
            });

            // Update content status
            await updateContentStatusBasedOnApprovals(approval.contentId);

            // Send notification
            await sendApprovalStatusNotification(
              approval.contentId,
              'REJECTED',
              req.user!.id,
              comments
            );
          })
        );
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      message: `Successfully ${action === 'approve' ? 'approved' : 'rejected'} ${approvals.length} items`,
      count: approvals.length,
    });
  } catch (error) {
    console.error('Error performing bulk approval action:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.APPROVAL_APPROVE));
