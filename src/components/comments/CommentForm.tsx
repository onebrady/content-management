'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Paper,
} from '@mui/material';

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
  const textFieldRef = useRef<HTMLInputElement>(null);

  // Focus the text field on mount if autoFocus is true
  useEffect(() => {
    if (autoFocus && textFieldRef.current) {
      textFieldRef.current.focus();
    }
  }, [autoFocus]);

  // Handle text change
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      elevation={0}
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <TextField
        inputRef={textFieldRef}
        fullWidth
        multiline
        minRows={2}
        maxRows={6}
        placeholder={placeholder}
        value={text}
        onChange={handleTextChange}
        error={!!error}
        helperText={error}
        disabled={submitting}
        sx={{ mb: 2 }}
        InputProps={{
          sx: {
            bgcolor: 'background.paper',
          },
        }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        {onCancel && (
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          disabled={submitting || !text.trim()}
          startIcon={
            submitting ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {buttonText}
        </Button>
      </Box>
    </Paper>
  );
}
