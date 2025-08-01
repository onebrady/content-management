'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Reply as ReplyIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
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
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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

  // Handle menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Handle delete
  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    onDelete();
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  // Handle edit
  const handleEditClick = () => {
    handleMenuClose();
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
    handleMenuClose();
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
      '#1976d2', // blue
      '#388e3c', // green
      '#d32f2f', // red
      '#f57c00', // orange
      '#7b1fa2', // purple
      '#0288d1', // light blue
      '#388e3c', // light green
      '#d81b60', // pink
      '#5d4037', // brown
      '#455a64', // blue grey
    ];

    // Simple hash function to get consistent color
    const hash = userId.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    return colors[hash % colors.length];
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        {/* Avatar */}
        <Avatar
          sx={{
            bgcolor: getAvatarColor(comment.user.id),
            width: isReply ? 32 : 40,
            height: isReply ? 32 : 40,
            mr: 2,
          }}
        >
          {getUserInitials(comment.user.name)}
        </Avatar>

        {/* Comment content */}
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="subtitle2" component="span">
              {comment.user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              {formatDate(comment.updatedAt)}
              {comment.updatedAt !== comment.createdAt && ' (edited)'}
            </Typography>
          </Box>

          {isEditing ? (
            <CommentForm
              initialValue={comment.commentText}
              onSubmit={handleEditSubmit}
              onCancel={handleEditCancel}
              buttonText="Update"
              autoFocus
            />
          ) : (
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {comment.commentText}
            </Typography>
          )}

          {/* Reply button (only for top-level comments) */}
          {!isReply && onReply && !isEditing && (
            <Button
              size="small"
              startIcon={<ReplyIcon />}
              onClick={handleReplyClick}
              sx={{ mt: 1, textTransform: 'none' }}
            >
              Reply
            </Button>
          )}
        </Box>

        {/* Actions menu */}
        {(isAuthor || currentUserId) && (
          <Box>
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              aria-label="comment actions"
            >
              <MoreIcon fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              {isAuthor && onEdit && (
                <MenuItem onClick={handleEditClick}>
                  <EditIcon fontSize="small" sx={{ mr: 1 }} />
                  Edit
                </MenuItem>
              )}
              {isAuthor && (
                <MenuItem onClick={handleDeleteClick}>
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                  Delete
                </MenuItem>
              )}
              {!isReply && onReply && (
                <MenuItem onClick={handleReplyClick}>
                  <ReplyIcon fontSize="small" sx={{ mr: 1 }} />
                  Reply
                </MenuItem>
              )}
            </Menu>
          </Box>
        )}
      </Box>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this comment? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
