'use client';

import { Editor } from '@tiptap/react';
import { FloatingMenu } from '@tiptap/react';
import {
  Box,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
  Divider,
  Typography,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatStrikethrough,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Code,
  Link,
  Image,
  Title,
  TextFields,
  Typography,
} from '@mui/icons-material';

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
        elevation={8}
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          flexWrap: 'wrap',
          maxWidth: 400,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Text Formatting */}
        <ToggleButtonGroup size="small" value="" exclusive>
          <Tooltip title="Bold (Ctrl+B)">
            <ToggleButton
              value="bold"
              selected={editor.isActive('bold')}
              onClick={() => editor.chain().focus().toggleBold().run()}
              sx={{ minWidth: 32, height: 32 }}
            >
              <FormatBold fontSize="small" />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Italic (Ctrl+I)">
            <ToggleButton
              value="italic"
              selected={editor.isActive('italic')}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              sx={{ minWidth: 32, height: 32 }}
            >
              <FormatItalic fontSize="small" />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Strikethrough">
            <ToggleButton
              value="strike"
              selected={editor.isActive('strike')}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              sx={{ minWidth: 32, height: 32 }}
            >
              <FormatStrikethrough fontSize="small" />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Headings */}
        <ToggleButtonGroup size="small" value="" exclusive>
          <Tooltip title="Heading 1 (Ctrl+1)">
            <ToggleButton
              value="h1"
              selected={editor.isActive('heading', { level: 1 })}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              sx={{ minWidth: 32, height: 32, fontWeight: 'bold' }}
            >
              H1
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Heading 2 (Ctrl+2)">
            <ToggleButton
              value="h2"
              selected={editor.isActive('heading', { level: 2 })}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              sx={{ minWidth: 32, height: 32, fontWeight: 600 }}
            >
              H2
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Heading 3 (Ctrl+3)">
            <ToggleButton
              value="h3"
              selected={editor.isActive('heading', { level: 3 })}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              sx={{ minWidth: 32, height: 32, fontWeight: 500 }}
            >
              H3
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Lists */}
        <ToggleButtonGroup size="small" value="" exclusive>
          <Tooltip title="Bullet List">
            <ToggleButton
              value="bulletList"
              selected={editor.isActive('bulletList')}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              sx={{ minWidth: 32, height: 32 }}
            >
              <FormatListBulleted fontSize="small" />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Numbered List">
            <ToggleButton
              value="orderedList"
              selected={editor.isActive('orderedList')}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              sx={{ minWidth: 32, height: 32 }}
            >
              <FormatListNumbered fontSize="small" />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Block Elements */}
        <ToggleButtonGroup size="small" value="" exclusive>
          <Tooltip title="Blockquote">
            <ToggleButton
              value="blockquote"
              selected={editor.isActive('blockquote')}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              sx={{ minWidth: 32, height: 32 }}
            >
              <FormatQuote fontSize="small" />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Code Block">
            <ToggleButton
              value="codeBlock"
              selected={editor.isActive('codeBlock')}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              sx={{ minWidth: 32, height: 32 }}
            >
              <Code fontSize="small" />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Links and Images */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Add Link">
            <IconButton
              size="small"
              onClick={addLink}
              sx={{ width: 32, height: 32 }}
            >
              <Link fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Image">
            <IconButton
              size="small"
              onClick={addImage}
              sx={{ width: 32, height: 32 }}
            >
              <Image fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
    </FloatingMenu>
  );
}
