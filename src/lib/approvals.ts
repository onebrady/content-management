import { prisma } from '@/lib/prisma';
import { ContentStatus, ApprovalStatus, UserRole } from '@prisma/client';

/**
 * Approval workflow rules:
 * 1. Content starts in DRAFT state
 * 2. When submitted for review, it moves to IN_REVIEW
 * 3. Approvers can APPROVE, REJECT, or mark as PENDING
 * 4. If any approver REJECTS, content becomes REJECTED
 * 5. If enough approvers APPROVE (threshold), content becomes APPROVED
 * 6. APPROVED content can be PUBLISHED by authorized users
 * 7. Content can be sent back to DRAFT for edits
 */

// Approval thresholds by content type
export const APPROVAL_THRESHOLDS: Record<string, number> = {
  ARTICLE: 1, // Articles need 1 approval
  BLOG_POST: 1, // Blog posts need 1 approval
  GUIDE: 2, // Guides need 2 approvals
  WHITEPAPER: 2, // Whitepapers need 2 approvals
  TEMPLATE: 1, // Templates need 1 approval
  DEFAULT: 1, // Default threshold
};

// Valid state transitions for content
export const VALID_STATUS_TRANSITIONS: Record<ContentStatus, ContentStatus[]> =
  {
    DRAFT: ['IN_REVIEW'],
    IN_REVIEW: ['APPROVED', 'REJECTED', 'DRAFT'],
    APPROVED: ['PUBLISHED', 'DRAFT', 'IN_REVIEW'],
    REJECTED: ['DRAFT', 'IN_REVIEW'],
    PUBLISHED: ['DRAFT'],
  };

// Roles that can transition content between states
export const STATUS_TRANSITION_ROLES: Record<string, UserRole[]> = {
  'DRAFT-IN_REVIEW': ['CONTRIBUTOR', 'MODERATOR', 'ADMIN'],
  'IN_REVIEW-APPROVED': ['MODERATOR', 'ADMIN'],
  'IN_REVIEW-REJECTED': ['MODERATOR', 'ADMIN'],
  'IN_REVIEW-DRAFT': ['CONTRIBUTOR', 'MODERATOR', 'ADMIN'],
  'APPROVED-PUBLISHED': ['MODERATOR', 'ADMIN'],
  'APPROVED-DRAFT': ['CONTRIBUTOR', 'MODERATOR', 'ADMIN'],
  'APPROVED-IN_REVIEW': ['CONTRIBUTOR', 'MODERATOR', 'ADMIN'],
  'REJECTED-DRAFT': ['CONTRIBUTOR', 'MODERATOR', 'ADMIN'],
  'REJECTED-IN_REVIEW': ['CONTRIBUTOR', 'MODERATOR', 'ADMIN'],
  'PUBLISHED-DRAFT': ['MODERATOR', 'ADMIN'],
};

// Check if a user can transition content from one status to another
export function canTransitionStatus(
  fromStatus: ContentStatus,
  toStatus: ContentStatus,
  userRole: UserRole,
  isAuthor: boolean
): boolean {
  // Check if the transition is valid
  if (!VALID_STATUS_TRANSITIONS[fromStatus]?.includes(toStatus)) {
    return false;
  }

  // Get allowed roles for this transition
  const allowedRoles = STATUS_TRANSITION_ROLES[`${fromStatus}-${toStatus}`];
  if (!allowedRoles) {
    return false;
  }

  // Check if user's role is allowed
  if (!allowedRoles.includes(userRole)) {
    return false;
  }

  // Authors can only submit their own content for review
  if (
    fromStatus === 'DRAFT' &&
    toStatus === 'IN_REVIEW' &&
    !isAuthor &&
    userRole !== 'ADMIN'
  ) {
    return false;
  }

  return true;
}

// Get the approval threshold for a content type
export function getApprovalThreshold(contentType: string): number {
  return APPROVAL_THRESHOLDS[contentType] || APPROVAL_THRESHOLDS.DEFAULT;
}

// Check if content has met approval threshold
export async function hasMetApprovalThreshold(
  contentId: string
): Promise<boolean> {
  // Get content with approvals
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    include: {
      approvals: true,
    },
  });

  if (!content) {
    return false;
  }

  // Count approvals
  const approvedCount = content.approvals.filter(
    (approval) => approval.status === ApprovalStatus.APPROVED
  ).length;

  // Get threshold for this content type
  const threshold = getApprovalThreshold(content.type);

  // Check if threshold is met
  return approvedCount >= threshold;
}

// Update content status based on approvals
export async function updateContentStatusBasedOnApprovals(
  contentId: string
): Promise<ContentStatus> {
  // Get content with approvals
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    include: {
      approvals: true,
    },
  });

  if (!content) {
    throw new Error('Content not found');
  }

  // Count approvals by status
  const approvalCounts = {
    APPROVED: content.approvals.filter(
      (a) => a.status === ApprovalStatus.APPROVED
    ).length,
    REJECTED: content.approvals.filter(
      (a) => a.status === ApprovalStatus.REJECTED
    ).length,
    PENDING: content.approvals.filter(
      (a) => a.status === ApprovalStatus.PENDING
    ).length,
  };

  // Get threshold for this content type
  const threshold = getApprovalThreshold(content.type);

  // Determine new content status based on approval counts
  let newStatus = content.status;

  // If there are any rejections, set to REJECTED
  if (approvalCounts.REJECTED > 0) {
    newStatus = 'REJECTED';
  }
  // If there are no rejections and threshold is met, set to APPROVED
  else if (
    approvalCounts.APPROVED >= threshold &&
    approvalCounts.REJECTED === 0
  ) {
    newStatus = 'APPROVED';
  }
  // If there are approvals in progress but threshold not met, set to IN_REVIEW
  else if (content.approvals.length > 0) {
    newStatus = 'IN_REVIEW';
  }

  // Update content status if it's different
  if (newStatus !== content.status) {
    await prisma.content.update({
      where: { id: contentId },
      data: { status: newStatus },
    });
  }

  return newStatus as ContentStatus;
}

// Submit content for review
export async function submitForReview(
  contentId: string,
  userId: string
): Promise<void> {
  // Get content
  const content = await prisma.content.findUnique({
    where: { id: contentId },
  });

  if (!content) {
    throw new Error('Content not found');
  }

  // Check if content is in DRAFT state
  if (content.status !== 'DRAFT') {
    throw new Error('Only draft content can be submitted for review');
  }

  // Update content status to IN_REVIEW
  await prisma.content.update({
    where: { id: contentId },
    data: { status: 'IN_REVIEW' },
  });

  // Create activity record for submission
  await prisma.contentActivity.create({
    data: {
      contentId,
      userId,
      action: 'SUBMITTED_FOR_REVIEW',
      details: 'Content submitted for review',
    },
  });
}

// Publish approved content
export async function publishContent(
  contentId: string,
  userId: string
): Promise<void> {
  // Get content
  const content = await prisma.content.findUnique({
    where: { id: contentId },
  });

  if (!content) {
    throw new Error('Content not found');
  }

  // Check if content is in APPROVED state
  if (content.status !== 'APPROVED') {
    throw new Error('Only approved content can be published');
  }

  // Update content status to PUBLISHED
  await prisma.content.update({
    where: { id: contentId },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  // Create activity record for publishing
  await prisma.contentActivity.create({
    data: {
      contentId,
      userId,
      action: 'PUBLISHED',
      details: 'Content published',
    },
  });
}

// Return content to draft for edits
export async function returnToDraft(
  contentId: string,
  userId: string,
  reason: string
): Promise<void> {
  // Get content
  const content = await prisma.content.findUnique({
    where: { id: contentId },
  });

  if (!content) {
    throw new Error('Content not found');
  }

  // Check if content is in a state that can be returned to draft
  if (!['IN_REVIEW', 'APPROVED', 'REJECTED'].includes(content.status)) {
    throw new Error('This content cannot be returned to draft');
  }

  // Update content status to DRAFT
  await prisma.content.update({
    where: { id: contentId },
    data: { status: 'DRAFT' },
  });

  // Create activity record for returning to draft
  await prisma.contentActivity.create({
    data: {
      contentId,
      userId,
      action: 'RETURNED_TO_DRAFT',
      details: reason || 'Content returned to draft for edits',
    },
  });
}
