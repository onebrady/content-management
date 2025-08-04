'use client';

import { Editor } from '@tiptap/react';
import {
  Box,
  ActionIcon,
  Tooltip,
  Divider,
  Group,
  Button,
} from '@mantine/core';
import {
  IconBold,
  IconItalic,
  IconStrikethrough,
  IconList,
  IconListNumbers,
  IconQuote,
  IconCode,
  IconLink,
  IconPhoto,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconIndentIncrease,
  IconIndentDecrease,
} from '@tabler/icons-react';

interface EditorToolbarProps {
  editor: Editor;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
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
    <Box p="xs">
      <Group gap="xs" wrap="wrap">
        {/* Text Formatting */}
        <Group gap={4}>
          <Tooltip label="Bold">
            <ActionIcon
              variant={editor.isActive('bold') ? 'filled' : 'subtle'}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <IconBold size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Italic">
            <ActionIcon
              variant={editor.isActive('italic') ? 'filled' : 'subtle'}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <IconItalic size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Strikethrough">
            <ActionIcon
              variant={editor.isActive('strike') ? 'filled' : 'subtle'}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <IconStrikethrough size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Divider orientation="vertical" />

        {/* Headings */}
        <Group gap={4}>
          <Tooltip label="Heading 1">
            <Button
              size="xs"
              variant={
                editor.isActive('heading', { level: 1 }) ? 'filled' : 'subtle'
              }
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
            >
              H1
            </Button>
          </Tooltip>
          <Tooltip label="Heading 2">
            <Button
              size="xs"
              variant={
                editor.isActive('heading', { level: 2 }) ? 'filled' : 'subtle'
              }
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
            >
              H2
            </Button>
          </Tooltip>
          <Tooltip label="Heading 3">
            <Button
              size="xs"
              variant={
                editor.isActive('heading', { level: 3 }) ? 'filled' : 'subtle'
              }
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
            >
              H3
            </Button>
          </Tooltip>
        </Group>

        <Divider orientation="vertical" />

        {/* Lists */}
        <Group gap={4}>
          <Tooltip label="Bullet List">
            <ActionIcon
              variant={editor.isActive('bulletList') ? 'filled' : 'subtle'}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <IconList size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Numbered List">
            <ActionIcon
              variant={editor.isActive('orderedList') ? 'filled' : 'subtle'}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <IconListNumbers size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Divider orientation="vertical" />

        {/* Indentation */}
        <Group gap={4}>
          <Tooltip label="Decrease Indent">
            <ActionIcon
              variant="light"
              onClick={() => editor.chain().focus().outdent().run()}
              color="gray"
            >
              <IconIndentDecrease size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Increase Indent">
            <ActionIcon
              variant="light"
              onClick={() => editor.chain().focus().indent().run()}
              color="gray"
            >
              <IconIndentIncrease size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Divider orientation="vertical" />

        {/* Block Elements */}
        <Group gap={4}>
          <Tooltip label="Blockquote">
            <ActionIcon
              variant={editor.isActive('blockquote') ? 'filled' : 'subtle'}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <IconQuote size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Code Block">
            <ActionIcon
              variant={editor.isActive('codeBlock') ? 'filled' : 'subtle'}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            >
              <IconCode size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Divider orientation="vertical" />

        {/* Links and Media */}
        <Group gap={4}>
          <Tooltip label="Add Link">
            <ActionIcon
              variant={editor.isActive('link') ? 'filled' : 'light'}
              onClick={addLink}
              color={editor.isActive('link') ? 'blue' : 'gray'}
            >
              <IconLink size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Add Image">
            <ActionIcon variant="light" onClick={addImage} color="gray">
              <IconPhoto size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Divider orientation="vertical" />

        {/* History */}
        <Group gap={4}>
          <Tooltip label="Undo">
            <ActionIcon
              variant="subtle"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <IconArrowBackUp size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Redo">
            <ActionIcon
              variant="subtle"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <IconArrowForwardUp size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Box>
  );
}
