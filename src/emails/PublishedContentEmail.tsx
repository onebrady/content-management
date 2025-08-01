import React from 'react';
import { Text, Section } from '@react-email/components';
import BaseEmail from './BaseEmail';
import { emailConfig } from '@/lib/email';

interface PublishedContentEmailProps {
  recipientName: string;
  contentTitle: string;
  contentType: string;
  publisherName: string;
  contentId: string;
  publishDate: string;
}

export default function PublishedContentEmail({
  recipientName,
  contentTitle,
  contentType,
  publisherName,
  contentId,
  publishDate,
}: PublishedContentEmailProps) {
  const contentUrl = `${emailConfig.baseUrl}/content?view=${contentId}`;
  const formattedDate = new Date(publishDate).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <BaseEmail
      previewText={`Content published: ${contentTitle}`}
      title="Content Published"
      heading="Content Published Successfully"
      buttonText="View Published Content"
      buttonLink={contentUrl}
    >
      <Text className="text-gray-700 mb-4">Hello {recipientName},</Text>

      <Text className="text-gray-700 mb-4">
        Your {contentType.toLowerCase()} titled{' '}
        <strong>"{contentTitle}"</strong> has been published by {publisherName}.
      </Text>

      <Section className="my-4 p-4 bg-gray-50 rounded-md border-l-4 border-green-500">
        <Text className="text-gray-700 m-0">
          <strong>Content Type:</strong> {contentType}
        </Text>
        <Text className="text-gray-700 m-0">
          <strong>Title:</strong> {contentTitle}
        </Text>
        <Text className="text-gray-700 m-0">
          <strong>Published By:</strong> {publisherName}
        </Text>
        <Text className="text-gray-700 m-0">
          <strong>Published On:</strong> {formattedDate}
        </Text>
      </Section>

      <Text className="text-gray-700">
        Your content is now live and available to all users. Click the button
        below to view your published content.
      </Text>
    </BaseEmail>
  );
}
