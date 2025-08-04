'use client';

import { Editor } from '@tiptap/react';
import { ActionIcon, Group, Divider, Box, Paper, Tooltip } from '@mantine/core';
import {
  IconBold,
  IconItalic,
  IconStrikethrough,
  IconLink,
  IconCode,
  IconQuote,
  IconList,
  IconListNumbers,
  IconIndentIncrease,
  IconIndentDecrease,
  IconPhoto,
} from '@tabler/icons-react';

interface BubbleMenuComponentProps {
  editor: Editor;
}

export function BubbleMenuComponent({ editor }: BubbleMenuComponentProps) {
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
    <Paper
      shadow="md"
      p="xs"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        flexWrap: 'nowrap',
        minWidth: 'fit-content',
        maxWidth: 'none',
        width: 'max-content',
        borderRadius: 8,
        border: '1px solid var(--mantine-color-gray-3)',
        backgroundColor: 'var(--mantine-color-white)',
        overflow: 'visible',
        whiteSpace: 'nowrap',
      }}
    >
      {/* Text Formatting */}
      <Group gap={4}>
        <Tooltip label="Bold (Ctrl+B)">
          <ActionIcon
            variant={editor.isActive('bold') ? 'filled' : 'light'}
            size="xs"
            onClick={() => editor.chain().focus().toggleBold().run()}
            aria-label="Bold"
          >
            <IconBold size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Italic (Ctrl+I)">
          <ActionIcon
            variant={editor.isActive('italic') ? 'filled' : 'light'}
            size="xs"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Italic"
          >
            <IconItalic size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Strikethrough">
          <ActionIcon
            variant={editor.isActive('strike') ? 'filled' : 'light'}
            size="xs"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            aria-label="Strikethrough"
          >
            <IconStrikethrough size={14} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Divider orientation="vertical" />

      {/* Headings */}
      <Group gap={4}>
        <Tooltip label="Heading 1 (Ctrl+1)">
          <ActionIcon
            variant={
              editor.isActive('heading', { level: 1 }) ? 'filled' : 'light'
            }
            size="xs"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            aria-label="Heading 1"
            style={{
              fontWeight: 'bold',
              fontSize: '0.7rem',
            }}
          >
            H1
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Heading 2 (Ctrl+2)">
          <ActionIcon
            variant={
              editor.isActive('heading', { level: 2 }) ? 'filled' : 'light'
            }
            size="xs"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            aria-label="Heading 2"
            style={{
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          >
            H2
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Heading 3 (Ctrl+3)">
          <ActionIcon
            variant={
              editor.isActive('heading', { level: 3 }) ? 'filled' : 'light'
            }
            size="xs"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            aria-label="Heading 3"
            style={{
              fontWeight: 500,
              fontSize: '0.7rem',
            }}
          >
            H3
          </ActionIcon>
        </Tooltip>
      </Group>

      <Divider orientation="vertical" />

      {/* Lists */}
      <Group gap={4}>
        <Tooltip label="Bullet List">
          <ActionIcon
            variant={editor.isActive('bulletList') ? 'filled' : 'light'}
            size="xs"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            aria-label="Bullet List"
          >
            <IconList size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Numbered List">
          <ActionIcon
            variant={editor.isActive('orderedList') ? 'filled' : 'light'}
            size="xs"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            aria-label="Numbered List"
          >
            <IconListNumbers size={14} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Divider orientation="vertical" />

      {/* Indentation */}
      <Group gap={4}>
        <Tooltip label="Decrease Indent">
          <ActionIcon
            size="xs"
            variant="light"
            onClick={() =>
              editor.chain().focus().liftListItem('listItem').run()
            }
            aria-label="Decrease Indent"
          >
            <IconIndentDecrease size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Increase Indent">
          <ActionIcon
            size="xs"
            variant="light"
            onClick={() =>
              editor.chain().focus().sinkListItem('listItem').run()
            }
            aria-label="Increase Indent"
          >
            <IconIndentIncrease size={14} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Divider orientation="vertical" />

      {/* Link and Image */}
      <Group gap={4}>
        <Tooltip label="Add Link">
          <ActionIcon
            size="xs"
            variant="light"
            onClick={addLink}
            aria-label="Add Link"
          >
            <IconLink size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Add Image">
          <ActionIcon
            size="xs"
            variant="light"
            onClick={addImage}
            aria-label="Add Image"
          >
            <IconPhoto size={14} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Paper>
  );
}
