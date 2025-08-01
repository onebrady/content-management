'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  contentId?: string;
  content?: {
    id: string;
    title: string;
    type: string;
    status: string;
  };
}

interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

interface NotificationsResponse {
  notifications: Notification[];
  pagination: PaginationInfo;
}

export function useNotifications(
  options = { unreadOnly: false, autoRefresh: true }
) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    pageSize: 10,
    pageCount: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(
    async (page = 1, limit = 10, unreadOnly = options.unreadOnly) => {
      if (!isAuthenticated || authLoading) return;

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          unreadOnly: unreadOnly.toString(),
        });

        const response = await fetch(`/api/notifications?${params}`);

        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const data: NotificationsResponse = await response.json();
        setNotifications(data.notifications);
        setPagination(data.pagination);

        // Count unread notifications
        const unreadNotifications = data.notifications.filter((n) => !n.isRead);
        setUnreadCount(
          unreadOnly ? data.pagination.total : unreadNotifications.length
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching notifications:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, authLoading, options.unreadOnly]
  );

  const markAsRead = useCallback(
    async (notificationIds: string[] | 'all') => {
      if (!isAuthenticated) return;

      try {
        const body =
          notificationIds === 'all' ? { all: true } : { ids: notificationIds };

        const response = await fetch('/api/notifications', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error('Failed to mark notifications as read');
        }

        // Update local state
        if (notificationIds === 'all') {
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
          setUnreadCount(0);
        } else {
          setNotifications((prev) =>
            prev.map((n) =>
              notificationIds.includes(n.id) ? { ...n, isRead: true } : n
            )
          );
          setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
        }
      } catch (err) {
        console.error('Error marking notifications as read:', err);
      }
    },
    [isAuthenticated]
  );

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!isAuthenticated) return;

      try {
        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete notification');
        }

        // Update local state
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        // Update unread count if the deleted notification was unread
        const deletedNotification = notifications.find(
          (n) => n.id === notificationId
        );
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (err) {
        console.error('Error deleting notification:', err);
      }
    },
    [isAuthenticated, notifications]
  );

  // Initial fetch and auto-refresh
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchNotifications(pagination.page, pagination.pageSize);

      // Set up auto-refresh interval
      let intervalId: NodeJS.Timeout | null = null;

      if (options.autoRefresh) {
        intervalId = setInterval(() => {
          fetchNotifications(pagination.page, pagination.pageSize);
        }, 60000); // Refresh every minute
      }

      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }
  }, [
    isAuthenticated,
    authLoading,
    fetchNotifications,
    options.autoRefresh,
    pagination.page,
    pagination.pageSize,
  ]);

  return {
    notifications,
    unreadCount,
    pagination,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    deleteNotification,
  };
}
