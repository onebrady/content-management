'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
} from '@mui/icons-material';

interface BulkApprovalActionsProps {
  selectedApprovals: string[];
  onActionComplete: () => void;
}

export function BulkApprovalActions({
  selectedApprovals,
  onActionComplete,
}: BulkApprovalActionsProps) {
  const [dialogOpen, setDialogOpen] = useState<{
    open: boolean;
    type: 'approve' | 'reject';
  }>({
    open: false,
    type: 'approve',
  });
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleOpenDialog = (type: 'approve' | 'reject') => {
    setDialogOpen({
      open: true,
      type,
    });
  };

  const handleCloseDialog = () => {
    setDialogOpen({
      ...dialogOpen,
      open: false,
    });
    setComments('');
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/approvals/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve',
          approvalIds: selectedApprovals,
          comments,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve content');
      }

      const data = await response.json();
      setSnackbar({
        open: true,
        message: `Successfully approved ${data.count} items`,
        severity: 'success',
      });
      onActionComplete();
    } catch (error) {
      console.error('Error approving content:', error);
      setSnackbar({
        open: true,
        message: 'Failed to approve content',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      handleCloseDialog();
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/approvals/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject',
          approvalIds: selectedApprovals,
          comments,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject content');
      }

      const data = await response.json();
      setSnackbar({
        open: true,
        message: `Successfully rejected ${data.count} items`,
        severity: 'success',
      });
      onActionComplete();
    } catch (error) {
      console.error('Error rejecting content:', error);
      setSnackbar({
        open: true,
        message: 'Failed to reject content',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      handleCloseDialog();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<ApproveIcon />}
          onClick={() => handleOpenDialog('approve')}
          disabled={selectedApprovals.length === 0}
        >
          Approve Selected ({selectedApprovals.length})
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<RejectIcon />}
          onClick={() => handleOpenDialog('reject')}
          disabled={selectedApprovals.length === 0}
        >
          Reject Selected ({selectedApprovals.length})
        </Button>
      </Box>

      {/* Approve Dialog */}
      <Dialog
        open={dialogOpen.open && dialogOpen.type === 'approve'}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Approve Selected Content</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are approving {selectedApprovals.length} items. Please provide
            any comments (optional).
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
          <Button
            onClick={handleApprove}
            color="success"
            variant="contained"
            disabled={loading}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={dialogOpen.open && dialogOpen.type === 'reject'}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Reject Selected Content</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are rejecting {selectedApprovals.length} items. Please provide a
            reason for rejection.
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
            disabled={loading || !comments.trim()}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
