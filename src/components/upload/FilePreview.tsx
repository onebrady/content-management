'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Text,
  ActionIcon,
  Tooltip,
  Modal,
  Button,
  Badge,
  Grid,
  Group,
  Image,
  Stack,
} from '@mantine/core';
import {
  IconEye,
  IconDownload,
  IconTrash,
  IconCopy,
  IconPhoto,
  IconFileText,
  IconVideo,
  IconMusic,
  IconFile,
  IconFileTypePdf,
} from '@tabler/icons-react';

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
    if (type.startsWith('image/')) return <IconPhoto size={20} />;
    if (type.includes('pdf')) return <IconFileTypePdf size={20} />;
    if (type.startsWith('video/')) return <IconVideo size={20} />;
    if (type.startsWith('audio/')) return <IconMusic size={20} />;
    if (type.startsWith('text/')) return <IconFileText size={20} />;
    return <IconFile size={20} />;
  };

  const getFileColor = (type: string) => {
    if (type.startsWith('image/')) return 'green';
    if (type.includes('pdf')) return 'red';
    if (type.startsWith('video/')) return 'yellow';
    if (type.startsWith('audio/')) return 'blue';
    if (type.startsWith('text/')) return 'blue';
    return 'gray';
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
    return (
      type.startsWith('image/') ||
      type.includes('pdf') ||
      type.startsWith('text/')
    );
  };

  const renderPreview = () => {
    if (!previewFile) return null;

    if (previewFile.type.startsWith('image/')) {
      return (
        <Image
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
          style={{
            maxHeight: '70vh',
            overflow: 'auto',
            backgroundColor: 'var(--mantine-color-gray-1)',
            padding: 'var(--mantine-spacing-md)',
            borderRadius: 'var(--mantine-radius-sm)',
            fontSize: '0.875rem',
          }}
        >
          {/* For text files, you might want to fetch and display the content */}
          <Text>Text file: {previewFile.name}</Text>
          <Text size="xs" c="dimmed">
            Click download to view the full content
          </Text>
        </Box>
      );
    }

    return (
      <Box ta="center" py="xl">
        <Text size="lg" fw={600} mb="md">
          Preview not available
        </Text>
        <Text size="sm" c="dimmed">
          This file type cannot be previewed. Use the download button to view
          the file.
        </Text>
      </Box>
    );
  };

  if (files.length === 0) {
    return (
      <Box ta="center" py="xl">
        <Text size="sm" c="dimmed">
          No files uploaded yet
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Grid>
        {files.slice(0, maxFiles).map((file, index) => (
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={index}>
            <Paper p="md" withBorder>
              <Group gap="sm" mb="xs">
                <Box c={`var(--mantine-color-${getFileColor(file.type)}-6)`}>
                  {getFileIcon(file.type)}
                </Box>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" fw={500} truncate>
                    {file.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {formatFileSize(file.size)}
                  </Text>
                </Box>
              </Group>

              {showActions && (
                <Group gap="xs" justify="flex-end">
                  {canPreview(file.type) && (
                    <Tooltip label="Preview">
                      <ActionIcon size="sm" onClick={() => handlePreview(file)}>
                        <IconEye size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                  <Tooltip label="Copy URL">
                    <ActionIcon
                      size="sm"
                      onClick={() => handleCopyUrl(file.url)}
                    >
                      <IconCopy size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Download">
                    <ActionIcon size="sm" onClick={() => handleDownload(file)}>
                      <IconDownload size={16} />
                    </ActionIcon>
                  </Tooltip>
                  {onRemove && (
                    <Tooltip label="Remove">
                      <ActionIcon
                        size="sm"
                        color="red"
                        onClick={() => onRemove(index)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              )}
            </Paper>
          </Grid.Col>
        ))}
      </Grid>

      {files.length > maxFiles && (
        <Box ta="center" mt="md">
          <Badge variant="outline" size="sm">
            +{files.length - maxFiles} more files
          </Badge>
        </Box>
      )}

      {/* Preview Modal */}
      <Modal
        opened={previewOpen}
        onClose={() => setPreviewOpen(false)}
        size="lg"
        title={
          <Group justify="space-between" align="center">
            <Text fw={600}>{previewFile?.name}</Text>
            <Group gap="xs">
              <Button
                size="xs"
                leftSection={<IconDownload size={14} />}
                onClick={() => handleDownload(previewFile)}
              >
                Download
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() => setPreviewOpen(false)}
              >
                Close
              </Button>
            </Group>
          </Group>
        }
      >
        {renderPreview()}
      </Modal>
    </Box>
  );
}
