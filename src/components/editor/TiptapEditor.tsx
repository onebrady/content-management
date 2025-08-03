'use client';

import {
  useEditor,
  EditorContent,
  BubbleMenu,
  FloatingMenu,
} from '@tiptap/react';
import { useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Box, Paper, Divider, Text, Badge } from '@mantine/core';
import { EditorToolbar } from './EditorToolbar';
import { EditorMenuBar } from './EditorMenuBar';
import { FloatingToolbar } from './FloatingToolbar';
import { BubbleMenuComponent } from './BubbleMenuComponent';
import { DocumentOutline } from './DocumentOutline';

interface TiptapEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

export function TiptapEditor({
  content = '',
  onChange,
  placeholder = 'Start writing...',
  editable = true,
  className,
}: TiptapEditorProps) {
  console.log('TiptapEditor received content:', content);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      console.log('TiptapEditor onUpdate - HTML content:', html);
      onChange?.(html);
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

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      console.log('TiptapEditor updating content from prop:', content);
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  return (
    <Paper shadow="xs" className={className}>
      <EditorMenuBar editor={editor} />
      <Divider />
      <EditorToolbar editor={editor} />
      <Divider />
      <Box p="md" style={{ minHeight: 200, position: 'relative' }}>
        <EditorContent editor={editor} />

        {/* Floating Toolbar - appears when text is selected */}
        <FloatingToolbar editor={editor} />

        {/* Bubble Menu - appears on text selection */}
        {editor && (
          <BubbleMenu
            editor={editor}
            tippyOptions={{
              duration: 100,
              placement: 'top',
              offset: [0, 8],
              maxWidth: 'none',
              popperOptions: {
                modifiers: [
                  {
                    name: 'preventOverflow',
                    options: {
                      boundary: 'viewport',
                      padding: 8,
                    },
                  },
                  {
                    name: 'flip',
                    options: {
                      fallbackPlacements: ['bottom', 'top'],
                    },
                  },
                ],
              },
            }}
          >
            <BubbleMenuComponent editor={editor} />
          </BubbleMenu>
        )}

        {/* Document Stats */}
        <Box
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            display: 'flex',
            gap: 4,
            opacity: 0.7,
            '&:hover': { opacity: 1 },
          }}
        >
          <Badge variant="outline" size="sm">
            {
              editor
                .getText()
                .split(/\s+/)
                .filter((word) => word.length > 0).length
            }{' '}
            words
          </Badge>
          <Badge variant="outline" size="sm">
            {editor.getText().length} chars
          </Badge>
        </Box>

        {/* Document Outline */}
        <DocumentOutline editor={editor} />
      </Box>
    </Paper>
  );
}
