import { NextRequest, NextResponse } from 'next/server';
import { createProtectedHandler, authenticateRequest } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

// GET /api/notifications - Get all notifications for the current user
export const GET = createProtectedHandler(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    // Get notifications for the current user
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user!.id,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const total = await prisma.notification.count({
      where: {
        userId: req.user!.id,
        ...(unreadOnly ? { isRead: false } : {}),
      },
    });

    return NextResponse.json({
      notifications,
      pagination: {
        total,
        page,
        pageSize: limit,
        pageCount: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch notifications',
        details: error instanceof Error ? error.message : String(error),
        stack:
          process.env.NODE_ENV !== 'production' && error instanceof Error
            ? error.stack
            : undefined,
      },
      { status: 500 }
    );
  }
}, authenticateRequest);

// PATCH /api/notifications - Mark notifications as read
export const PATCH = createProtectedHandler(async (req) => {
  try {
    const body = await req.json();
    const { ids, all } = body;

    if (all) {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: {
          userId: req.user!.id,
          isRead: false,
        },
        data: {
          isRead: true,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: 'All notifications marked as read',
      });
    } else if (ids && Array.isArray(ids) && ids.length > 0) {
      // Mark specific notifications as read
      await prisma.notification.updateMany({
        where: {
          id: {
            in: ids,
          },
          userId: req.user!.id,
        },
        data: {
          isRead: true,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: `${ids.length} notifications marked as read`,
      });
    } else {
      return NextResponse.json(
        { error: 'No notifications specified to mark as read' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      {
        error: 'Failed to mark notifications as read',
        details: error instanceof Error ? error.message : String(error),
        stack:
          process.env.NODE_ENV !== 'production' && error instanceof Error
            ? error.stack
            : undefined,
      },
      { status: 500 }
    );
  }
}, authenticateRequest);
