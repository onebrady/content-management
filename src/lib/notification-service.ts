import { prisma } from '@/lib/prisma';
import { queueEmail } from '@/lib/email';
import { ApprovalStatus } from '@prisma/client';
import ApprovalRequestEmail from '@/emails/ApprovalRequestEmail';
import ApprovalStatusEmail from '@/emails/ApprovalStatusEmail';
import PublishedContentEmail from '@/emails/PublishedContentEmail';
import CommentNotificationEmail from '@/emails/CommentNotificationEmail';

/**
 * Send notifications to users who need to approve content
 */
export async function sendApprovalRequestNotifications(
  contentId: string
): Promise<void> {
  try {
    // Get content details with author
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!content) {
      console.error(`Content with ID ${contentId} not found`);
      return;
    }

    // Find moderators and admins who should approve
    const approvers = await prisma.user.findMany({
      where: {
        role: {
          in: ['MODERATOR', 'ADMIN'],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (approvers.length === 0) {
      console.warn('No approvers found in the system');
      return;
    }

    // Create notifications in database
    const notifications = approvers.map((approver) => ({
      userId: approver.id,
      contentId,
      type: 'APPROVAL_REQUESTED',
      message: `New content "${content.title}" requires your approval`,
    }));

    await prisma.notification.createMany({
      data: notifications,
    });

    // Send email to each approver
    for (const approver of approvers) {
      await queueEmail({
        to: approver.email,
        subject: `[Content Management] New content requires your approval: ${content.title}`,
        react: ApprovalRequestEmail({
          approverName: approver.name,
          contentTitle: content.title,
          contentType: content.type,
          authorName: content.author.name,
          contentId,
        }),
      });
    }
  } catch (error) {
    console.error('Error sending approval request notifications:', error);
  }
}

/**
 * Send notification to content author when approval status changes
 */
export async function sendApprovalStatusNotification(
  contentId: string,
  status: 'APPROVED' | 'REJECTED',
  approverId: string,
  comments?: string
): Promise<void> {
  try {
    // Get content details with author
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!content) {
      console.error(`Content with ID ${contentId} not found`);
      return;
    }

    // Get approver details
    const approver = await prisma.user.findUnique({
      where: { id: approverId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!approver) {
      console.error(`Approver with ID ${approverId} not found`);
      return;
    }

    // Create notification in database
    await prisma.notification.create({
      data: {
        userId: content.authorId,
        contentId,
        type: status === 'APPROVED' ? 'CONTENT_APPROVED' : 'CONTENT_REJECTED',
        message:
          status === 'APPROVED'
            ? `Your content "${content.title}" has been approved by ${approver.name}`
            : `Your content "${content.title}" has been rejected by ${approver.name}`,
      },
    });

    // Send email to author
    await queueEmail({
      to: content.author.email,
      subject: `[Content Management] Your content has been ${
        status === 'APPROVED' ? 'approved' : 'rejected'
      }: ${content.title}`,
      react: ApprovalStatusEmail({
        authorName: content.author.name,
        contentTitle: content.title,
        status:
          status === 'APPROVED'
            ? ApprovalStatus.APPROVED
            : ApprovalStatus.REJECTED,
        approverName: approver.name,
        comments,
        contentId,
      }),
    });
  } catch (error) {
    console.error('Error sending approval status notification:', error);
  }
}

/**
 * Send notification when content is published
 */
export async function sendPublishedContentNotification(
  contentId: string,
  publisherId: string
): Promise<void> {
  try {
    // Get content details with author
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!content) {
      console.error(`Content with ID ${contentId} not found`);
      return;
    }

    // Get publisher details
    const publisher = await prisma.user.findUnique({
      where: { id: publisherId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!publisher) {
      console.error(`Publisher with ID ${publisherId} not found`);
      return;
    }

    // Create notification in database
    await prisma.notification.create({
      data: {
        userId: content.authorId,
        contentId,
        type: 'CONTENT_PUBLISHED',
        message: `Your content "${content.title}" has been published by ${publisher.name}`,
      },
    });

    // Send email to author (if not self-published)
    if (content.authorId !== publisherId) {
      await queueEmail({
        to: content.author.email,
        subject: `[Content Management] Your content has been published: ${content.title}`,
        react: PublishedContentEmail({
          authorName: content.author.name,
          contentTitle: content.title,
          publisherName: publisher.name,
          contentId,
        }),
      });
    }
  } catch (error) {
    console.error('Error sending published content notification:', error);
  }
}

/**
 * Send notification about new comment
 */
export async function sendCommentNotification(
  contentId: string,
  commentId: string,
  commenterId: string
): Promise<void> {
  try {
    // Get comment details with content and author
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        content: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        parent: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!comment) {
      console.error(`Comment with ID ${commentId} not found`);
      return;
    }

    // Determine notification recipient
    let recipientId: string;
    let recipientName: string;
    let recipientEmail: string;
    let notificationType: string;
    let notificationMessage: string;

    if (comment.parentId) {
      // This is a reply to another comment
      recipientId = comment.parent!.userId;
      recipientName = comment.parent!.user.name;
      recipientEmail = comment.parent!.user.email;
      notificationType = 'COMMENT_REPLY';
      notificationMessage = `${comment.user.name} replied to your comment on "${comment.content.title}"`;
    } else {
      // This is a comment on content
      recipientId = comment.content.authorId;
      recipientName = comment.content.author.name;
      recipientEmail = comment.content.author.email;
      notificationType = 'NEW_COMMENT';
      notificationMessage = `${comment.user.name} commented on your content "${comment.content.title}"`;
    }

    // Don't notify if commenter is the recipient
    if (recipientId === commenterId) {
      return;
    }

    // Create notification in database
    await prisma.notification.create({
      data: {
        userId: recipientId,
        contentId,
        type: notificationType,
        message: notificationMessage,
      },
    });

    // Send email notification
    await queueEmail({
      to: recipientEmail,
      subject: `[Content Management] ${notificationMessage}`,
      react: CommentNotificationEmail({
        recipientName,
        commenterName: comment.user.name,
        contentTitle: comment.content.title,
        commentText: comment.commentText,
        isReply: !!comment.parentId,
        contentId,
        commentId,
      }),
    });
  } catch (error) {
    console.error('Error sending comment notification:', error);
  }
}
