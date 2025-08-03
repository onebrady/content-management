'use client';

import { useState } from 'react';
import {
  Box,
  Text,
  ActionIcon,
  Menu,
  Avatar,
  Tooltip,
  Modal,
  Button,
  Group,
  Stack,
} from '@mantine/core';
import {
  IconDotsVertical,
  IconMessageReply,
  IconTrash,
  IconEdit,
} from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { CommentForm } from './CommentForm';

interface CommentProps {
  comment: {
    id: string;
    commentText: string;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  };
  onDelete: () => void;
  onReply?: () => void;
  onEdit?: (text: string) => void;
  isReply?: boolean;
  currentUserId?: string;
}

export function Comment({
  comment,
  onDelete,
  onReply,
  onEdit,
  isReply = false,
  currentUserId,
}: CommentProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Check if current user is the author
  const isAuthor = currentUserId === comment.user.id;

  // Handle delete
  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteModalOpen(false);
    onDelete();
  };

  // Handle edit
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleEditSubmit = (text: string) => {
    if (onEdit) {
      onEdit(text);
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  // Handle reply
  const handleReplyClick = () => {
    if (onReply) {
      onReply();
    }
  };

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get avatar color based on user id (for consistent colors)
  const getAvatarColor = (userId: string) => {
    const colors = [
      'blue',
      'green',
      'red',
      'orange',
      'violet',
      'cyan',
      'teal',
      'pink',
      'grape',
      'indigo',
    ];

    // Simple hash function to get consistent color
    const hash = userId.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    return colors[hash % colors.length];
  };

  return (
    <Box w="100%">
      <Group align="flex-start" gap="sm">
        {/* Avatar */}
        <Avatar
          color={getAvatarColor(comment.user.id)}
          size={isReply ? 'sm' : 'md'}
        >
          {getUserInitials(comment.user.name)}
        </Avatar>

        {/* Comment content */}
        <Box style={{ flex: 1 }}>
          <Group gap="xs" mb="xs">
            <Text size="sm" fw={500}>
              {comment.user.name}
            </Text>
            <Text size="xs" c="dimmed">
              {formatDate(comment.updatedAt)}
              {comment.updatedAt !== comment.createdAt && ' (edited)'}
            </Text>
          </Group>

          {isEditing ? (
            <CommentForm
              initialValue={comment.commentText}
              onSubmit={handleEditSubmit}
              onCancel={handleEditCancel}
              buttonText="Update"
              autoFocus
            />
          ) : (
            <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
              {comment.commentText}
            </Text>
          )}

          {/* Reply button (only for top-level comments) */}
          {!isReply && onReply && !isEditing && (
            <Button
              size="xs"
              variant="subtle"
              leftSection={<IconMessageReply size={14} />}
              onClick={handleReplyClick}
              mt="xs"
            >
              Reply
            </Button>
          )}
        </Box>

        {/* Actions menu */}
        {(isAuthor || currentUserId) && (
          <Menu>
            <Menu.Target>
              <ActionIcon variant="subtle" size="sm">
                <IconDotsVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {isAuthor && onEdit && (
                <Menu.Item
                  leftSection={<IconEdit size={14} />}
                  onClick={handleEditClick}
                >
                  Edit
                </Menu.Item>
              )}
              {isAuthor && (
                <Menu.Item
                  leftSection={<IconTrash size={14} />}
                  color="red"
                  onClick={handleDeleteClick}
                >
                  Delete
                </Menu.Item>
              )}
              {!isReply && onReply && (
                <Menu.Item
                  leftSection={<IconMessageReply size={14} />}
                  onClick={handleReplyClick}
                >
                  Reply
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>

      {/* Delete confirmation modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Comment"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete this comment? This action cannot be
            undone.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
