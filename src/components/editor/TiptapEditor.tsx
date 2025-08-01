'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Box, Paper, Divider } from '@mui/material';
import { EditorToolbar } from './EditorToolbar';
import { EditorMenuBar } from './EditorMenuBar';

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
  const editor = useEditor({
    extensions: [
      StarterKit,
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
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <Paper elevation={1} className={className}>
      <EditorMenuBar editor={editor} />
      <Divider />
      <EditorToolbar editor={editor} />
      <Divider />
      <Box sx={{ p: 2, minHeight: 200 }}>
        <EditorContent editor={editor} />
      </Box>
    </Paper>
  );
}
