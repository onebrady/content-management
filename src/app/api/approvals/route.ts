import { NextRequest, NextResponse } from 'next/server';
import { createProtectedHandler, requirePermission } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { ApprovalStatus, ContentStatus } from '@prisma/client';
import { differenceInHours } from 'date-fns';

// GET /api/approvals - Get all approvals with filtering
export const GET = createProtectedHandler(async (req) => {
  try {
    const { searchParams } = new URL(req.url);

    // Parse filters
    const status = searchParams.get('status')?.split(',') || [];
    const contentType = searchParams.get('contentType')?.split(',') || [];
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : null;
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : null;
    const search = searchParams.get('search') || '';
    const assignedTo = searchParams.get('assignedTo') || '';
    const approvedBy = searchParams.get('approvedBy') || '';

    // Build where clause
    const where: any = {};

    // Status filter
    if (status.length > 0) {
      where.status = { in: status };
    }

    // Date range filter
    if (startDate || endDate) {
      where.updatedAt = {};
      if (startDate) {
        where.updatedAt.gte = startDate;
      }
      if (endDate) {
        where.updatedAt.lte = endDate;
      }
    }

    // Content type filter
    if (contentType.length > 0) {
      where.content = {
        ...where.content,
        type: { in: contentType },
      };
    }

    // Search filter
    if (search) {
      where.OR = [
        { content: { title: { contains: search, mode: 'insensitive' } } },
        {
          content: {
            author: { name: { contains: search, mode: 'insensitive' } },
          },
        },
        { comments: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Assigned to filter
    if (assignedTo) {
      where.content = {
        ...where.content,
        assigneeId: assignedTo,
      };
    }

    // Approved by filter
    if (approvedBy) {
      where.userId = approvedBy;
    }

    // Get approvals
    const approvals = await prisma.approval.findMany({
      where,
      include: {
        content: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
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
        updatedAt: 'desc',
      },
    });

    // Calculate stats
    const stats = {
      pending: approvals.filter((a) => a.status === ApprovalStatus.PENDING)
        .length,
      approved: approvals.filter((a) => a.status === ApprovalStatus.APPROVED)
        .length,
      rejected: approvals.filter((a) => a.status === ApprovalStatus.REJECTED)
        .length,
      total: approvals.length,
    };

    // Calculate average approval time if we have approved items
    const approvedItems = approvals.filter(
      (a) => a.status === ApprovalStatus.APPROVED
    );
    if (approvedItems.length > 0) {
      const totalHours = approvedItems.reduce((sum, item) => {
        const createdAt = new Date(item.createdAt);
        const updatedAt = new Date(item.updatedAt);
        return sum + differenceInHours(updatedAt, createdAt);
      }, 0);

      const avgHours = totalHours / approvedItems.length;
      stats.averageApprovalTime =
        avgHours < 24
          ? `${Math.round(avgHours)} hours`
          : `${Math.round(avgHours / 24)} days`;

      stats.approvalRate = Math.round(
        (stats.approved / (stats.approved + stats.rejected)) * 100
      );
    }

    return NextResponse.json({
      approvals,
      stats,
    });
  } catch (error) {
    console.error('Error fetching approvals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approvals' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.APPROVAL_APPROVE));
