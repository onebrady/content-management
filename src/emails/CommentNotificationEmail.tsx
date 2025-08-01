import React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import BaseEmail from './BaseEmail';

interface CommentNotificationEmailProps {
  recipientName: string;
  commenterName: string;
  contentTitle: string;
  commentText: string;
  isReply: boolean;
  contentId: string;
  commentId: string;
}

export default function CommentNotificationEmail({
  recipientName,
  commenterName,
  contentTitle,
  commentText,
  isReply,
  contentId,
  commentId,
}: CommentNotificationEmailProps) {
  const previewText = isReply
    ? `${commenterName} replied to your comment on "${contentTitle}"`
    : `${commenterName} commented on your content "${contentTitle}"`;

  return (
    <BaseEmail previewText={previewText}>
      <Heading as="h2">
        {isReply ? 'New Reply to Your Comment' : 'New Comment on Your Content'}
      </Heading>

      <Text>Hello {recipientName},</Text>

      <Text>
        {isReply
          ? `${commenterName} has replied to your comment on "${contentTitle}".`
          : `${commenterName} has commented on your content "${contentTitle}".`}
      </Text>

      <Section
        style={{
          backgroundColor: '#f6f6f6',
          padding: '12px',
          borderRadius: '4px',
          margin: '16px 0',
        }}
      >
        <Text style={{ fontStyle: 'italic', margin: '0' }}>
          "
          {commentText.length > 150
            ? `${commentText.substring(0, 150)}...`
            : commentText}
          "
        </Text>
      </Section>

      <Button
        href={`${process.env.NEXT_PUBLIC_APP_URL}/content/${contentId}?commentId=${commentId}`}
        style={{ backgroundColor: '#1976d2', color: '#fff' }}
      >
        View {isReply ? 'Reply' : 'Comment'}
      </Button>

      <Text style={{ fontSize: '14px', color: '#666', marginTop: '24px' }}>
        You are receiving this email because you are subscribed to notifications
        for content you created or commented on.
      </Text>
    </BaseEmail>
  );
}
