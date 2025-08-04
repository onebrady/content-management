import { Resend } from 'resend';
import React from 'react';

// Initialize Resend with API key
const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Email configuration
export const emailConfig = {
  from: process.env.EMAIL_FROM || 'noreply@example.com',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@example.com',
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};

// Email sending function with error handling
export async function sendEmail({
  to,
  subject,
  html,
  text,
  react,
  from = emailConfig.from,
  replyTo = emailConfig.replyTo,
}: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  react?: React.ReactElement;
  from?: string;
  replyTo?: string;
}) {
  if (!resend) {
    console.error('Resend API key not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const emailData: any = {
      from,
      to,
      subject,
      reply_to: replyTo,
    };

    // Use React component if provided, otherwise use html/text
    if (react) {
      emailData.react = react;
    } else if (html) {
      emailData.html = html;
      if (text) {
        emailData.text = text;
      }
    } else {
      return { success: false, error: 'Missing html, text, or react field' };
    }

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error('Failed to send email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Function to format email addresses
export function formatEmailAddress(email: string, name?: string) {
  return name ? `${name} <${email}>` : email;
}

// Email queue for batch processing
interface QueuedEmail {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  react?: React.ReactElement;
  from?: string;
  replyTo?: string;
  priority?: 'high' | 'normal' | 'low';
  attempts?: number;
  maxAttempts?: number;
}

const emailQueue: QueuedEmail[] = [];
let isProcessingQueue = false;

// Add email to queue
export function queueEmail(email: QueuedEmail) {
  emailQueue.push({
    ...email,
    priority: email.priority || 'normal',
    attempts: 0,
    maxAttempts: 3,
  });

  // Start processing the queue if not already processing
  if (!isProcessingQueue) {
    processEmailQueue();
  }
}

// Process email queue
async function processEmailQueue() {
  if (emailQueue.length === 0 || isProcessingQueue) {
    isProcessingQueue = false;
    return;
  }

  isProcessingQueue = true;

  // Sort queue by priority
  emailQueue.sort((a, b) => {
    const priorityValues = { high: 0, normal: 1, low: 2 };
    return (
      priorityValues[a.priority || 'normal'] -
      priorityValues[b.priority || 'normal']
    );
  });

  // Process the first email in the queue
  const email = emailQueue.shift();
  if (email) {
    try {
      const result = await sendEmail({
        to: email.to,
        subject: email.subject,
        html: email.html,
        text: email.text,
        react: email.react,
        from: email.from,
        replyTo: email.replyTo,
      });

      if (!result.success && (email.attempts || 0) < (email.maxAttempts || 3)) {
        // Requeue with increased attempt count
        emailQueue.push({
          ...email,
          attempts: (email.attempts || 0) + 1,
        });
      }
    } catch (error) {
      console.error('Error processing email from queue:', error);

      // Requeue if under max attempts
      if ((email.attempts || 0) < (email.maxAttempts || 3)) {
        emailQueue.push({
          ...email,
          attempts: (email.attempts || 0) + 1,
        });
      }
    }
  }

  // Continue processing the queue
  setTimeout(processEmailQueue, 1000);
}
