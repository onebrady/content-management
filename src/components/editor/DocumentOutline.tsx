'use client';

import { Editor } from '@tiptap/react';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Title, TextFields, NavigateNext } from '@mui/icons-material';
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
        return <Title fontSize="small" />;
      case 2:
        return <TextFields fontSize="small" />;
      default:
        return <TextFields fontSize="small" />;
    }
  };

  const getHeadingIndent = (level: number) => {
    return (level - 1) * 16;
  };

  if (!editor) return null;

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Toggle Button */}
      <Tooltip title="Document Outline">
        <IconButton
          size="small"
          onClick={() => setIsVisible(!isVisible)}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <NavigateNext
            sx={{
              transform: isVisible ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </IconButton>
      </Tooltip>

      {/* Outline Panel */}
      {isVisible && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: 40,
            right: 8,
            width: 280,
            maxHeight: 400,
            overflow: 'auto',
            zIndex: 10,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Document Outline
            </Typography>
          </Box>
          <List dense>
            {headings.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No headings found"
                  secondary="Add headings to see document structure"
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ) : (
              headings.map((heading, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton
                    onClick={() => scrollToHeading(heading.pos)}
                    sx={{
                      pl: 2 + getHeadingIndent(heading.level),
                      py: 0.5,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      {getHeadingIcon(heading.level)}
                    </Box>
                    <ListItemText
                      primary={heading.text}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontSize: heading.level === 1 ? '0.9rem' : '0.8rem',
                        fontWeight: heading.level === 1 ? 600 : 500,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>
        </Paper>
      )}
    </Box>
  );
}
