'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Stack,
  Paper,
  Loader,
  Alert,
  Button,
  Menu,
  ActionIcon,
  Pagination,
  Group,
  Title,
  Divider,
} from '@mantine/core';
import { IconDotsVertical, IconSortAscending } from '@tabler/icons-react';
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
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  // Fetch comments on component mount and when dependencies change
  useEffect(() => {
    fetchComments();
  }, [contentId, page, sortOrder]);

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
  const handlePageChange = (value: number) => {
    setPage(value);
  };

  // Handle sort change
  const handleSortChange = (order: 'newest' | 'oldest') => {
    setSortOrder(order);
    setPage(1);
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
      <Group justify="space-between" mb="md">
        <Title order={4}>Comments ({comments.length})</Title>
        <Menu>
          <Menu.Target>
            <ActionIcon variant="subtle">
              <IconSortAscending size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              onClick={() => handleSortChange('newest')}
              fw={sortOrder === 'newest' ? 'bold' : 'normal'}
            >
              Newest first
            </Menu.Item>
            <Menu.Item
              onClick={() => handleSortChange('oldest')}
              fw={sortOrder === 'oldest' ? 'bold' : 'normal'}
            >
              Oldest first
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      {/* Comment form */}
      {user && (
        <Box mb="lg">
          <CommentForm
            onSubmit={(text) => handleCommentSubmit(text)}
            placeholder="Add a comment..."
            buttonText="Comment"
          />
        </Box>
      )}

      {/* Error message */}
      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}

      {/* Comments list */}
      {loading ? (
        <Box ta="center" py="xl">
          <Loader />
        </Box>
      ) : comments.length === 0 ? (
        <Paper p="xl" ta="center">
          <Text c="dimmed">No comments yet. Be the first to comment!</Text>
        </Paper>
      ) : (
        <Stack gap="md">
          {comments.map((comment) => (
            <Box key={comment.id}>
              <Comment
                comment={comment}
                onDelete={() => handleCommentDelete(comment.id)}
                onReply={() => handleReply(comment.id)}
                currentUserId={user?.id}
              />

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <Stack gap="sm" ml="xl" mt="sm">
                  {comment.replies.map((reply: any) => (
                    <Comment
                      key={reply.id}
                      comment={reply}
                      onDelete={() => handleCommentDelete(reply.id, comment.id)}
                      isReply
                      currentUserId={user?.id}
                    />
                  ))}
                </Stack>
              )}

              {/* Reply form */}
              {replyTo === comment.id && (
                <Box ml="xl" mt="sm">
                  <CommentForm
                    onSubmit={(text) => handleCommentSubmit(text, comment.id)}
                    onCancel={handleCancelReply}
                    placeholder="Write a reply..."
                    buttonText="Reply"
                    autoFocus
                  />
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box ta="center" mt="lg">
          <Pagination
            total={totalPages}
            value={page}
            onChange={handlePageChange}
          />
        </Box>
      )}
    </Box>
  );
}
