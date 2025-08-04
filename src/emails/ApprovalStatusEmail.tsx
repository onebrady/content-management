import React from 'react';
import { Text, Section } from '@react-email/components';
import BaseEmail from './BaseEmail';
import { emailConfig } from '@/lib/email';

interface ApprovalStatusEmailProps {
  recipientName: string;
  contentTitle: string;
  contentType: string;
  status: 'APPROVED' | 'REJECTED';
  approverName: string;
  comments?: string;
  contentId: string;
  contentSlug?: string;
}

export default function ApprovalStatusEmail({
  recipientName,
  contentTitle,
  contentType,
  status,
  approverName,
  comments,
  contentId,
  contentSlug,
}: ApprovalStatusEmailProps) {
  const contentUrl = contentSlug 
    ? `${emailConfig.baseUrl}/content/${contentSlug}`
    : `${emailConfig.baseUrl}/content?mode=view&id=${contentId}`;
  const statusLower = status.toLowerCase();
  const isApproved = status === 'APPROVED';

  return (
    <BaseEmail
      previewText={`Content ${statusLower}: ${contentTitle}`}
      title={`Content ${isApproved ? 'Approved' : 'Rejected'}`}
      heading={`Content ${isApproved ? 'Approved' : 'Rejected'}`}
      buttonText="View Content"
      buttonLink={contentUrl}
    >
      <Text className="text-gray-700 mb-4">Hello {recipientName},</Text>

      <Text className="text-gray-700 mb-4">
        Your {contentType.toLowerCase()} titled{' '}
        <strong>"{contentTitle}"</strong> has been{' '}
        <strong>{statusLower}</strong> by {approverName}.
      </Text>

      <Section
        className={`my-4 p-4 bg-gray-50 rounded-md border-l-4 ${isApproved ? 'border-green-500' : 'border-red-500'}`}
      >
        <Text className="text-gray-700 m-0">
          <strong>Content Type:</strong> {contentType}
        </Text>
        <Text className="text-gray-700 m-0">
          <strong>Title:</strong> {contentTitle}
        </Text>
        <Text className="text-gray-700 m-0">
          <strong>Status:</strong> {status}
        </Text>
        <Text className="text-gray-700 m-0">
          <strong>Reviewed By:</strong> {approverName}
        </Text>
      </Section>

      {comments && (
        <Section className="my-4">
          <Text className="text-gray-700 font-medium">Reviewer Comments:</Text>
          <Text className="text-gray-700 italic bg-gray-50 p-3 rounded-md">
            "{comments}"
          </Text>
        </Section>
      )}

      {isApproved ? (
        <Text className="text-gray-700">
          Your content is now ready to be published. Click the button below to
          view your content.
        </Text>
      ) : (
        <Text className="text-gray-700">
          Please review the feedback and make the necessary changes before
          resubmitting for approval.
        </Text>
      )}
    </BaseEmail>
  );
}
