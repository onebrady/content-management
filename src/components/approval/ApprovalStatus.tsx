'use client';

import { useState } from 'react';
import {
  Box,
  Text,
  Badge,
  Button,
  Card,
  Divider,
  Alert,
  Loader,
  Modal,
  Textarea,
  Group,
  Stack,
  Title,
} from '@mantine/core';
import {
  IconCheck,
  IconX,
  IconClock,
  IconEdit,
  IconSend,
  IconDeviceFloppy,
  IconArrowLeft,
} from '@tabler/icons-react';
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
        return 'gray';
      case 'IN_REVIEW':
        return 'yellow';
      case 'APPROVED':
        return 'green';
      case 'REJECTED':
        return 'red';
      case 'PUBLISHED':
        return 'blue';
      default:
        return 'gray';
    }
  };

  // Get approval color
  const getApprovalColor = (status: ApprovalStatus) => {
    switch (status) {
      case 'APPROVED':
        return 'green';
      case 'REJECTED':
        return 'red';
      case 'PENDING':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  // Get approval icon
  const getApprovalIcon = (status: ApprovalStatus) => {
    switch (status) {
      case 'APPROVED':
        return <IconCheck size={16} />;
      case 'REJECTED':
        return <IconX size={16} />;
      case 'PENDING':
        return <IconClock size={16} />;
      default:
        return <IconClock size={16} />;
    }
  };

  const handleOpenDialog = (
    type: 'approve' | 'reject' | 'submit' | 'publish' | 'draft'
  ) => {
    setDialogOpen({ open: true, type });
    setComments('');
    setReason('');
  };

  const handleCloseDialog = () => {
    setDialogOpen({ open: false, type: 'approve' });
    setComments('');
    setReason('');
  };

  const handleApprove = async () => {
    if (onApprove) {
      await onApprove(content.id, comments);
    }
    handleCloseDialog();
  };

  const handleReject = async () => {
    if (onReject) {
      await onReject(content.id, comments);
    }
    handleCloseDialog();
  };

  const handleSubmitForReview = async () => {
    if (onSubmitForReview) {
      await onSubmitForReview(content.id);
    }
    handleCloseDialog();
  };

  const handlePublish = async () => {
    if (onPublish) {
      await onPublish(content.id);
    }
    handleCloseDialog();
  };

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
    <Card withBorder>
      <Card.Section p="md">
        <Group justify="space-between" align="center">
          <Stack gap={4}>
            <Title order={4}>Approval Status</Title>
            <Text size="sm" c="dimmed">
              Current status: {content.status.replace('_', ' ')}
            </Text>
          </Stack>
          <Badge color={getStatusColor(content.status)} size="lg">
            {content.status.replace('_', ' ')}
          </Badge>
        </Group>
      </Card.Section>
      <Divider />
      <Card.Section p="md">
        {loading ? (
          <Box
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <Loader size="sm" />
          </Box>
        ) : (
          <>
            {/* Status-specific messages */}
            {content.status === 'DRAFT' && (
              <Alert color="blue" mb="md">
                This content is in draft state. Submit it for review when ready.
              </Alert>
            )}

            {content.status === 'IN_REVIEW' && (
              <Alert color="yellow" mb="md">
                This content is being reviewed. Approvals:{' '}
                {approvals.filter((a) => a.status === 'APPROVED').length}
              </Alert>
            )}

            {content.status === 'APPROVED' && (
              <Alert color="green" mb="md">
                This content has been approved and is ready to be published.
              </Alert>
            )}

            {content.status === 'REJECTED' && (
              <Alert color="red" mb="md">
                This content has been rejected. Please review the comments and
                make necessary changes.
              </Alert>
            )}

            {content.status === 'PUBLISHED' && (
              <Alert color="blue" mb="md">
                This content is published and visible to users.
              </Alert>
            )}

            {/* Approvals list */}
            {approvals.length > 0 ? (
              <Box mt="md">
                <Text fw={500} mb="sm">
                  Approval History
                </Text>
                <Stack gap="sm">
                  {approvals.map((approval) => (
                    <Card key={approval.id} withBorder p="sm">
                      <Group justify="space-between" align="flex-start">
                        <Box>
                          <Group gap="xs" align="center" mb={4}>
                            <Text size="sm" fw={500}>
                              {approval.user.name}
                            </Text>
                            <Badge
                              size="sm"
                              color={getApprovalColor(approval.status)}
                              leftSection={getApprovalIcon(approval.status)}
                            >
                              {approval.status}
                            </Badge>
                          </Group>
                          <Text size="xs" c="dimmed">
                            {formatDate(approval.updatedAt)}
                          </Text>
                        </Box>
                      </Group>
                      {approval.comments && (
                        <Text size="sm" mt="xs">
                          {approval.comments}
                        </Text>
                      )}
                    </Card>
                  ))}
                </Stack>
              </Box>
            ) : content.status !== 'DRAFT' ? (
              <Text size="sm" c="dimmed">
                No approvals have been submitted yet.
              </Text>
            ) : null}

            {/* Action buttons */}
            <Group gap="sm" mt="lg" wrap="wrap">
              {/* Submit for review button */}
              {canSubmitForReview && (
                <PermissionGuard permission={PERMISSIONS.CONTENT_EDIT}>
                  <Button
                    variant="outline"
                    color="blue"
                    leftSection={<IconSend size={16} />}
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
                  <Group gap="sm">
                    <Button
                      variant="filled"
                      color="green"
                      leftSection={<IconCheck size={16} />}
                      onClick={() => handleOpenDialog('approve')}
                      disabled={loading}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="filled"
                      color="red"
                      leftSection={<IconX size={16} />}
                      onClick={() => handleOpenDialog('reject')}
                      disabled={loading}
                    >
                      Reject
                    </Button>
                  </Group>
                </PermissionGuard>
              )}

              {/* Publish button */}
              {canPublish && (
                <PermissionGuard permission={PERMISSIONS.CONTENT_PUBLISH}>
                  <Button
                    variant="filled"
                    color="blue"
                    leftSection={<IconDeviceFloppy size={16} />}
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
                    variant="outline"
                    leftSection={<IconArrowLeft size={16} />}
                    onClick={() => handleOpenDialog('draft')}
                    disabled={loading}
                  >
                    Return to Draft
                  </Button>
                </PermissionGuard>
              )}
            </Group>
          </>
        )}
      </Card.Section>

      {/* Approval Modal */}
      <Modal
        opened={dialogOpen.open && dialogOpen.type === 'approve'}
        onClose={handleCloseDialog}
        title="Approve Content"
      >
        <Stack gap="md">
          <Text size="sm">
            You are approving "{content.title}". Please provide any comments
            (optional).
          </Text>
          <Textarea
            label="Comments"
            placeholder="Enter comments..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
          />
          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button color="green" onClick={handleApprove}>
              Approve
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Reject Modal */}
      <Modal
        opened={dialogOpen.open && dialogOpen.type === 'reject'}
        onClose={handleCloseDialog}
        title="Reject Content"
      >
        <Stack gap="md">
          <Text size="sm">
            You are rejecting "{content.title}". Please provide a reason for
            rejection.
          </Text>
          <Textarea
            label="Reason for Rejection"
            placeholder="Enter reason for rejection..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            required
          />
          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleReject}
              disabled={!comments.trim()}
            >
              Reject
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Submit for Review Modal */}
      <Modal
        opened={dialogOpen.open && dialogOpen.type === 'submit'}
        onClose={handleCloseDialog}
        title="Submit for Review"
      >
        <Stack gap="md">
          <Text size="sm">
            You are submitting "{content.title}" for review. Once submitted, it
            will be reviewed by moderators.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button color="blue" onClick={handleSubmitForReview}>
              Submit
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Publish Modal */}
      <Modal
        opened={dialogOpen.open && dialogOpen.type === 'publish'}
        onClose={handleCloseDialog}
        title="Publish Content"
      >
        <Stack gap="md">
          <Text size="sm">
            You are publishing "{content.title}". Once published, it will be
            visible to users.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button color="blue" onClick={handlePublish}>
              Publish
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Return to Draft Modal */}
      <Modal
        opened={dialogOpen.open && dialogOpen.type === 'draft'}
        onClose={handleCloseDialog}
        title="Return to Draft"
      >
        <Stack gap="md">
          <Text size="sm">
            You are returning "{content.title}" to draft state. Please provide a
            reason.
          </Text>
          <Textarea
            label="Reason"
            placeholder="Enter reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            required
          />
          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleReturnToDraft} disabled={!reason.trim()}>
              Return to Draft
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Card>
  );
}
