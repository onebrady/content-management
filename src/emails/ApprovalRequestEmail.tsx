import React from 'react';
import { Text, Section } from '@react-email/components';
import BaseEmail from './BaseEmail';
import { emailConfig } from '@/lib/email';

interface ApprovalRequestEmailProps {
  recipientName: string;
  contentTitle: string;
  contentType: string;
  authorName: string;
  contentId: string;
  contentSlug?: string;
}

export default function ApprovalRequestEmail({
  recipientName,
  contentTitle,
  contentType,
  authorName,
  contentId,
  contentSlug,
}: ApprovalRequestEmailProps) {
  const contentUrl = contentSlug
    ? `${emailConfig.baseUrl}/content/${contentSlug}`
    : `${emailConfig.baseUrl}/content?mode=view&id=${contentId}`;

  return (
    <BaseEmail
      previewText={`New content approval request: ${contentTitle}`}
      title="Content Approval Request"
      heading="Content Approval Request"
      buttonText="Review Content"
      buttonLink={contentUrl}
    >
      <Text className="text-gray-700 mb-4">Hello {recipientName},</Text>

      <Text className="text-gray-700 mb-4">
        A new {contentType.toLowerCase()} titled{' '}
        <strong>"{contentTitle}"</strong> has been submitted for your approval
        by {authorName}.
      </Text>

      <Text className="text-gray-700 mb-4">
        Please review this content at your earliest convenience to keep the
        approval workflow moving forward.
      </Text>

      <Section className="my-4 p-4 bg-gray-50 rounded-md border-l-4 border-blue-500">
        <Text className="text-gray-700 m-0">
          <strong>Content Type:</strong> {contentType}
        </Text>
        <Text className="text-gray-700 m-0">
          <strong>Title:</strong> {contentTitle}
        </Text>
        <Text className="text-gray-700 m-0">
          <strong>Author:</strong> {authorName}
        </Text>
      </Section>

      <Text className="text-gray-700">
        Click the button below to review the content and provide your approval
        or feedback.
      </Text>
    </BaseEmail>
  );
}
