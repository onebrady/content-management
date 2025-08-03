'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Textarea,
  Button,
  Loader,
  Text,
  Paper,
  Group,
  Alert,
} from '@mantine/core';
import { IconSend } from '@tabler/icons-react';

interface CommentFormProps {
  onSubmit: (text: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  buttonText?: string;
  initialValue?: string;
  autoFocus?: boolean;
}

export function CommentForm({
  onSubmit,
  onCancel,
  placeholder = 'Write a comment...',
  buttonText = 'Submit',
  initialValue = '',
  autoFocus = false,
}: CommentFormProps) {
  const [text, setText] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus the textarea on mount if autoFocus is true
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Handle text change
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
    if (error) {
      setError(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validate input
    if (!text.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(text);
      setText('');
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to submit comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setText(initialValue);
    setError(null);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      p="md"
      withBorder
      radius="md"
    >
      {error && (
        <Alert color="red" mb="md" variant="light">
          {error}
        </Alert>
      )}

      <Textarea
        ref={textareaRef}
        placeholder={placeholder}
        value={text}
        onChange={handleTextChange}
        disabled={submitting}
        minRows={2}
        maxRows={6}
        mb="md"
        autosize
      />

      <Group justify="flex-end" gap="sm">
        {onCancel && (
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={submitting || !text.trim()}
          leftSection={
            submitting ? <Loader size="xs" /> : <IconSend size={16} />
          }
        >
          {buttonText}
        </Button>
      </Group>
    </Paper>
  );
}
