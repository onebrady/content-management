'use client';

import { useState } from 'react';
import {
  Box,
  Text,
  Stepper,
  Paper,
  Alert,
  useMantineColorScheme,
} from '@mantine/core';
import { ContentStatus } from '@prisma/client';
import { ApprovalActionButtons } from './ApprovalActionButtons';

interface ApprovalWorkflowProps {
  currentStatus: ContentStatus;
  contentId: string;
  onApprove?: (contentId: string, comments?: string) => Promise<void>;
  onReject?: (contentId: string, comments?: string) => Promise<void>;
  onSubmitForReview?: (contentId: string) => Promise<void>;
  onPublish?: (contentId: string) => Promise<void>;
  onReturnToDraft?: (contentId: string, reason: string) => Promise<void>;
  loading?: boolean;
}

export function ApprovalWorkflow({
  currentStatus,
  contentId,
  onApprove,
  onReject,
  onSubmitForReview,
  onPublish,
  onReturnToDraft,
  loading = false,
}: ApprovalWorkflowProps) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  // Define workflow steps
  const steps = [
    {
      label: 'Draft',
      description: 'Content is being created and edited.',
      status: 'DRAFT',
    },
    {
      label: 'In Review',
      description: 'Content is submitted for review by moderators.',
      status: 'IN_REVIEW',
    },
    {
      label: 'Approved',
      description: 'Content has been approved and is ready to publish.',
      status: 'APPROVED',
    },
    {
      label: 'Published',
      description: 'Content is published and visible to users.',
      status: 'PUBLISHED',
    },
  ];

  // Get the current step index
  const getCurrentStepIndex = () => {
    if (currentStatus === 'REJECTED') {
      // For rejected content, show as a special case at the "In Review" step
      return 1;
    }

    const index = steps.findIndex((step) => step.status === currentStatus);
    return index >= 0 ? index : 0;
  };

  const activeStep = getCurrentStepIndex();

  return (
    <Box>
      <Text size="lg" fw={600} mb="md">
        Approval Workflow
      </Text>

      {currentStatus === 'REJECTED' && (
        <Alert color="red" mb="md">
          This content has been rejected and needs revision before resubmission.
        </Alert>
      )}

      <Stepper
        active={activeStep}
        orientation="vertical"
        size="sm"
        color={isDark ? 'blue' : 'indigo'}
      >
        {steps.map((step, index) => (
          <Stepper.Step
            key={step.label}
            label={step.label}
            description={step.description}
            completed={(
              index < activeStep ||
              (currentStatus === 'PUBLISHED' && index === 3)
            ).toString()}
          >
            <Box mt="xs">
              <Text size="sm" c="dimmed">
                {step.description}
              </Text>
              {currentStatus === 'REJECTED' && index === 1 && (
                <Alert color="yellow" mt="xs" size="sm">
                  Content was rejected and needs revision.
                </Alert>
              )}
            </Box>
          </Stepper.Step>
        ))}
      </Stepper>

      {/* Action Buttons */}
      <Paper withBorder p="md" mt="lg">
        <Text size="sm" fw={500} mb="sm">
          Available Actions
        </Text>
        <ApprovalActionButtons
          contentId={contentId}
          currentStatus={currentStatus}
          onApprove={onApprove}
          onReject={onReject}
          onSubmitForReview={onSubmitForReview}
          onPublish={onPublish}
          onReturnToDraft={onReturnToDraft}
          loading={loading}
        />
      </Paper>

      {activeStep === steps.length && (
        <Paper withBorder p="md" mt="md">
          <Text size="sm" c="dimmed">
            All steps completed - content is published.
          </Text>
        </Paper>
      )}
    </Box>
  );
}
