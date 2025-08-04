import React from 'react';
import { Section, Text } from '@react-email/components';
import BaseEmail from './BaseEmail';

interface CommentNotificationEmailProps {
  recipientName: string;
  commenterName: string;
  contentTitle: string;
  commentText: string;
  isReply: boolean;
  contentId: string;
  commentId: string;
  contentSlug?: string;
}

export default function CommentNotificationEmail({
  recipientName,
  commenterName,
  contentTitle,
  commentText,
  isReply,
  contentId,
  commentId,
  contentSlug,
}: CommentNotificationEmailProps) {
  const previewText = isReply
    ? `${commenterName} replied to your comment on "${contentTitle}"`
    : `${commenterName} commented on your content "${contentTitle}"`;

  return (
    <BaseEmail
      previewText={previewText}
      title={
        isReply ? 'New Reply to Your Comment' : 'New Comment on Your Content'
      }
      heading={
        isReply ? 'New Reply to Your Comment' : 'New Comment on Your Content'
      }
      buttonText={`View ${isReply ? 'Reply' : 'Comment'}`}
      buttonLink={
        contentSlug
          ? `${process.env.NEXT_PUBLIC_APP_URL}/content/${contentSlug}?commentId=${commentId}`
          : `${process.env.NEXT_PUBLIC_APP_URL}/content?mode=view&id=${contentId}&commentId=${commentId}`
      }
    >
      <Text className="text-gray-700 mb-4">Hello {recipientName},</Text>

      <Text className="text-gray-700 mb-4">
        {isReply
          ? `${commenterName} has replied to your comment on "${contentTitle}".`
          : `${commenterName} has commented on your content "${contentTitle}".`}
      </Text>

      <Section className="my-4 p-4 bg-gray-50 rounded-md border-l-4 border-blue-500">
        <Text className="text-gray-700 m-0">
          <strong>Content:</strong> {contentTitle}
        </Text>
        <Text className="text-gray-700 m-0">
          <strong>Commenter:</strong> {commenterName}
        </Text>
        <Text className="text-gray-700 m-0">
          <strong>Type:</strong> {isReply ? 'Reply' : 'Comment'}
        </Text>
      </Section>

      <Section className="my-4 p-4 bg-gray-50 rounded-md border-l-4 border-gray-300">
        <Text className="text-gray-700 m-0 font-medium">Comment:</Text>
        <Text className="text-gray-700 italic m-0">
          "
          {commentText.length > 150
            ? `${commentText.substring(0, 150)}...`
            : commentText}
          "
        </Text>
      </Section>

      <Text className="text-gray-700">
        Click the button above to view the full comment and respond if needed.
      </Text>
    </BaseEmail>
  );
}
