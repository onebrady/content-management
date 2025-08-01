'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Alert,
} from '@mui/material';
import { ContentStatus } from '@prisma/client';

interface ApprovalWorkflowProps {
  currentStatus: ContentStatus;
}

export function ApprovalWorkflow({ currentStatus }: ApprovalWorkflowProps) {
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
    <Box sx={{ maxWidth: 400 }}>
      <Typography variant="h6" gutterBottom>
        Approval Workflow
      </Typography>

      {currentStatus === 'REJECTED' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          This content has been rejected and needs revision before resubmission.
        </Alert>
      )}

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step
            key={step.label}
            completed={
              index < activeStep ||
              (currentStatus === 'PUBLISHED' && index === 3)
            }
          >
            <StepLabel>
              <Typography
                variant="subtitle1"
                fontWeight={index === activeStep ? 'bold' : 'normal'}
              >
                {step.label}
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography>{step.description}</Typography>
              {currentStatus === 'REJECTED' && index === 1 && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  Content was rejected and needs revision.
                </Alert>
              )}
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>All steps completed - content is published.</Typography>
        </Paper>
      )}
    </Box>
  );
}
