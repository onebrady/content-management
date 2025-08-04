'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  Text,
  Button,
  Alert,
  Group,
  Stack,
  Title,
  Badge,
} from '@mantine/core';
import { IconUpload, IconTrash, IconDownload } from '@tabler/icons-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FileUpload } from '@/components/upload/FileUpload';
import { FilePreview } from '@/components/upload/FilePreview';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface UploadedFile {
  url: string;
  name: string;
  size: number;
  type: string;
}

export default function UploadTestPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    router.push('/auth/signin');
    return null;
  }

  const handleUploadComplete = (
    files: Array<{ url: string; name: string; size: number }>
  ) => {
    const newFiles = files.map((file) => ({
      ...file,
      type: file.name.split('.').pop() || 'application/octet-stream',
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
    setUploadError(null);
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setUploadedFiles([]);
    setUploadError(null);
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Breadcrumbs />

        <Title order={4} component="h1" mb="xs">
          File Upload Test
        </Title>

        <Text color="dimmed" size="sm" mb="md">
          Test the file upload functionality with drag and drop, progress
          tracking, and file preview.
        </Text>

        <Group mb="md">
          <Badge variant="filled" size="lg">
            Max Files: 10
          </Badge>
          <Badge variant="filled" size="lg">
            Max File Size: 10MB
          </Badge>
        </Group>

        <Stack gap="md">
          {/* Upload Component */}
          <Card withBorder>
            <Group justify="space-between" mb="xs">
              <Title order={6}>File Upload</Title>
              <Badge variant="light" size="sm">
                Drag and drop files here or click to select.
              </Badge>
            </Group>

            <Text color="dimmed" size="sm" mb="sm">
              Supports images, PDFs, documents, videos, and audio files.
            </Text>

            <FileUpload
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              maxFiles={10}
              maxFileSize={10 * 1024 * 1024} // 10MB
              acceptedFileTypes={[
                'image/*',
                'application/pdf',
                'text/*',
                'video/*',
                'audio/*',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              ]}
            />
          </Card>

          {/* Upload Info */}
          <Card withBorder>
            <Group justify="space-between" mb="xs">
              <Title order={6}>Upload Information</Title>
            </Group>

            <Stack gap="xs">
              <Group>
                <Badge variant="light" size="sm">
                  <Text fw="bold">Max Files:</Text> 10
                </Badge>
                <Badge variant="light" size="sm">
                  <Text fw="bold">Max File Size:</Text> 10MB
                </Badge>
              </Group>

              <Badge variant="light" size="sm">
                <Text fw="bold">Accepted Types:</Text>
              </Badge>
              <Stack gap="xs" pl="md">
                <Text size="sm" color="dimmed">
                  • Images (JPEG, PNG, GIF, etc.)
                </Text>
                <Text size="sm" color="dimmed">
                  • PDFs
                </Text>
                <Text size="sm" color="dimmed">
                  • Text files
                </Text>
                <Text size="sm" color="dimmed">
                  • Videos (MP4, AVI, etc.)
                </Text>
                <Text size="sm" color="dimmed">
                  • Audio (MP3, WAV, etc.)
                </Text>
                <Text size="sm" color="dimmed">
                  • Documents (Word, Excel)
                </Text>
              </Stack>
            </Stack>

            {uploadError && (
              <Alert color="red" mt="md" mb="md">
                {uploadError}
              </Alert>
            )}

            <Button
              variant="outline"
              onClick={handleClearAll}
              disabled={uploadedFiles.length === 0}
              fullWidth
            >
              Clear All Files
            </Button>
          </Card>

          {/* File Preview */}
          <Card withBorder>
            <Group justify="space-between" mb="xs">
              <Title order={6}>Uploaded Files ({uploadedFiles.length})</Title>
            </Group>

            {uploadedFiles.length === 0 ? (
              <Box style={{ textAlign: 'center', padding: '16px 0' }}>
                <Text color="dimmed" size="sm">
                  No files uploaded yet. Use the upload area above to add files.
                </Text>
              </Box>
            ) : (
              <FilePreview
                files={uploadedFiles}
                onRemove={handleRemoveFile}
                showActions={true}
                maxFiles={20}
              />
            )}
          </Card>

          {/* File Statistics */}
          {uploadedFiles.length > 0 && (
            <Card withBorder>
              <Group justify="space-between" mb="xs">
                <Title order={6}>File Statistics</Title>
              </Group>

              <Stack gap="xs">
                <Group>
                  <Badge variant="light" size="sm">
                    <Text fw="bold">Total Files:</Text>
                  </Badge>
                  <Badge variant="filled" size="sm">
                    <Text fw="bold">{uploadedFiles.length}</Text>
                  </Badge>
                </Group>

                <Group>
                  <Badge variant="light" size="sm">
                    <Text fw="bold">Total Size:</Text>
                  </Badge>
                  <Badge variant="filled" size="sm">
                    <Text fw="bold">
                      {(
                        uploadedFiles.reduce(
                          (acc, file) => acc + file.size,
                          0
                        ) /
                        (1024 * 1024)
                      ).toFixed(2)}{' '}
                      MB
                    </Text>
                  </Badge>
                </Group>

                <Group>
                  <Badge variant="light" size="sm">
                    <Text fw="bold">Images:</Text>
                  </Badge>
                  <Badge variant="filled" size="sm">
                    <Text fw="bold">
                      {
                        uploadedFiles.filter((f) => f.type.startsWith('image/'))
                          .length
                      }
                    </Text>
                  </Badge>
                </Group>

                <Group>
                  <Badge variant="light" size="sm">
                    <Text fw="bold">Documents:</Text>
                  </Badge>
                  <Badge variant="filled" size="sm">
                    <Text fw="bold">
                      {
                        uploadedFiles.filter(
                          (f) =>
                            f.type.includes('pdf') ||
                            f.type.includes('word') ||
                            f.type.includes('excel')
                        ).length
                      }
                    </Text>
                  </Badge>
                </Group>
              </Stack>
            </Card>
          )}
        </Stack>
      </Box>
    </DashboardLayout>
  );
}
