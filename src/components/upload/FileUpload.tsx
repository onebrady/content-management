'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Text,
  Button,
  Alert,
  Progress,
  Badge,
  ActionIcon,
  Tooltip,
  Paper,
  Group,
  Stack,
} from '@mantine/core';
import {
  IconUpload,
  IconTrash,
  IconDownload,
  IconEye,
  IconCopy,
} from '@tabler/icons-react';
import { Dropzone } from '@mantine/dropzone';
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
    <Stack gap="md">
      {/* Upload Area */}
      <Dropzone
        onDrop={onDrop}
        accept={acceptedFileTypes.reduce(
          (acc, type) => {
            acc[type] = [];
            return acc;
          },
          {} as Record<string, string[]>
        )}
        disabled={disabled || isUploading}
        maxFiles={maxFiles - uploadedFiles.length}
        maxSize={maxFileSize}
      >
        <Group
          justify="center"
          gap="xl"
          style={{ minHeight: 220, pointerEvents: 'none' }}
        >
          <Dropzone.Accept>
            <IconUpload
              size={50}
              stroke={1.5}
              color="var(--mantine-color-blue-6)"
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconUpload
              size={50}
              stroke={1.5}
              color="var(--mantine-color-red-6)"
            />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconUpload size={50} stroke={1.5} />
          </Dropzone.Idle>

          <div>
            <Text size="xl" inline>
              Drag files here or click to select
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              Max {maxFiles} files, up to {formatFileSize(maxFileSize)} each
            </Text>
            {acceptedFileTypes.length > 0 && (
              <Text size="xs" c="dimmed" mt={4}>
                Accepted: {acceptedFileTypes.join(', ')}
              </Text>
            )}
          </div>
        </Group>
      </Dropzone>

      {/* Upload Progress */}
      {isUploading && (
        <Box>
          <Group justify="space-between" mb="xs">
            <Text size="sm">Uploading...</Text>
            <Text size="sm">{Math.round(uploadProgress)}%</Text>
          </Group>
          <Progress value={uploadProgress} />
        </Box>
      )}

      {/* Error Messages */}
      <Alert color="red" title="Upload Error" style={{ display: 'none' }}>
        Some files were rejected. Please check file types and sizes.
      </Alert>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Box>
          <Text size="lg" fw={600} mb="md">
            Uploaded Files ({uploadedFiles.length})
          </Text>
          <Stack gap="xs">
            {uploadedFiles.map((file, index) => (
              <Paper key={index} p="md" withBorder>
                <Group justify="space-between" align="center">
                  <Group gap="sm" style={{ flex: 1 }}>
                    <Text size="lg">{getFileIcon(file.type)}</Text>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" fw={500} truncate>
                        {file.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatFileSize(file.size)}
                      </Text>
                    </Box>
                  </Group>
                  <Group gap="xs">
                    <Tooltip label="View">
                      <ActionIcon
                        size="sm"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Copy URL">
                      <ActionIcon
                        size="sm"
                        onClick={() => handleCopyUrl(file.url)}
                      >
                        <IconCopy size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Download">
                      <ActionIcon
                        size="sm"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <IconDownload size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Remove">
                      <ActionIcon
                        size="sm"
                        color="red"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}

      {/* File Type Badges */}
      <Group gap="xs">
        {acceptedFileTypes.map((type) => (
          <Badge key={type} variant="outline" size="sm">
            {type}
          </Badge>
        ))}
      </Group>
    </Stack>
  );
}
