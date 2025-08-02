import { NextRequest, NextResponse } from 'next/server';
import { createProtectedHandler } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

// GET /api/notifications/[id] - Get a specific notification
export const GET = createProtectedHandler(async (req) => {
  const notificationId = req.nextUrl.pathname.split('/').pop();

  if (!notificationId) {
    return NextResponse.json(
      { error: 'Notification ID is required' },
      { status: 400 }
    );
  }

  try {
    // Get notification
    const notification = await prisma.notification.findUnique({
      where: {
        id: notificationId,
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
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Check if the notification belongs to the current user
    if (notification.userId !== req.user!.id) {
      return NextResponse.json(
        { error: 'You do not have permission to view this notification' },
        { status: 403 }
      );
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error fetching notification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification' },
      { status: 500 }
    );
  }
});

// PATCH /api/notifications/[id] - Mark a notification as read
export const PATCH = createProtectedHandler(async (req) => {
  const notificationId = req.nextUrl.pathname.split('/').pop();

  if (!notificationId) {
    return NextResponse.json(
      { error: 'Notification ID is required' },
      { status: 400 }
    );
  }

  try {
    // Check if notification exists and belongs to the user
    const notification = await prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    if (notification.userId !== req.user!.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this notification' },
        { status: 403 }
      );
    }

    // Mark notification as read
    const updatedNotification = await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
});

// DELETE /api/notifications/[id] - Delete a notification
export const DELETE = createProtectedHandler(async (req, context) => {
  const notificationId = req.nextUrl.pathname.split('/').pop();

  if (!notificationId) {
    return NextResponse.json(
      { error: 'Notification ID is required' },
      { status: 400 }
    );
  }

  try {
    // Check if notification exists and belongs to the user
    const notification = await prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    if (notification.userId !== req.user!.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this notification' },
        { status: 403 }
      );
    }

    // Delete notification
    await prisma.notification.delete({
      where: {
        id: notificationId,
      },
    });

    return NextResponse.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
});
