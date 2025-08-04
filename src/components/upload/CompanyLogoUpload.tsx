'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Text,
  Button,
  Alert,
  Progress,
  ActionIcon,
  Tooltip,
  Paper,
  Group,
  Stack,
  Image,
  Modal,
} from '@mantine/core';
import { IconUpload, IconTrash, IconEye, IconEdit } from '@tabler/icons-react';
import { Dropzone } from '@mantine/dropzone';
import { useUploadThing } from '@/lib/uploadthing';
import { generateReactHelpers } from '@uploadthing/react';

const { useUploadThing: useUploadThingHook } = generateReactHelpers();

interface CompanyLogoUploadProps {
  currentLogoUrl?: string;
  onLogoUpdate?: (logoUrl: string) => void;
  onLogoRemove?: () => void;
  disabled?: boolean;
}

interface UploadedLogo {
  url: string;
  name: string;
  size: number;
}

export function CompanyLogoUpload({
  currentLogoUrl,
  onLogoUpdate,
  onLogoRemove,
  disabled = false,
}: CompanyLogoUploadProps) {
  const [uploadedLogo, setUploadedLogo] = useState<UploadedLogo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const { startUpload, isUploading: uploadThingIsUploading } =
    useUploadThingHook('companyLogo', {
      onClientUploadComplete: (res) => {
        setIsUploading(false);
        setUploadProgress(0);

        if (res && res.length > 0) {
          const newLogo = {
            url: res[0].url,
            name: res[0].name,
            size: res[0].size,
          };

          setUploadedLogo(newLogo);
          onLogoUpdate?.(newLogo.url);
        }
      },
      onUploadError: (error) => {
        setIsUploading(false);
        setUploadProgress(0);
        console.error('Upload error:', error);
      },
      onUploadProgress: (progress) => {
        setUploadProgress(progress);
      },
    });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled || uploadThingIsUploading || acceptedFiles.length === 0)
        return;

      setIsUploading(true);
      setUploadProgress(0);

      try {
        await startUpload(acceptedFiles);
      } catch (error) {
        setIsUploading(false);
        setUploadProgress(0);
        console.error('Upload failed:', error);
      }
    },
    [disabled, uploadThingIsUploading, startUpload]
  );

  const handleRemoveLogo = () => {
    setUploadedLogo(null);
    onLogoRemove?.();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const displayLogo = uploadedLogo?.url || currentLogoUrl;

  return (
    <Stack gap="md">
      {/* Current Logo Display */}
      {displayLogo && (
        <Paper p="md" withBorder>
          <Group justify="space-between" align="center">
            <Group gap="md">
              <Image
                src={displayLogo}
                alt="Company Logo"
                style={{ maxHeight: 60, maxWidth: 200 }}
                fallbackSrc="data:image/svg+xml,%3csvg width='200' height='60' xmlns='http://www.w3.org/2000/svg'%3e%3ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='12' fill='%23666'%3eLogo%3c/text%3e%3c/svg%3e"
              />
              <Box>
                <Text size="sm" fw={500}>
                  Current Company Logo
                </Text>
                {uploadedLogo && (
                  <Text size="xs" c="dimmed">
                    {uploadedLogo.name} ({formatFileSize(uploadedLogo.size)})
                  </Text>
                )}
              </Box>
            </Group>
            <Group gap="xs">
              <Tooltip label="Preview">
                <ActionIcon size="sm" onClick={() => setPreviewModalOpen(true)}>
                  <IconEye size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Remove">
                <ActionIcon size="sm" color="red" onClick={handleRemoveLogo}>
                  <IconTrash size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </Paper>
      )}

      {/* Upload Area */}
      <Dropzone
        onDrop={onDrop}
        accept={{
          'image/jpeg': [],
          'image/png': [],
          'image/webp': [],
          'image/svg+xml': [],
        }}
        disabled={disabled || isUploading}
        maxFiles={1}
        maxSize={2 * 1024 * 1024} // 2MB
      >
        <Group
          justify="center"
          gap="xl"
          style={{ minHeight: 120, pointerEvents: 'none' }}
        >
          <Dropzone.Accept>
            <IconUpload
              size={40}
              stroke={1.5}
              color="var(--mantine-color-blue-6)"
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconUpload
              size={40}
              stroke={1.5}
              color="var(--mantine-color-red-6)"
            />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconUpload size={40} stroke={1.5} />
          </Dropzone.Idle>

          <div>
            <Text size="lg" inline>
              {displayLogo ? 'Replace company logo' : 'Upload company logo'}
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              Drag image here or click to select
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              Max 2MB - JPEG, PNG, WebP, SVG
            </Text>
          </div>
        </Group>
      </Dropzone>

      {/* Upload Progress */}
      {isUploading && (
        <Box>
          <Group justify="space-between" mb="xs">
            <Text size="sm">Uploading logo...</Text>
            <Text size="sm">{Math.round(uploadProgress)}%</Text>
          </Group>
          <Progress value={uploadProgress} />
        </Box>
      )}

      {/* Preview Modal */}
      <Modal
        opened={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Company Logo Preview"
        size="md"
      >
        <Box style={{ textAlign: 'center' }}>
          <Image
            src={displayLogo}
            alt="Company Logo Preview"
            style={{ maxWidth: '100%', maxHeight: 400 }}
            fallbackSrc="data:image/svg+xml,%3csvg width='400' height='200' xmlns='http://www.w3.org/2000/svg'%3e%3ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='16' fill='%23666'%3eLogo Preview%3c/text%3e%3c/svg%3e"
          />
        </Box>
      </Modal>
    </Stack>
  );
}
