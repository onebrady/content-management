'use client';

import { Editor } from '@tiptap/react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save,
  Preview,
  Fullscreen,
  FullscreenExit,
} from '@mui/icons-material';
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
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCharacterCount = () => {
    if (!editor) return 0;
    return editor.getText().length;
  };

  return (
    <Box
      sx={{
        p: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Rich Text Editor
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={`${getWordCount()} words`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${getCharacterCount()} chars`}
            size="small"
            variant="outlined"
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {onSave && (
          <Tooltip title="Save">
            <IconButton size="small" onClick={onSave}>
              <Save />
            </IconButton>
          </Tooltip>
        )}

        {onPreview && (
          <Tooltip title="Preview">
            <IconButton size="small" onClick={onPreview}>
              <Preview />
            </IconButton>
          </Tooltip>
        )}

        {showFullscreen && (
          <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
            <IconButton size="small" onClick={toggleFullscreen}>
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
} 