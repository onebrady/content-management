'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Button,
  Grid,
} from '@mui/material';
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

        <Typography variant="h4" component="h1" gutterBottom>
          File Upload Test
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Test the file upload functionality with drag and drop, progress
          tracking, and file preview.
        </Typography>

        <Grid container spacing={3}>
          {/* Upload Component */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  File Upload
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Drag and drop files here or click to select. Supports images,
                  PDFs, documents, videos, and audio files.
                </Typography>

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
              </CardContent>
            </Card>
          </Grid>

          {/* Upload Info */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upload Information
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Max Files:</strong> 10
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Max File Size:</strong> 10MB
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Accepted Types:</strong>
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="caption" display="block">
                      • Images (JPEG, PNG, GIF, etc.)
                    </Typography>
                    <Typography variant="caption" display="block">
                      • PDFs
                    </Typography>
                    <Typography variant="caption" display="block">
                      • Text files
                    </Typography>
                    <Typography variant="caption" display="block">
                      • Videos (MP4, AVI, etc.)
                    </Typography>
                    <Typography variant="caption" display="block">
                      • Audio (MP3, WAV, etc.)
                    </Typography>
                    <Typography variant="caption" display="block">
                      • Documents (Word, Excel)
                    </Typography>
                  </Box>
                </Box>

                {uploadError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {uploadError}
                  </Alert>
                )}

                <Button
                  variant="outlined"
                  onClick={handleClearAll}
                  disabled={uploadedFiles.length === 0}
                  fullWidth
                >
                  Clear All Files
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* File Preview */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Uploaded Files ({uploadedFiles.length})
                </Typography>

                {uploadedFiles.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No files uploaded yet. Use the upload area above to add
                      files.
                    </Typography>
                  </Box>
                ) : (
                  <FilePreview
                    files={uploadedFiles}
                    onRemove={handleRemoveFile}
                    showActions={true}
                    maxFiles={20}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* File Statistics */}
          {uploadedFiles.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    File Statistics
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Total Files
                      </Typography>
                      <Typography variant="h4">
                        {uploadedFiles.length}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Total Size
                      </Typography>
                      <Typography variant="h4">
                        {(
                          uploadedFiles.reduce(
                            (acc, file) => acc + file.size,
                            0
                          ) /
                          (1024 * 1024)
                        ).toFixed(2)}{' '}
                        MB
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Images
                      </Typography>
                      <Typography variant="h4">
                        {
                          uploadedFiles.filter((f) =>
                            f.type.startsWith('image/')
                          ).length
                        }
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Documents
                      </Typography>
                      <Typography variant="h4">
                        {
                          uploadedFiles.filter(
                            (f) =>
                              f.type.includes('pdf') ||
                              f.type.includes('word') ||
                              f.type.includes('excel')
                          ).length
                        }
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </DashboardLayout>
  );
}
