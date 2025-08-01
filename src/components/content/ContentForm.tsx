'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Chip,
  Autocomplete,
  Alert,
  CircularProgress,
  Divider,
  Typography,
} from '@mui/material';
import { Save, Cancel, Add, AttachFile } from '@mui/icons-material';
import { TiptapEditor } from '@/components/editor/TiptapEditor';
import { FileUpload } from '@/components/upload/FileUpload';
import { FilePreview } from '@/components/upload/FilePreview';
import { useAuth } from '@/hooks/useAuth';
import { ContentType, ContentStatus, Priority } from '@prisma/client';

interface ContentFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  tags?: Array<{ id: string; name: string }>;
  users?: Array<{ id: string; name: string; email: string }>;
}

interface UploadedFile {
  url: string;
  name: string;
  size: number;
  type: string;
}

export function ContentForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  tags = [],
  users = [],
}: ContentFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: ContentType.ARTICLE,
    priority: Priority.MEDIUM,
    dueDate: '',
    assigneeId: '',
    tags: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        body: initialData.body || '',
        type: initialData.type || ContentType.ARTICLE,
        priority: initialData.priority || Priority.MEDIUM,
        dueDate: initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().split('T')[0]
          : '',
        assigneeId: initialData.assigneeId || '',
        tags: initialData.tags?.map((tag: any) => tag.id) || [],
      });

      // Set uploaded files if they exist
      if (initialData.attachments) {
        setUploadedFiles(initialData.attachments);
      }
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.body.trim()) {
      newErrors.body = 'Content is required';
    }

    if (!formData.type) {
      newErrors.type = 'Content type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      ...formData,
      body: formData.body, // Keep as JSON string for API
      attachments: uploadedFiles,
    });
  };

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, body: content }));
    if (errors.body) {
      setErrors((prev) => ({ ...prev, body: '' }));
    }
  };

  const handleFileUploadComplete = (
    files: Array<{ url: string; name: string; size: number }>
  ) => {
    const newFiles = files.map((file) => ({
      ...file,
      type: file.name.split('.').pop() || 'application/octet-stream',
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileUploadError = (error: string) => {
    console.error('File upload error:', error);
    // You could show a notification here
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, title: e.target.value }));
                  if (errors.title) {
                    setErrors((prev) => ({ ...prev, title: '' }));
                  }
                }}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Grid>

            {/* Content Type and Priority */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel>Content Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, type: e.target.value }));
                    if (errors.type) {
                      setErrors((prev) => ({ ...prev, type: '' }));
                    }
                  }}
                  label="Content Type"
                >
                  {Object.values(ContentType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: e.target.value,
                    }))
                  }
                  label="Priority"
                >
                  {Object.values(Priority).map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Due Date and Assignee */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Due Date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Assignee</InputLabel>
                <Select
                  value={formData.assigneeId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      assigneeId: e.target.value,
                    }))
                  }
                  label="Assignee"
                >
                  <MenuItem value="">No Assignee</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={tags}
                getOptionLabel={(option) => option.name}
                value={tags.filter((tag) => formData.tags.includes(tag.id))}
                onChange={(_, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    tags: newValue.map((tag) => tag.id),
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Select tags..."
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.name}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Grid>

            {/* Rich Text Editor */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Use the rich text editor below to create your content. You can
                  format text, add headings, lists, links, and images.
                </Alert>
              </Box>
              <TiptapEditor
                content={formData.body}
                onChange={handleContentChange}
                placeholder="Start writing your content..."
                editable={true}
              />
              {errors.body && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {errors.body}
                </Alert>
              )}
            </Grid>

            {/* File Attachments */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">File Attachments</Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AttachFile />}
                    onClick={() => setShowFileUpload(!showFileUpload)}
                  >
                    {showFileUpload ? 'Hide Upload' : 'Add Files'}
                  </Button>
                </Box>

                {showFileUpload && (
                  <FileUpload
                    onUploadComplete={handleFileUploadComplete}
                    onUploadError={handleFileUploadError}
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
                    disabled={isLoading}
                  />
                )}
              </Box>

              {/* File Preview */}
              {uploadedFiles.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Attached Files ({uploadedFiles.length})
                  </Typography>
                  <FilePreview
                    files={uploadedFiles}
                    onRemove={handleRemoveFile}
                    showActions={true}
                    maxFiles={10}
                  />
                </Box>
              )}
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  disabled={isLoading}
                  startIcon={<Cancel />}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  startIcon={
                    isLoading ? <CircularProgress size={20} /> : <Save />
                  }
                >
                  {isLoading
                    ? 'Saving...'
                    : initialData
                      ? 'Update Content'
                      : 'Create Content'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
}
