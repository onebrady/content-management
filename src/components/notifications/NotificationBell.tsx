'use client';

import { useState } from 'react';
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Box,
  Button,
  Divider,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNotifications } from '@/hooks/useNotifications';
import { useRouter } from 'next/navigation';

export default function NotificationBell() {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    deleteNotification,
    fetchNotifications,
  } = useNotifications({ unreadOnly: false, autoRefresh: true });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    // Refresh notifications when opening the popover
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllAsRead = () => {
    markAsRead('all');
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead([id]);
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read
    markAsRead([notification.id]);

    // Navigate based on notification type
    if (notification.contentId) {
      router.push(`/content?view=${notification.contentId}`);
    }

    handleClose();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'APPROVAL_APPROVED':
        return <CheckCircleIcon color="success" />;
      case 'APPROVAL_REJECTED':
        return <ErrorIcon color="error" />;
      case 'APPROVAL_REQUEST':
        return <WarningIcon color="warning" />;
      case 'CONTENT_PUBLISHED':
        return <CheckCircleIcon color="info" />;
      case 'NEW_COMMENT':
        return <InfoIcon color="primary" />;
      default:
        return <InfoIcon />;
    }
  };

  // Format notification date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      <IconButton color="inherit" onClick={handleClick} aria-describedby={id}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 500,
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </Box>

        <Divider />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                button
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  {getNotificationIcon(notification.type)}
                </Box>
                <ListItemText
                  primary={notification.message}
                  secondary={formatDate(notification.createdAt)}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: notification.isRead ? 'normal' : 'bold',
                  }}
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Delete">
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}
