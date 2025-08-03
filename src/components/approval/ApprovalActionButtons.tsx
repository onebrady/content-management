'use client';

import { useState } from 'react';
import {
  Button,
  Group,
  Stack,
  Text,
  Textarea,
  Modal,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconCheck,
  IconX,
  IconSend,
  IconEye,
  IconArrowBack,
} from '@tabler/icons-react';
import { ContentStatus } from '@prisma/client';

interface ApprovalActionButtonsProps {
  contentId: string;
  currentStatus: ContentStatus;
  onApprove?: (contentId: string, comments?: string) => Promise<void>;
  onReject?: (contentId: string, comments?: string) => Promise<void>;
  onSubmitForReview?: (contentId: string) => Promise<void>;
  onPublish?: (contentId: string) => Promise<void>;
  onReturnToDraft?: (contentId: string, reason: string) => Promise<void>;
  loading?: boolean;
}

export function ApprovalActionButtons({
  contentId,
  currentStatus,
  onApprove,
  onReject,
  onSubmitForReview,
  onPublish,
  onReturnToDraft,
  loading = false,
}: ApprovalActionButtonsProps) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showReturnToDraftModal, setShowReturnToDraftModal] = useState(false);
  const [comments, setComments] = useState('');

  const handleAction = async (action: string, comments?: string) => {
    try {
      switch (action) {
        case 'submit_for_review':
          await onSubmitForReview?.(contentId);
          break;
        case 'approve':
          await onApprove?.(contentId, comments);
          setShowApproveModal(false);
          break;
        case 'reject':
          await onReject?.(contentId, comments);
          setShowRejectModal(false);
          break;
        case 'publish':
          await onPublish?.(contentId);
          break;
        case 'return_to_draft':
          await onReturnToDraft?.(contentId, comments || '');
          setShowReturnToDraftModal(false);
          break;
      }
      setComments('');
    } catch (error) {
      console.error('Error performing approval action:', error);
    }
  };

  const canSubmitForReview = currentStatus === 'DRAFT' && !!onSubmitForReview;
  const canApprove = currentStatus === 'IN_REVIEW' && !!onApprove;
  const canReject = currentStatus === 'IN_REVIEW' && !!onReject;
  const canPublish = currentStatus === 'APPROVED' && !!onPublish;
  const canReturnToDraft =
    (currentStatus === 'IN_REVIEW' || currentStatus === 'APPROVED') &&
    !!onReturnToDraft;

  return (
    <>
      <Stack gap="sm">
        {/* Submit for Review */}
        {canSubmitForReview && (
          <Button
            variant="filled"
            color="blue"
            leftSection={<IconSend size={16} />}
            onClick={() => handleAction('submit_for_review')}
            loading={loading}
            fullWidth
          >
            Submit for Review
          </Button>
        )}

        {/* Approve/Reject Actions */}
        {currentStatus === 'IN_REVIEW' && (
          <Group gap="sm">
            {canApprove && (
              <Button
                variant="filled"
                color="green"
                leftSection={<IconCheck size={16} />}
                onClick={() => setShowApproveModal(true)}
                loading={loading}
                style={{ flex: 1 }}
              >
                Approve
              </Button>
            )}
            {canReject && (
              <Button
                variant="filled"
                color="red"
                leftSection={<IconX size={16} />}
                onClick={() => setShowRejectModal(true)}
                loading={loading}
                style={{ flex: 1 }}
              >
                Reject
              </Button>
            )}
          </Group>
        )}

        {/* Publish Action */}
        {canPublish && (
          <Button
            variant="filled"
            color="green"
            leftSection={<IconEye size={16} />}
            onClick={() => handleAction('publish')}
            loading={loading}
            fullWidth
          >
            Publish Content
          </Button>
        )}

        {/* Return to Draft */}
        {canReturnToDraft && (
          <Button
            variant="outline"
            color="gray"
            leftSection={<IconArrowBack size={16} />}
            onClick={() => setShowReturnToDraftModal(true)}
            loading={loading}
            fullWidth
          >
            Return to Draft
          </Button>
        )}
      </Stack>

      {/* Approve Modal */}
      <Modal
        opened={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Content"
        centered
        size="md"
      >
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to approve this content? You can add optional
            comments below.
          </Text>
          <Textarea
            label="Comments (optional)"
            placeholder="Add any comments about the approval..."
            value={comments}
            onChange={(e) => setComments(e.currentTarget.value)}
            rows={3}
          />
          <Group justify="flex-end" gap="sm">
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveModal(false);
                setComments('');
              }}
            >
              Cancel
            </Button>
            <Button
              color="green"
              onClick={() => handleAction('approve', comments)}
              loading={loading}
            >
              Approve
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Reject Modal */}
      <Modal
        opened={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Content"
        centered
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="red">
            Are you sure you want to reject this content? Please provide a
            reason for rejection.
          </Text>
          <Textarea
            label="Rejection Reason"
            placeholder="Please explain why this content is being rejected..."
            value={comments}
            onChange={(e) => setComments(e.currentTarget.value)}
            rows={3}
            required
          />
          <Group justify="flex-end" gap="sm">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setComments('');
              }}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => handleAction('reject', comments)}
              loading={loading}
              disabled={!comments.trim()}
            >
              Reject
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Return to Draft Modal */}
      <Modal
        opened={showReturnToDraftModal}
        onClose={() => setShowReturnToDraftModal(false)}
        title="Return to Draft"
        centered
        size="md"
      >
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to return this content to draft status? Please
            provide a reason.
          </Text>
          <Textarea
            label="Reason"
            placeholder="Please explain why this content is being returned to draft..."
            value={comments}
            onChange={(e) => setComments(e.currentTarget.value)}
            rows={3}
            required
          />
          <Group justify="flex-end" gap="sm">
            <Button
              variant="outline"
              onClick={() => {
                setShowReturnToDraftModal(false);
                setComments('');
              }}
            >
              Cancel
            </Button>
            <Button
              color="gray"
              onClick={() => handleAction('return_to_draft', comments)}
              loading={loading}
              disabled={!comments.trim()}
            >
              Return to Draft
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
