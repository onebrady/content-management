'use client';

import { useState } from 'react';
import {
  Button,
  Group,
  Text,
  Alert,
  Modal,
  Stack,
  Badge,
  Box,
} from '@mantine/core';
import {
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconTrash,
} from '@tabler/icons-react';

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
          startIcon={<IconCheck />}
          onClick={() => handleOpenDialog('approve')}
          disabled={selectedApprovals.length === 0}
        >
          Approve Selected ({selectedApprovals.length})
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<IconX />}
          onClick={() => handleOpenDialog('reject')}
          disabled={selectedApprovals.length === 0}
        >
          Reject Selected ({selectedApprovals.length})
        </Button>
      </Box>

      {/* Approve Dialog */}
      <Modal
        opened={dialogOpen.open && dialogOpen.type === 'approve'}
        onClose={handleCloseDialog}
        title="Approve Selected Content"
      >
        <Stack>
          <Text>
            You are approving {selectedApprovals.length} items. Please provide
            any comments (optional).
          </Text>
          <Box>
            <Textarea
              label="Comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </Box>
        </Stack>
        <Group position="right" mt="md">
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleApprove}
            color="success"
            variant="contained"
            disabled={loading}
          >
            Approve
          </Button>
        </Group>
      </Modal>

      {/* Reject Dialog */}
      <Modal
        opened={dialogOpen.open && dialogOpen.type === 'reject'}
        onClose={handleCloseDialog}
        title="Reject Selected Content"
      >
        <Stack>
          <Text>
            You are rejecting {selectedApprovals.length} items. Please provide a
            reason for rejection.
          </Text>
          <Box>
            <Textarea
              label="Reason for Rejection"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              required
            />
          </Box>
        </Stack>
        <Group position="right" mt="md">
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleReject}
            color="error"
            variant="contained"
            disabled={loading || !comments.trim()}
          >
            Reject
          </Button>
        </Group>
      </Modal>

      {/* Snackbar for notifications */}
      <Alert
        title={snackbar.severity === 'success' ? 'Success' : 'Error'}
        color={snackbar.severity}
        icon={snackbar.severity === 'success' ? <IconCheck /> : <IconAlertTriangle />}
        onClose={handleCloseSnackbar}
      >
        {snackbar.message}
      </Alert>
    </>
  );
}
