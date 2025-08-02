'use client';

import { Editor } from '@tiptap/react';
import {
  Box,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatStrikethrough,
  FormatListBulleted,
  FormatListNumbered,
  FormatIndentIncrease,
  FormatIndentDecrease,
  Link,
  Image,
} from '@mui/icons-material';

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
      elevation={8}
      sx={{
        p: 0.5,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        flexWrap: 'nowrap',
        minWidth: 'fit-content',
        maxWidth: 'none',
        width: 'max-content',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        overflow: 'visible',
        whiteSpace: 'nowrap',
      }}
    >
      {/* Text Formatting */}
      <ToggleButtonGroup size="small" value="" exclusive>
        <Tooltip title="Bold (Ctrl+B)">
          <ToggleButton
            value="bold"
            selected={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            sx={{ minWidth: 28, height: 28 }}
          >
            <FormatBold fontSize="small" />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Italic (Ctrl+I)">
          <ToggleButton
            value="italic"
            selected={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            sx={{ minWidth: 28, height: 28 }}
          >
            <FormatItalic fontSize="small" />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Strikethrough">
          <ToggleButton
            value="strike"
            selected={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            sx={{ minWidth: 28, height: 28 }}
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
            sx={{
              minWidth: 28,
              height: 28,
              fontWeight: 'bold',
              fontSize: '0.7rem',
            }}
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
            sx={{
              minWidth: 28,
              height: 28,
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
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
            sx={{
              minWidth: 28,
              height: 28,
              fontWeight: 500,
              fontSize: '0.7rem',
            }}
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
            sx={{ minWidth: 28, height: 28 }}
          >
            <FormatListBulleted fontSize="small" />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Numbered List">
          <ToggleButton
            value="orderedList"
            selected={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            sx={{ minWidth: 28, height: 28 }}
          >
            <FormatListNumbered fontSize="small" />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem />

      {/* Indentation */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="Decrease Indent">
          <IconButton
            size="small"
            onClick={() =>
              editor.chain().focus().liftListItem('listItem').run()
            }
            sx={{ width: 28, height: 28 }}
          >
            <FormatIndentDecrease fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Increase Indent">
          <IconButton
            size="small"
            onClick={() =>
              editor.chain().focus().sinkListItem('listItem').run()
            }
            sx={{ width: 28, height: 28 }}
          >
            <FormatIndentIncrease fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Link and Image */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="Add Link">
          <IconButton
            size="small"
            onClick={addLink}
            sx={{ width: 28, height: 28 }}
          >
            <Link fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Add Image">
          <IconButton
            size="small"
            onClick={addImage}
            sx={{ width: 28, height: 28 }}
          >
            <Image fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
}
