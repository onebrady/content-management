'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Divider,
  Badge,
  Button,
  useMantineColorScheme,
  Group,
} from '@mantine/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { EditorMenuBar } from './EditorMenuBar';
import { EditorToolbar } from './EditorToolbar';
import { BubbleMenu } from '@tiptap/react';
import { BubbleMenuComponent } from './BubbleMenuComponent';
import { DocumentOutline } from './DocumentOutline';
import { IconInfoCircle } from '@tabler/icons-react';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  showStats?: boolean;
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  readOnly = false,
  showStats = false,
}: TiptapEditorProps) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [showStatsButton, setShowStatsButton] = useState(false);
  const [stats, setStats] = useState({ wordCount: 0, charCount: 0 });

  const extensions = useMemo(
    () => [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto',
        },
      }),
    ],
    [placeholder]
  );

  const editor = useEditor({
    extensions,
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
    // Add keyboard shortcuts
    onKeyDown: ({ event }) => {
      // Ctrl/Cmd + B for bold
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        editor.chain().focus().toggleBold().run();
        return true;
      }
      // Ctrl/Cmd + I for italic
      if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
        event.preventDefault();
        editor.chain().focus().toggleItalic().run();
        return true;
      }
      // Ctrl/Cmd + U for underline (strikethrough as alternative)
      if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
        event.preventDefault();
        editor.chain().focus().toggleStrike().run();
        return true;
      }
      // Ctrl/Cmd + K for link
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const url = window.prompt('Enter the URL');
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
        return true;
      }
      // Ctrl/Cmd + 1 for H1
      if ((event.ctrlKey || event.metaKey) && event.key === '1') {
        event.preventDefault();
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        return true;
      }
      // Ctrl/Cmd + 2 for H2
      if ((event.ctrlKey || event.metaKey) && event.key === '2') {
        event.preventDefault();
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        return true;
      }
      // Ctrl/Cmd + 3 for H3
      if ((event.ctrlKey || event.metaKey) && event.key === '3') {
        event.preventDefault();
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        return true;
      }
      return false;
    },
  });

  // Calculate stats only when showStats is true and stats button is clicked
  const calculateStats = useCallback(() => {
    if (editor) {
      const text = editor.getText();
      const wordCount = text
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
      const charCount = text.length;
      setStats({ wordCount, charCount });
    }
  }, [editor]);

  // Show stats button after content is added
  useEffect(() => {
    if (editor && showStats) {
      const text = editor.getText();
      if (text.trim().length > 0) {
        setShowStatsButton(true);
      }
    }
  }, [editor, showStats]);

  if (!editor) {
    return (
      <Box>
        <Paper p="md" withBorder>
          <Box style={{ minHeight: '200px' }} />
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Paper p="md" withBorder>
        {showStats && showStatsButton && (
          <Box mb="md">
            <Button
              variant="light"
              size="xs"
              onClick={calculateStats}
              style={{ marginBottom: '8px' }}
            >
              Show Word Count
            </Button>
            {stats.wordCount > 0 && (
              <Group gap="xs">
                <Badge variant="light" color="blue">
                  {stats.wordCount} words
                </Badge>
                <Badge variant="light" color="green">
                  {stats.charCount} characters
                </Badge>
              </Group>
            )}
          </Box>
        )}

        <EditorMenuBar editor={editor} />
        <Divider my="sm" />
        <EditorToolbar editor={editor} />

        <Box
          style={{
            border: `1px solid ${isDark ? '#373A40' : '#DEE2E6'}`,
            borderRadius: '4px',
            padding: '12px',
            minHeight: '300px',
            backgroundColor: isDark ? '#25262B' : '#FFFFFF',
          }}
        >
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <BubbleMenuComponent editor={editor} />
          </BubbleMenu>

          <EditorContent editor={editor} />

          {showStats && <DocumentOutline editor={editor} />}
        </Box>
      </Paper>
    </Box>
  );
}
