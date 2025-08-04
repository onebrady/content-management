'use client';

import { Editor, FloatingMenu } from '@tiptap/react';
import { Button, Group, Box, Paper, Divider, Tooltip } from '@mantine/core';
import {
  IconBold,
  IconItalic,
  IconStrikethrough,
  IconLink,
  IconCode,
  IconQuote,
  IconList,
  IconListNumbers,
  IconHeading,
  IconHeading2,
  IconHeading3,
  IconPhoto,
} from '@tabler/icons-react';

interface FloatingToolbarProps {
  editor: Editor;
}

export function FloatingToolbar({ editor }: FloatingToolbarProps) {
  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Enter the URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter the image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }}>
      <Paper
        shadow="md"
        p="xs"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flexWrap: 'wrap',
          maxWidth: 400,
          borderRadius: 8,
          border: '1px solid var(--mantine-color-gray-3)',
        }}
      >
        {/* Text Formatting */}
        <Group gap={4}>
          <Tooltip label="Bold (Ctrl+B)">
            <Button
              variant={editor.isActive('bold') ? 'filled' : 'light'}
              size="xs"
              onClick={() => editor.chain().focus().toggleBold().run()}
              style={{ minWidth: 32, height: 32 }}
            >
              <IconBold size={16} />
            </Button>
          </Tooltip>
          <Tooltip label="Italic (Ctrl+I)">
            <Button
              variant={editor.isActive('italic') ? 'filled' : 'light'}
              size="xs"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              style={{ minWidth: 32, height: 32 }}
            >
              <IconItalic size={16} />
            </Button>
          </Tooltip>
          <Tooltip label="Strikethrough">
            <Button
              variant={editor.isActive('strike') ? 'filled' : 'light'}
              size="xs"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              style={{ minWidth: 32, height: 32 }}
            >
              <IconStrikethrough size={16} />
            </Button>
          </Tooltip>
        </Group>

        <Divider orientation="vertical" />

        {/* Headings */}
        <Group gap={4}>
          <Tooltip label="Heading 1 (Ctrl+1)">
            <Button
              variant={
                editor.isActive('heading', { level: 1 }) ? 'filled' : 'light'
              }
              size="xs"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              style={{ minWidth: 32, height: 32, fontWeight: 'bold' }}
            >
              H1
            </Button>
          </Tooltip>
          <Tooltip label="Heading 2 (Ctrl+2)">
            <Button
              variant={
                editor.isActive('heading', { level: 2 }) ? 'filled' : 'light'
              }
              size="xs"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              style={{ minWidth: 32, height: 32, fontWeight: 600 }}
            >
              H2
            </Button>
          </Tooltip>
          <Tooltip label="Heading 3 (Ctrl+3)">
            <Button
              variant={
                editor.isActive('heading', { level: 3 }) ? 'filled' : 'light'
              }
              size="xs"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              style={{ minWidth: 32, height: 32, fontWeight: 500 }}
            >
              H3
            </Button>
          </Tooltip>
        </Group>

        <Divider orientation="vertical" />

        {/* Lists */}
        <Group gap={4}>
          <Tooltip label="Bullet List">
            <Button
              variant={editor.isActive('bulletList') ? 'filled' : 'light'}
              size="xs"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              style={{ minWidth: 32, height: 32 }}
            >
              <IconList size={16} />
            </Button>
          </Tooltip>
          <Tooltip label="Numbered List">
            <Button
              variant={editor.isActive('orderedList') ? 'filled' : 'light'}
              size="xs"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              style={{ minWidth: 32, height: 32 }}
            >
              <IconListNumbers size={16} />
            </Button>
          </Tooltip>
        </Group>

        <Divider orientation="vertical" />

        {/* Block Elements */}
        <Group gap={4}>
          <Tooltip label="Blockquote">
            <Button
              variant={editor.isActive('blockquote') ? 'filled' : 'light'}
              size="xs"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              style={{ minWidth: 32, height: 32 }}
            >
              <IconQuote size={16} />
            </Button>
          </Tooltip>
          <Tooltip label="Code Block">
            <Button
              variant={editor.isActive('codeBlock') ? 'filled' : 'light'}
              size="xs"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              style={{ minWidth: 32, height: 32 }}
            >
              <IconCode size={16} />
            </Button>
          </Tooltip>
        </Group>

        <Divider orientation="vertical" />

        {/* Links and Images */}
        <Box style={{ display: 'flex', gap: 4 }}>
          <Tooltip label="Add Link">
            <Button
              size="xs"
              variant="light"
              onClick={addLink}
              style={{ width: 32, height: 32 }}
            >
              <IconLink size={16} />
            </Button>
          </Tooltip>
          <Tooltip label="Add Image">
            <Button
              size="xs"
              variant="light"
              onClick={addImage}
              style={{ width: 32, height: 32 }}
            >
              <IconPhoto size={16} />
            </Button>
          </Tooltip>
        </Box>
      </Paper>
    </FloatingMenu>
  );
}
