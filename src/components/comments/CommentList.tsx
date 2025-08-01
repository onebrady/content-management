'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  Pagination,
} from '@mui/material';
import { MoreVert as MoreIcon, Sort as SortIcon } from '@mui/icons-material';
import { Comment } from '@/components/comments/Comment';
import { CommentForm } from '@/components/comments/CommentForm';
import { useAuth } from '@/hooks/useAuth';

interface CommentListProps {
  contentId: string;
  initialComments?: any[];
}

export function CommentList({
  contentId,
  initialComments = [],
}: CommentListProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>(initialComments);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(
    Math.ceil(initialComments.length / 10) || 1
  );
  const [sortMenuAnchorEl, setSortMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  // Fetch comments
  const fetchComments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/content/${contentId}/comment?page=${page}&sort=${sortOrder}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data.comments);
      setTotalPages(Math.ceil(data.total / 10) || 1);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    fetchComments();
  };

  // Handle sort menu
  const handleSortMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSortMenuAnchorEl(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setSortMenuAnchorEl(null);
  };

  const handleSortChange = (order: 'newest' | 'oldest') => {
    setSortOrder(order);
    setPage(1);
    setSortMenuAnchorEl(null);
    fetchComments();
  };

  // Handle comment submission
  const handleCommentSubmit = async (text: string, parentId?: string) => {
    try {
      const response = await fetch(`/api/content/${contentId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentText: text,
          parentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const newComment = await response.json();

      // Update comments list
      if (parentId) {
        // If it's a reply, find the parent comment and add the reply
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === parentId
              ? {
                  ...comment,
                  replies: [...(comment.replies || []), newComment],
                }
              : comment
          )
        );
        // Clear reply state
        setReplyTo(null);
      } else {
        // If it's a new top-level comment, add it to the list
        setComments((prevComments) => [newComment, ...prevComments]);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    }
  };

  // Handle comment deletion
  const handleCommentDelete = async (commentId: string, parentId?: string) => {
    try {
      const response = await fetch(
        `/api/content/${contentId}/comment/${commentId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      // Update comments list
      if (parentId) {
        // If it's a reply, remove it from the parent's replies
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === parentId
              ? {
                  ...comment,
                  replies: (comment.replies || []).filter(
                    (reply: any) => reply.id !== commentId
                  ),
                }
              : comment
          )
        );
      } else {
        // If it's a top-level comment, remove it from the list
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.id !== commentId)
        );
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment. Please try again.');
    }
  };

  // Handle reply
  const handleReply = (commentId: string) => {
    setReplyTo(commentId);
  };

  // Cancel reply
  const handleCancelReply = () => {
    setReplyTo(null);
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6">Comments ({comments.length})</Typography>
        <Box>
          <Tooltip title="Sort comments">
            <IconButton onClick={handleSortMenuOpen}>
              <SortIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={sortMenuAnchorEl}
            open={Boolean(sortMenuAnchorEl)}
            onClose={handleSortMenuClose}
          >
            <MenuItem
              selected={sortOrder === 'newest'}
              onClick={() => handleSortChange('newest')}
            >
              Newest first
            </MenuItem>
            <MenuItem
              selected={sortOrder === 'oldest'}
              onClick={() => handleSortChange('oldest')}
            >
              Oldest first
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Comment form */}
      {user && (
        <Box sx={{ mb: 3 }}>
          <CommentForm
            onSubmit={(text) => handleCommentSubmit(text)}
            placeholder="Add a comment..."
            buttonText="Comment"
          />
        </Box>
      )}

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Comments list */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : comments.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No comments yet. Be the first to comment!
          </Typography>
        </Paper>
      ) : (
        <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
          {comments.map((comment) => (
            <ListItem
              key={comment.id}
              alignItems="flex-start"
              sx={{
                display: 'block',
                px: 0,
                py: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Comment
                comment={comment}
                onDelete={() => handleCommentDelete(comment.id)}
                onReply={() => handleReply(comment.id)}
                currentUserId={user?.id}
              />

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <List sx={{ pl: 6, mt: 2 }}>
                  {comment.replies.map((reply: any) => (
                    <ListItem
                      key={reply.id}
                      alignItems="flex-start"
                      sx={{ display: 'block', px: 0, py: 1 }}
                    >
                      <Comment
                        comment={reply}
                        onDelete={() =>
                          handleCommentDelete(reply.id, comment.id)
                        }
                        isReply
                        currentUserId={user?.id}
                      />
                    </ListItem>
                  ))}
                </List>
              )}

              {/* Reply form */}
              {replyTo === comment.id && (
                <Box sx={{ pl: 6, mt: 2 }}>
                  <CommentForm
                    onSubmit={(text) => handleCommentSubmit(text, comment.id)}
                    onCancel={handleCancelReply}
                    placeholder="Write a reply..."
                    buttonText="Reply"
                    autoFocus
                  />
                </Box>
              )}
            </ListItem>
          ))}
        </List>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}
