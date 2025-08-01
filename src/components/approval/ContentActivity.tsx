'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Edit,
  Send,
  CheckCircle,
  Cancel,
  Publish,
  ArrowBack,
  Comment,
  AttachFile,
  History,
} from '@mui/icons-material';
import { UserRole } from '@prisma/client';

interface ContentActivityProps {
  activities: Array<{
    id: string;
    action: string;
    details?: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      role: UserRole;
    };
  }>;
}

export function ContentActivity({ activities }: ContentActivityProps) {
  const theme = useTheme();

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  // Get activity icon
  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'CREATED':
        return <Edit />;
      case 'UPDATED':
        return <Edit />;
      case 'SUBMITTED_FOR_REVIEW':
        return <Send />;
      case 'APPROVED':
        return <CheckCircle />;
      case 'REJECTED':
        return <Cancel />;
      case 'PUBLISHED':
        return <Publish />;
      case 'RETURNED_TO_DRAFT':
        return <ArrowBack />;
      case 'COMMENT_ADDED':
        return <Comment />;
      case 'FILE_ATTACHED':
        return <AttachFile />;
      default:
        return <History />;
    }
  };

  // Get activity color
  const getActivityColor = (action: string) => {
    switch (action) {
      case 'CREATED':
        return theme.palette.primary.main;
      case 'UPDATED':
        return theme.palette.primary.main;
      case 'SUBMITTED_FOR_REVIEW':
        return theme.palette.warning.main;
      case 'APPROVED':
        return theme.palette.success.main;
      case 'REJECTED':
        return theme.palette.error.main;
      case 'PUBLISHED':
        return theme.palette.info.main;
      case 'RETURNED_TO_DRAFT':
        return theme.palette.warning.main;
      case 'COMMENT_ADDED':
        return theme.palette.secondary.main;
      case 'FILE_ATTACHED':
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  // Get activity label
  const getActivityLabel = (action: string) => {
    switch (action) {
      case 'CREATED':
        return 'Created';
      case 'UPDATED':
        return 'Updated';
      case 'SUBMITTED_FOR_REVIEW':
        return 'Submitted for Review';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'PUBLISHED':
        return 'Published';
      case 'RETURNED_TO_DRAFT':
        return 'Returned to Draft';
      case 'COMMENT_ADDED':
        return 'Comment Added';
      case 'FILE_ATTACHED':
        return 'File Attached';
      default:
        return action;
    }
  };

  return (
    <Card variant="outlined">
      <CardHeader
        title="Activity History"
        subheader={`${activities.length} activities recorded`}
      />
      <Divider />
      <CardContent>
        {activities.length > 0 ? (
          <List>
            {activities.map((activity) => (
              <ListItem key={activity.id} alignItems="flex-start" divider>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: getActivityColor(activity.action) }}>
                    {getActivityIcon(activity.action)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {getActivityLabel(activity.action)}
                      </Typography>
                      <Chip
                        size="small"
                        label={activity.user.role}
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        {activity.user.name} - {formatDate(activity.createdAt)}
                      </Typography>
                      {activity.details && (
                        <Typography
                          variant="body2"
                          component="p"
                          sx={{ mt: 1 }}
                        >
                          {activity.details}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No activity recorded yet.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
