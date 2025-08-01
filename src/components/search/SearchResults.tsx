'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Pagination,
  Divider,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Comment as CommentIcon,
  Attachment as AttachmentIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ContentStatus, ContentType, Priority } from '@prisma/client';
import { SearchPagination } from '@/lib/search';
import { useAuth } from '@/hooks/useAuth';
import { CONTENT_PERMISSIONS } from '@/lib/permissions';

interface SearchResultsProps {
  results: any[];
  pagination: SearchPagination;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onViewContent: (id: string) => void;
  onEditContent: (id: string) => void;
  onDeleteContent: (id: string) => void;
}

export function SearchResults({
  results,
  pagination,
  loading,
  error,
  onPageChange,
  onViewContent,
  onEditContent,
  onDeleteContent,
}: SearchResultsProps) {
  const { user } = useAuth();

  // Check permissions
  const canEdit = user && CONTENT_PERMISSIONS.canEdit(user.role);
  const canDelete = user && CONTENT_PERMISSIONS.canDelete(user.role);

  // Get status color
  const getStatusColor = (status: ContentStatus) => {
    switch (status) {
      case ContentStatus.DRAFT:
        return 'default';
      case ContentStatus.IN_REVIEW:
        return 'info';
      case ContentStatus.APPROVED:
        return 'success';
      case ContentStatus.REJECTED:
        return 'error';
      case ContentStatus.PUBLISHED:
        return 'primary';
      default:
        return 'default';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.LOW:
        return 'success';
      case Priority.MEDIUM:
        return 'info';
      case Priority.HIGH:
        return 'warning';
      case Priority.URGENT:
        return 'error';
      default:
        return 'default';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Handle page change
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    onPageChange(value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (results.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No results found
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Try adjusting your search or filters to find what you're looking for.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {results.length} of {pagination.total} results
      </Typography>

      <Grid container spacing={3}>
        {results.map((content) => (
          <Grid item xs={12} key={content.id}>
            <Card variant="outlined">
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" component="div">
                    {content.title}
                  </Typography>
                  <Box>
                    <Chip
                      label={content.status}
                      size="small"
                      color={getStatusColor(content.status)}
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={content.priority}
                      size="small"
                      color={getPriorityColor(content.priority)}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {content.tags.map((tag: any) => (
                    <Chip
                      key={tag.id}
                      label={tag.name}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>

                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {content.author?.name || 'Unknown'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {formatDate(content.updatedAt)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CommentIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {content._count?.comments || 0} comments
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachmentIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {content._count?.attachments || 0} attachments
                    </Typography>
                  </Box>
                </Box>
              </CardContent>

              <Divider />

              <CardActions>
                <Button
                  size="small"
                  startIcon={<ViewIcon />}
                  onClick={() => onViewContent(content.id)}
                >
                  View
                </Button>

                {canEdit && (
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => onEditContent(content.id)}
                  >
                    Edit
                  </Button>
                )}

                {canDelete && (
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => onDeleteContent(content.id)}
                  >
                    Delete
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}
