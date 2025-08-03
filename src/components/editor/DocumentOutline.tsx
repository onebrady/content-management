'use client';

import { Editor } from '@tiptap/react';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Text,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconHeading,
  IconTextResize,
  IconChevronRight,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';

interface DocumentOutlineProps {
  editor: Editor;
}

interface HeadingItem {
  level: number;
  text: string;
  pos: number;
}

export function DocumentOutline({ editor }: DocumentOutlineProps) {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!editor) return;

    const updateHeadings = () => {
      const headingNodes = editor.state.doc.content.content.filter(
        (node) => node.type.name === 'heading'
      );

      const headingItems: HeadingItem[] = [];
      let pos = 0;

      editor.state.doc.descendants((node, nodePos) => {
        if (node.type.name === 'heading') {
          headingItems.push({
            level: node.attrs.level,
            text: node.textContent,
            pos: nodePos,
          });
        }
      });

      setHeadings(headingItems);
    };

    // Update headings when content changes
    editor.on('update', updateHeadings);
    updateHeadings();

    return () => {
      editor.off('update', updateHeadings);
    };
  }, [editor]);

  const scrollToHeading = (pos: number) => {
    editor.commands.setTextSelection(pos);
    editor.commands.scrollIntoView();
  };

  const getHeadingIcon = (level: number) => {
    switch (level) {
      case 1:
        return <IconHeading size={16} />;
      case 2:
        return <IconTextResize size={16} />;
      default:
        return <IconTextResize size={16} />;
    }
  };

  const getHeadingIndent = (level: number) => {
    return (level - 1) * 16;
  };

  if (!editor) return null;

  return (
    <Box style={{ position: 'relative' }}>
      {/* Toggle Button */}
      <Tooltip label="Document Outline">
        <ActionIcon
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
          }}
        >
          <IconChevronRight
            size={16}
            style={{
              transform: isVisible ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </ActionIcon>
      </Tooltip>

      {/* Outline Panel */}
      {isVisible && (
        <Paper
          shadow="md"
          style={{
            position: 'absolute',
            top: 40,
            right: 8,
            width: 280,
            maxHeight: 400,
            overflow: 'auto',
            zIndex: 10,
          }}
        >
          <Box
            p="xs"
            style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
          >
            <Text size="sm" fw={600}>
              Document Outline
            </Text>
          </Box>
          <List size="sm">
            {headings.length === 0 ? (
              <ListItem>
                <Text size="xs" c="dimmed">
                  No headings found
                </Text>
                <Text size="xs" c="dimmed">
                  Add headings to see document structure
                </Text>
              </ListItem>
            ) : (
              headings.map((heading, index) => (
                <ListItem key={index}>
                  <Box
                    onClick={() => scrollToHeading(heading.pos)}
                    style={{
                      paddingLeft: 16 + getHeadingIndent(heading.level),
                      paddingY: 4,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      '&:hover': {
                        backgroundColor: 'var(--mantine-color-gray-1)',
                      },
                    }}
                  >
                    {getHeadingIcon(heading.level)}
                    <Text
                      size="xs"
                      style={{
                        fontSize: heading.level === 1 ? '0.9rem' : '0.8rem',
                        fontWeight: heading.level === 1 ? 600 : 500,
                      }}
                    >
                      {heading.text}
                    </Text>
                  </Box>
                </ListItem>
              ))
            )}
          </List>
        </Paper>
      )}
    </Box>
  );
}
