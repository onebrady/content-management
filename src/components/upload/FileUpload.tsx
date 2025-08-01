'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Download,
  Visibility,
  FileCopy,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useUploadThing } from '@/lib/uploadthing';
import { generateReactHelpers } from '@uploadthing/react';

const { useUploadThing: useUploadThingHook } = generateReactHelpers();

interface FileUploadProps {
  onUploadComplete?: (
    files: Array<{ url: string; name: string; size: number }>
  ) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  disabled?: boolean;
}

interface UploadedFile {
  url: string;
  name: string;
  size: number;
  type: string;
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = [
    'image/*',
    'application/pdf',
    'text/*',
    'video/*',
    'audio/*',
  ],
  disabled = false,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { startUpload, isUploading: uploadThingIsUploading } =
    useUploadThingHook('contentAttachment', {
      onClientUploadComplete: (res) => {
        setIsUploading(false);
        setUploadProgress(0);

        if (res && res.length > 0) {
          const newFiles = res.map((file) => ({
            url: file.url,
            name: file.name,
            size: file.size,
            type: file.type,
          }));

          setUploadedFiles((prev) => [...prev, ...newFiles]);
          onUploadComplete?.(newFiles);
        }
      },
      onUploadError: (error) => {
        setIsUploading(false);
        setUploadProgress(0);
        onUploadError?.(error.message);
      },
      onUploadProgress: (progress) => {
        setUploadProgress(progress);
      },
    });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled || uploadThingIsUploading) return;

      // Validate file count
      if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
        onUploadError?.(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Validate file sizes
      const oversizedFiles = acceptedFiles.filter(
        (file) => file.size > maxFileSize
      );
      if (oversizedFiles.length > 0) {
        onUploadError?.(
          `Files larger than ${formatFileSize(maxFileSize)} are not allowed`
        );
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        await startUpload(acceptedFiles);
      } catch (error) {
        setIsUploading(false);
        setUploadProgress(0);
        onUploadError?.(
          error instanceof Error ? error.message : 'Upload failed'
        );
      }
    },
    [
      disabled,
      uploadThingIsUploading,
      uploadedFiles.length,
      maxFiles,
      maxFileSize,
      startUpload,
      onUploadError,
    ]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: acceptedFileTypes.reduce(
        (acc, type) => {
          acc[type] = [];
          return acc;
        },
        {} as Record<string, string[]>
      ),
      disabled: disabled || isUploading,
      maxFiles: maxFiles - uploadedFiles.length,
    });

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.startsWith('text/')) return '📝';
    return '📎';
  };

  return (
    <Box>
      {/* Upload Area */}
      <Card
        {...getRootProps()}
        sx={{
          border: 2,
          borderStyle: 'dashed',
          borderColor: isDragActive
            ? 'primary.main'
            : isDragReject
              ? 'error.main'
              : 'grey.300',
          backgroundColor: isDragActive ? 'primary.50' : 'background.paper',
          cursor: disabled || isUploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: disabled || isUploading ? 'grey.300' : 'primary.main',
            backgroundColor:
              disabled || isUploading ? 'background.paper' : 'primary.50',
          },
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {isDragActive
              ? 'Drop files here'
              : isDragReject
                ? 'Some files were rejected'
                : 'Drag & drop files here'}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            or click to select files
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Max {maxFiles} files, up to {formatFileSize(maxFileSize)} each
          </Typography>
          {acceptedFileTypes.length > 0 && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Accepted: {acceptedFileTypes.join(', ')}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {isUploading && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Uploading...</Typography>
            <Typography variant="body2">
              {Math.round(uploadProgress)}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {/* Error Messages */}
      {isDragReject && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Some files were rejected. Please check file types and sizes.
        </Alert>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Uploaded Files ({uploadedFiles.length})
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {uploadedFiles.map((file, index) => (
              <Card key={index} variant="outlined">
                <CardContent sx={{ py: 1, px: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        flex: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: '1.2em' }}>
                        {getFileIcon(file.type)}
                      </Typography>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" noWrap>
                          {file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(file.size)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
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
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          <Download />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveFile(index)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* File Type Chips */}
      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {acceptedFileTypes.map((type) => (
          <Chip
            key={type}
            label={type}
            size="small"
            variant="outlined"
            color="primary"
          />
        ))}
      </Box>
    </Box>
  );
}
