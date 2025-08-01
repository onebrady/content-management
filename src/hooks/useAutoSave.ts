import { useCallback, useEffect, useRef } from 'react';

interface UseAutoSaveOptions {
  content: string;
  onSave: (content: string) => void;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave({
  content,
  onSave,
  delay = 3000, // 3 seconds
  enabled = true,
}: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedContent = useRef<string>('');

  const saveContent = useCallback(() => {
    if (content !== lastSavedContent.current) {
      onSave(content);
      lastSavedContent.current = content;
    }
  }, [content, onSave]);

  useEffect(() => {
    if (!enabled || !content) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(saveContent, delay);

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, delay, enabled, saveContent]);

  // Save immediately when component unmounts
  useEffect(() => {
    return () => {
      if (content !== lastSavedContent.current) {
        saveContent();
      }
    };
  }, [content, saveContent]);

  return {
    saveContent,
    isDirty: content !== lastSavedContent.current,
  };
}
