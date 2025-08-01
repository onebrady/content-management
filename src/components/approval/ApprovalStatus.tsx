'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Edit,
  Send,
  Publish,
  ArrowBack,
} from '@mui/icons-material';
import { ContentStatus, ApprovalStatus, UserRole } from '@prisma/client';
import { useAuth } from '@/hooks/useAuth';
import { PERMISSIONS } from '@/lib/permissions';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { canTransitionStatus, VALID_STATUS_TRANSITIONS } from '@/lib/approvals';

interface ApprovalStatusProps {
  content: {
    id: string;
    title: string;
    status: ContentStatus;
    authorId: string;
    author: {
      id: string;
      name: string;
    };
  };
  approvals?: Array<{
    id: string;
    status: ApprovalStatus;
    comments?: string;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      name: string;
      role: UserRole;
    };
  }>;
  onApprove?: (contentId: string, comments?: string) => Promise<void>;
  onReject?: (contentId: string, comments?: string) => Promise<void>;
  onSubmitForReview?: (contentId: string) => Promise<void>;
  onPublish?: (contentId: string) => Promise<void>;
  onReturnToDraft?: (contentId: string, reason: string) => Promise<void>;
  loading?: boolean;
}

export function ApprovalStatus({
  content,
  approvals = [],
  onApprove,
  onReject,
  onSubmitForReview,
  onPublish,
  onReturnToDraft,
  loading = false,
}: ApprovalStatusProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState('');
  const [reason, setReason] = useState('');
  const [dialogOpen, setDialogOpen] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | 'submit' | 'publish' | 'draft';
  }>({
    open: false,
    type: 'approve',
  });

  // Check if the current user has already submitted an approval
  const userApproval = approvals.find(
    (approval) => approval.user.id === user?.id
  );

  // Check if the current user is the author
  const isAuthor = content.authorId === user?.id;

  // Get status color
  const getStatusColor = (status: ContentStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'default';
      case 'IN_REVIEW':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'PUBLISHED':
        return 'info';
      default:
        return 'default';
    }
  };

  // Get approval status color
  const getApprovalColor = (status: ApprovalStatus) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Get approval status icon
  const getApprovalIcon = (status: ApprovalStatus) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle fontSize="small" />;
      case 'REJECTED':
        return <Cancel fontSize="small" />;
      case 'PENDING':
        return <HourglassEmpty fontSize="small" />;
      default:
        return null;
    }
  };

  // Handle dialog open
  const handleOpenDialog = (
    type: 'approve' | 'reject' | 'submit' | 'publish' | 'draft'
  ) => {
    setDialogOpen({
      open: true,
      type,
    });
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen({
      ...dialogOpen,
      open: false,
    });
    setComments('');
    setReason('');
  };

  // Handle approve
  const handleApprove = async () => {
    if (onApprove) {
      await onApprove(content.id, comments);
    }
    handleCloseDialog();
  };

  // Handle reject
  const handleReject = async () => {
    if (onReject) {
      await onReject(content.id, comments);
    }
    handleCloseDialog();
  };

  // Handle submit for review
  const handleSubmitForReview = async () => {
    if (onSubmitForReview) {
      await onSubmitForReview(content.id);
    }
    handleCloseDialog();
  };

  // Handle publish
  const handlePublish = async () => {
    if (onPublish) {
      await onPublish(content.id);
    }
    handleCloseDialog();
  };

  // Handle return to draft
  const handleReturnToDraft = async () => {
    if (onReturnToDraft) {
      await onReturnToDraft(content.id, reason);
    }
    handleCloseDialog();
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  // Check if user can perform actions based on role and content status
  const canApprove = user?.role === 'MODERATOR' || user?.role === 'ADMIN';
  const canSubmitForReview =
    content.status === 'DRAFT' && (isAuthor || user?.role === 'ADMIN');
  const canPublish =
    content.status === 'APPROVED' &&
    (user?.role === 'MODERATOR' || user?.role === 'ADMIN');
  const canReturnToDraft =
    ['IN_REVIEW', 'APPROVED', 'REJECTED'].includes(content.status) &&
    (isAuthor || user?.role === 'MODERATOR' || user?.role === 'ADMIN');

  return (
    <Card variant="outlined">
      <CardHeader
        title="Approval Status"
        subheader={`Current status: ${content.status.replace('_', ' ')}`}
        action={
          <Chip
            label={content.status.replace('_', ' ')}
            color={getStatusColor(content.status)}
          />
        }
      />
      <Divider />
      <CardContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            {/* Status-specific messages */}
            {content.status === 'DRAFT' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                This content is in draft state. Submit it for review when ready.
              </Alert>
            )}

            {content.status === 'IN_REVIEW' && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                This content is being reviewed. Approvals:{' '}
                {approvals.filter((a) => a.status === 'APPROVED').length}
              </Alert>
            )}

            {content.status === 'APPROVED' && (
              <Alert severity="success" sx={{ mb: 2 }}>
                This content has been approved and is ready to be published.
              </Alert>
            )}

            {content.status === 'REJECTED' && (
              <Alert severity="error" sx={{ mb: 2 }}>
                This content has been rejected. Please review the comments and
                make necessary changes.
              </Alert>
            )}

            {content.status === 'PUBLISHED' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                This content is published and visible to users.
              </Alert>
            )}

            {/* Approvals list */}
            {approvals.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Approval History
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {approvals.map((approval) => (
                    <Card key={approval.id} variant="outlined" sx={{ p: 1 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Box>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Typography variant="body2" fontWeight="bold">
                              {approval.user.name}
                            </Typography>
                            <Chip
                              size="small"
                              label={approval.status}
                              color={getApprovalColor(approval.status)}
                              icon={getApprovalIcon(approval.status)}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(approval.updatedAt)}
                          </Typography>
                        </Box>
                      </Box>
                      {approval.comments && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            {approval.comments}
                          </Typography>
                        </Box>
                      )}
                    </Card>
                  ))}
                </Box>
              </Box>
            ) : content.status !== 'DRAFT' ? (
              <Typography variant="body2" color="text.secondary">
                No approvals have been submitted yet.
              </Typography>
            ) : null}

            {/* Action buttons */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 3 }}>
              {/* Submit for review button */}
              {canSubmitForReview && (
                <PermissionGuard permission={PERMISSIONS.CONTENT_EDIT}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Send />}
                    onClick={() => handleOpenDialog('submit')}
                    disabled={loading}
                  >
                    Submit for Review
                  </Button>
                </PermissionGuard>
              )}

              {/* Approval buttons */}
              {content.status === 'IN_REVIEW' && canApprove && (
                <PermissionGuard permission={PERMISSIONS.CONTENT_APPROVE}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => handleOpenDialog('approve')}
                      disabled={loading}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => handleOpenDialog('reject')}
                      disabled={loading}
                    >
                      Reject
                    </Button>
                  </Box>
                </PermissionGuard>
              )}

              {/* Publish button */}
              {canPublish && (
                <PermissionGuard permission={PERMISSIONS.CONTENT_PUBLISH}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Publish />}
                    onClick={() => handleOpenDialog('publish')}
                    disabled={loading}
                  >
                    Publish
                  </Button>
                </PermissionGuard>
              )}

              {/* Return to draft button */}
              {canReturnToDraft && (
                <PermissionGuard permission={PERMISSIONS.CONTENT_EDIT}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => handleOpenDialog('draft')}
                    disabled={loading}
                  >
                    Return to Draft
                  </Button>
                </PermissionGuard>
              )}
            </Box>
          </>
        )}
      </CardContent>

      {/* Approval Dialog */}
      <Dialog
        open={dialogOpen.open && dialogOpen.type === 'approve'}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Approve Content</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are approving "{content.title}". Please provide any comments
            (optional).
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Comments"
            fullWidth
            multiline
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleApprove} color="success" variant="contained">
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={dialogOpen.open && dialogOpen.type === 'reject'}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Reject Content</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are rejecting "{content.title}". Please provide a reason for
            rejection.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Rejection"
            fullWidth
            multiline
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleReject}
            color="error"
            variant="contained"
            disabled={!comments.trim()}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Submit for Review Dialog */}
      <Dialog
        open={dialogOpen.open && dialogOpen.type === 'submit'}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Submit for Review</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are submitting "{content.title}" for review. Once submitted, it
            will be reviewed by moderators.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitForReview}
            color="primary"
            variant="contained"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Publish Dialog */}
      <Dialog
        open={dialogOpen.open && dialogOpen.type === 'publish'}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Publish Content</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are publishing "{content.title}". Once published, it will be
            visible to users.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handlePublish} color="primary" variant="contained">
            Publish
          </Button>
        </DialogActions>
      </Dialog>

      {/* Return to Draft Dialog */}
      <Dialog
        open={dialogOpen.open && dialogOpen.type === 'draft'}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Return to Draft</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are returning "{content.title}" to draft state. Please provide a
            reason.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Reason"
            fullWidth
            multiline
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleReturnToDraft}
            variant="contained"
            disabled={!reason.trim()}
          >
            Return to Draft
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
