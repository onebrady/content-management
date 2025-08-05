'use client';

import { Editor } from '@tiptap/react';
import {
  Button,
  Group,
  Divider,
  Box,
  Menu,
  Text,
  Badge,
  Stack,
} from '@mantine/core';
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
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconAlignJustify,
  IconChevronDown,
  IconMaximize,
  IconMinimize,
  IconDeviceFloppy,
  IconEye,
  IconFileText,
  IconHash,
} from '@tabler/icons-react';
import { useState } from 'react';

interface EditorMenuBarProps {
  editor: Editor;
  onSave?: () => void;
  onPreview?: () => void;
  showFullscreen?: boolean;
}

export function EditorMenuBar({
  editor,
  onSave,
  onPreview,
  showFullscreen = true,
}: EditorMenuBarProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // You can implement fullscreen logic here
  };

  const getWordCount = () => {
    if (!editor) return 0;
    const text = editor.getText();
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const getCharacterCount = () => {
    if (!editor) return 0;
    return editor.getText().length;
  };

  return (
    <Box
      p="md"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--mantine-color-border)',
        backgroundColor: 'var(--mantine-color-card)',
        borderRadius: 'var(--mantine-radius-md) var(--mantine-radius-md) 0 0',
      }}
    >
      <Group gap="lg" align="center">
        <Stack gap={0}>
          <Text size="sm" fw={600} c="dimmed" style={{ lineHeight: 1.2 }}>
            Rich Text Editor
          </Text>
          <Group gap="md" mt={6}>
            <Group gap={6} align="center">
              <IconFileText
                size={14}
                style={{ color: 'var(--mantine-color-primary-6)' }}
              />
              <Text size="xs" c="dimmed" fw={500}>
                {getWordCount()} words
              </Text>
            </Group>
            <Group gap={6} align="center">
              <IconHash
                size={14}
                style={{ color: 'var(--mantine-color-muted-6)' }}
              />
              <Text size="xs" c="dimmed" fw={500}>
                {getCharacterCount()} chars
              </Text>
            </Group>
          </Group>
        </Stack>
      </Group>

      <Group gap="xs">
        {onSave && (
          <Button
            size="sm"
            onClick={onSave}
            leftSection={<IconDeviceFloppy size={14} />}
            variant="light"
            color="blue"
          >
            Save
          </Button>
        )}

        {onPreview && (
          <Button
            size="sm"
            onClick={onPreview}
            leftSection={<IconEye size={14} />}
            variant="light"
            color="green"
          >
            Preview
          </Button>
        )}

        {showFullscreen && (
          <Button
            size="sm"
            onClick={toggleFullscreen}
            leftSection={
              isFullscreen ? (
                <IconMinimize size={14} />
              ) : (
                <IconMaximize size={14} />
              )
            }
            variant="light"
            color="blue"
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>
        )}
      </Group>
    </Box>
  );
}
