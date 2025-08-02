'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  Box,
  Card,
  TextInput,
  Select,
  Button,
  Grid,
  Badge,
  MultiSelect,
  Alert,
  Loader,
  Divider,
  Text,
  Group,
  Stack,
  Title,
  Paper,
  Image,
  ActionIcon,
  Modal,
  FileButton,
} from '@mantine/core';
import {
  IconDeviceFloppy,
  IconX,
  IconPlus,
  IconPaperclip,
  IconPhoto,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
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

export const ContentForm = forwardRef<{ submit: () => void }, ContentFormProps>(
  (
    {
      initialData,
      onSubmit,
      onCancel,
      isLoading = false,
      tags = [],
      users = [],
    },
    ref
  ) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
      title: '',
      body: '',
      type: 'ARTICLE',
      priority: 'MEDIUM',
      dueDate: '',
      assigneeId: '',
      tags: [] as string[],
      heroImage: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [showHeroImageModal, setShowHeroImageModal] = useState(false);

    // Expose submit method to parent component
    useImperativeHandle(ref, () => ({
      submit: () => {
        if (validateForm()) {
          const contentData = {
            ...formData,
            body: formData.body,
            attachments: uploadedFiles,
            dueDate: formData.dueDate
              ? new Date(formData.dueDate).toISOString()
              : null,
            tags: formData.tags || [],
            heroImage: formData.heroImage,
          };
          onSubmit(contentData);
        }
      },
    }));

    useEffect(() => {
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          body: initialData.body || '',
          type: initialData.type || 'ARTICLE',
          priority: initialData.priority || 'MEDIUM',
          dueDate: initialData.dueDate
            ? new Date(initialData.dueDate).toISOString().split('T')[0]
            : '',
          assigneeId: initialData.assigneeId || '',
          tags: initialData.tags?.map((tag: any) => tag.id) || [],
          heroImage: initialData.heroImage || '',
        });
        setUploadedFiles(initialData.attachments || []);
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

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (validateForm()) {
        const contentData = {
          ...formData,
          body: formData.body,
          attachments: uploadedFiles,
          dueDate: formData.dueDate
            ? new Date(formData.dueDate).toISOString()
            : null,
          tags: formData.tags || [],
          heroImage: formData.heroImage,
        };
        onSubmit(contentData);
      }
    };

    const handleInputChange = (field: string, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }));
      }
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
        type: file.name.split('.').pop() || 'unknown',
      }));
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      setShowFileUpload(false);
    };

    const handleFileUploadError = (error: string) => {
      console.error('File upload error:', error);
      setShowFileUpload(false);
    };

    const handleRemoveFile = (index: number) => {
      setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleHeroImageUpload = (file: File | null) => {
      if (file) {
        // For now, we'll use a placeholder URL. In a real implementation,
        // you'd upload the file to your server and get back a URL
        const imageUrl = URL.createObjectURL(file);
        setFormData((prev) => ({ ...prev, heroImage: imageUrl }));
        setShowHeroImageModal(false);
      }
    };

    const handleRemoveHeroImage = () => {
      setFormData((prev) => ({ ...prev, heroImage: '' }));
    };

    const tagOptions = tags.map((tag) => ({
      value: tag.id,
      label: tag.name,
    }));

    const userOptions = users.map((user) => ({
      value: user.id,
      label: `${user.name} (${user.email})`,
    }));

    return (
      <Box component="form" onSubmit={handleSubmit}>
        <Stack gap="lg">
          {/* Basic Information */}
          <Card withBorder>
            <Card.Section p="md">
              <Group justify="space-between" align="center" mb="md">
                <Title order={4}>Basic Information</Title>
                {/* Hero Image Section */}
                <Group gap="xs">
                  <Text size="sm" fw={500}>
                    Hero Image
                  </Text>
                  {formData.heroImage ? (
                    <Box
                      pos="relative"
                      style={{
                        width: 80,
                        height: 60,
                        borderRadius: 8,
                        overflow: 'hidden',
                        cursor: 'pointer',
                      }}
                      onClick={() => setShowHeroImageModal(true)}
                    >
                      <Image
                        src={formData.heroImage}
                        alt="Hero"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <Box
                        pos="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        bg="rgba(0,0,0,0.5)"
                        style={{
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        className="hero-image-overlay"
                      >
                        <ActionIcon
                          variant="white"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowHeroImageModal(true);
                          }}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Box>
                    </Box>
                  ) : (
                    <FileButton
                      onChange={handleHeroImageUpload}
                      accept="image/*"
                    >
                      {(props) => (
                        <ActionIcon
                          {...props}
                          variant="light"
                          size="lg"
                          color="blue"
                        >
                          <IconPhoto size={20} />
                        </ActionIcon>
                      )}
                    </FileButton>
                  )}
                </Group>
              </Group>

              <Grid>
                <Grid.Col span={{ base: 12, md: 8 }}>
                  <TextInput
                    label="Title"
                    placeholder="Enter content title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    error={errors.title}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Select
                    label="Type"
                    value={formData.type}
                    onChange={(value) => handleInputChange('type', value)}
                    data={[
                      { value: 'ARTICLE', label: 'Article' },
                      { value: 'BLOG_POST', label: 'Blog Post' },
                      { value: 'NEWS', label: 'News' },
                      { value: 'DOCUMENT', label: 'Document' },
                    ]}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Priority"
                    value={formData.priority}
                    onChange={(value) => handleInputChange('priority', value)}
                    data={[
                      { value: 'LOW', label: 'Low' },
                      { value: 'MEDIUM', label: 'Medium' },
                      { value: 'HIGH', label: 'High' },
                      { value: 'URGENT', label: 'Urgent' },
                    ]}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Due Date"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      handleInputChange('dueDate', e.target.value)
                    }
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Assignee"
                    placeholder="Select assignee"
                    value={formData.assigneeId}
                    onChange={(value) => handleInputChange('assigneeId', value)}
                    data={userOptions}
                    clearable
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <MultiSelect
                    label="Tags"
                    placeholder="Select tags"
                    value={formData.tags}
                    onChange={(value) => handleInputChange('tags', value)}
                    data={tagOptions}
                    searchable
                  />
                </Grid.Col>
              </Grid>
            </Card.Section>
          </Card>

          {/* Content Editor */}
          <Card withBorder>
            <Card.Section p="md">
              <Title order={4} mb="md">
                Content
              </Title>
              <Box>
                <TiptapEditor
                  content={formData.body}
                  onChange={handleContentChange}
                />
                {errors.body && (
                  <Text size="sm" c="red" mt="xs">
                    {errors.body}
                  </Text>
                )}
              </Box>
            </Card.Section>
          </Card>

          {/* Attachments */}
          <Card withBorder>
            <Card.Section p="md">
              <Group justify="space-between" align="center" mb="md">
                <Title order={4}>Attachments</Title>
                <Button
                  variant="outlined"
                  leftSection={<IconPaperclip size={16} />}
                  onClick={() => setShowFileUpload(true)}
                >
                  Add Files
                </Button>
              </Group>

              {uploadedFiles.length > 0 && (
                <Stack gap="sm">
                  {uploadedFiles.map((file, index) => (
                    <FilePreview
                      key={index}
                      files={[file]}
                      onRemove={() => handleRemoveFile(index)}
                    />
                  ))}
                </Stack>
              )}

              {showFileUpload && (
                <Paper p="md" withBorder>
                  <FileUpload
                    onUploadComplete={handleFileUploadComplete}
                    onUploadError={handleFileUploadError}
                  />
                </Paper>
              )}
            </Card.Section>
          </Card>

          {/* Action Buttons */}
          <Group justify="flex-end" gap="sm">
            <Button
              variant="outlined"
              leftSection={<IconX size={16} />}
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="filled"
              leftSection={<IconDeviceFloppy size={16} />}
              disabled={isLoading}
              loading={isLoading}
            >
              Save Changes
            </Button>
          </Group>
        </Stack>

        {/* Hero Image Modal */}
        <Modal
          opened={showHeroImageModal}
          onClose={() => setShowHeroImageModal(false)}
          title="Edit Hero Image"
          size="md"
        >
          <Stack gap="md">
            {formData.heroImage && (
              <Box>
                <Text size="sm" fw={500} mb="xs">
                  Current Image
                </Text>
                <Image
                  src={formData.heroImage}
                  alt="Hero"
                  style={{ maxHeight: 200, objectFit: 'cover' }}
                />
              </Box>
            )}

            <Group justify="space-between">
              <FileButton onChange={handleHeroImageUpload} accept="image/*">
                {(props) => (
                  <Button
                    {...props}
                    variant="light"
                    leftSection={<IconPhoto size={16} />}
                  >
                    {formData.heroImage ? 'Replace Image' : 'Upload Image'}
                  </Button>
                )}
              </FileButton>

              {formData.heroImage && (
                <Button
                  variant="light"
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={handleRemoveHeroImage}
                >
                  Remove
                </Button>
              )}
            </Group>
          </Stack>
        </Modal>
      </Box>
    );
  }
);

ContentForm.displayName = 'ContentForm';
