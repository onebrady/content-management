'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Grid,
} from '@mui/material';
import {
  Visibility,
  Download,
  Delete,
  FileCopy,
  Image,
  PictureAsPdf,
  VideoFile,
  AudioFile,
  Description,
  InsertDriveFile,
} from '@mui/icons-material';

interface FilePreviewProps {
  files: Array<{
    id?: string;
    url: string;
    name: string;
    size: number;
    type: string;
  }>;
  onRemove?: (index: number) => void;
  onDownload?: (file: any) => void;
  showActions?: boolean;
  maxFiles?: number;
}

export function FilePreview({
  files,
  onRemove,
  onDownload,
  showActions = true,
  maxFiles = 10,
}: FilePreviewProps) {
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image />;
    if (type.includes('pdf')) return <PictureAsPdf />;
    if (type.startsWith('video/')) return <VideoFile />;
    if (type.startsWith('audio/')) return <AudioFile />;
    if (type.startsWith('text/')) return <Description />;
    return <InsertDriveFile />;
  };

  const getFileColor = (type: string) => {
    if (type.startsWith('image/')) return 'success';
    if (type.includes('pdf')) return 'error';
    if (type.startsWith('video/')) return 'warning';
    if (type.startsWith('audio/')) return 'info';
    if (type.startsWith('text/')) return 'primary';
    return 'default';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePreview = (file: any) => {
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const handleDownload = (file: any) => {
    if (onDownload) {
      onDownload(file);
    } else {
      window.open(file.url, '_blank');
    }
  };

  const canPreview = (type: string) => {
    return type.startsWith('image/') || type.includes('pdf') || type.startsWith('text/');
  };

  const renderPreview = () => {
    if (!previewFile) return null;

    if (previewFile.type.startsWith('image/')) {
      return (
        <img
          src={previewFile.url}
          alt={previewFile.name}
          style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
        />
      );
    }

    if (previewFile.type.includes('pdf')) {
      return (
        <iframe
          src={previewFile.url}
          width="100%"
          height="70vh"
          title={previewFile.name}
        />
      );
    }

    if (previewFile.type.startsWith('text/')) {
      return (
        <Box
          component="pre"
          sx={{
            maxHeight: '70vh',
            overflow: 'auto',
            bgcolor: 'grey.100',
            p: 2,
            borderRadius: 1,
            fontSize: '0.875rem',
          }}
        >
          {/* For text files, you might want to fetch and display the content */}
          <Typography>Text file: {previewFile.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            Click download to view the full content
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" gutterBottom>
          Preview not available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This file type cannot be previewed. Use the download button to view the file.
        </Typography>
      </Box>
    );
  };

  if (files.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          No files uploaded yet
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {files.slice(0, maxFiles).map((file, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card variant="outlined">
              <CardContent sx={{ py: 2, px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ color: `${getFileColor(file.type)}.main` }}>
                    {getFileIcon(file.type)}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(file.size)}
                    </Typography>
                  </Box>
                </Box>

                {showActions && (
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                    {canPreview(file.type) && (
                      <Tooltip title="Preview">
                        <IconButton
                          size="small"
                          onClick={() => handlePreview(file)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Copy URL">
                      <IconButton
                        size="small"
                        onClick={() => handleCopyUrl(file.url)}
                      >
                        <FileCopy />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download">
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(file)}
                      >
                        <Download />
                      </IconButton>
                    </Tooltip>
                    {onRemove && (
                      <Tooltip title="Remove">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onRemove(index)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {files.length > maxFiles && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Chip
            label={`+${files.length - maxFiles} more files`}
            variant="outlined"
            color="primary"
          />
        </Box>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {previewFile?.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                startIcon={<Download />}
                onClick={() => handleDownload(previewFile)}
              >
                Download
              </Button>
              <Button
                size="small"
                onClick={() => setPreviewOpen(false)}
              >
                Close
              </Button>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {renderPreview()}
        </DialogContent>
      </Dialog>
    </Box>
  );
} 