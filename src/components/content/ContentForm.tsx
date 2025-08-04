'use client';

import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useMemo,
} from 'react';
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
  Progress,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconDeviceFloppy,
  IconX,
  IconPlus,
  IconPaperclip,
  IconPhoto,
  IconEdit,
  IconTrash,
  IconUpload,
  IconAlertCircle,
} from '@tabler/icons-react';
import { TiptapEditor } from '@/components/editor/TiptapEditor';
import { FileUpload } from '@/components/upload/FileUpload';
import { FilePreview } from '@/components/upload/FilePreview';
import { useAuth } from '@/hooks/useAuth';
import { ContentType, ContentStatus, Priority } from '@prisma/client';
import { generateReactHelpers } from '@uploadthing/react';

const { useUploadThing: useUploadThingHook } = generateReactHelpers();

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

// Memoized form data structure to reduce serialization overhead
const createInitialFormData = (initialData?: any) => ({
  title: initialData?.title || '',
  body: initialData?.body || '',
  type: initialData?.type || 'ARTICLE',
  priority: initialData?.priority || 'MEDIUM',
  dueDate: initialData?.dueDate || '',
  assigneeId: initialData?.assigneeId || '',
  tags: initialData?.tags?.map((tag: any) => tag.id) || [],
  heroImage: initialData?.heroImage || '',
});

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
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    // Memoize initial form data to prevent unnecessary re-renders
    const initialFormData = useMemo(
      () => createInitialFormData(initialData),
      [initialData]
    );

    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [showHeroImageModal, setShowHeroImageModal] = useState(false);

    // Hero image upload states
    const [heroImageUploading, setHeroImageUploading] = useState(false);
    const [heroImageUploadProgress, setHeroImageUploadProgress] = useState(0);
    const [heroImageError, setHeroImageError] = useState<string | null>(null);
    const [heroImageLoading, setHeroImageLoading] = useState(false);

    // UploadThing hook for hero image uploads
    const {
      startUpload: startHeroImageUpload,
      isUploading: isHeroImageUploading,
    } = useUploadThingHook('heroImage', {
      onClientUploadComplete: (res: any) => {
        setHeroImageUploading(false);
        setHeroImageUploadProgress(0);
        setHeroImageError(null);

        if (res && res.length > 0) {
          const uploadedFile = res[0];
          setFormData((prev) => ({ ...prev, heroImage: uploadedFile.url }));
          setShowHeroImageModal(false);

          // Set image loading state - spinner will continue until image loads
          setHeroImageLoading(true);
        }
      },
      onUploadError: (error: any) => {
        setHeroImageUploading(false);
        setHeroImageUploadProgress(0);
        setHeroImageLoading(false);
        setHeroImageError(error.message);
        console.error('Hero image upload error:', error);
      },
      onUploadProgress: (progress: number) => {
        setHeroImageUploadProgress(progress);
      },
    });

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
      debouncedContentChange(content);
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

    // Enhanced hero image upload handler with UploadThing integration
    const handleHeroImageUpload = useCallback(
      async (file: File | null) => {
        if (!file) return;

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          setHeroImageError('File size must be less than 5MB');
          return;
        }

        // Validate file type
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/avif',
        ];
        if (!allowedTypes.includes(file.type)) {
          setHeroImageError(
            'Please select a valid image file (JPEG, PNG, WebP, or AVIF)'
          );
          return;
        }

        setHeroImageUploading(true);
        setHeroImageLoading(false);
        setHeroImageError(null);

        try {
          await startHeroImageUpload([file]);
        } catch (error) {
          setHeroImageUploading(false);
          setHeroImageError('Failed to upload image. Please try again.');
          console.error('Hero image upload error:', error);
        }
      },
      [startHeroImageUpload]
    );

    const handleRemoveHeroImage = () => {
      setFormData((prev) => ({ ...prev, heroImage: '' }));
      setHeroImageError(null);
      setHeroImageLoading(false);
      setHeroImageUploading(false);
    };

    // Memoize tag and user options to prevent recreation
    const tagOptions = useMemo(
      () => tags.map((tag) => ({ value: tag.id, label: tag.name })),
      [tags]
    );

    const userOptions = useMemo(
      () => users.map((user) => ({ value: user.id, label: user.name })),
      [users]
    );

    // Debounced content change handler to reduce serialization overhead
    const debouncedContentChange = useCallback(
      (() => {
        let timeoutId: NodeJS.Timeout;
        return (content: string) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            setFormData((prev) => ({ ...prev, body: content }));
          }, 500); // 500ms debounce for content changes
        };
      })(),
      []
    );

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
                      {/* Show loading spinner while image is loading */}
                      {(heroImageUploading || heroImageLoading) && (
                        <Box
                          pos="absolute"
                          top={0}
                          left={0}
                          right={0}
                          bottom={0}
                          bg="rgba(255,255,255,0.9)"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10,
                          }}
                        >
                          <Loader size="sm" />
                        </Box>
                      )}

                      <Image
                        src={formData.heroImage}
                        alt="Hero"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          opacity: heroImageLoading ? 0.3 : 1,
                          transition: 'opacity 0.3s',
                        }}
                        onLoad={() => {
                          // Image loaded successfully - hide loading states
                          setHeroImageLoading(false);
                          setHeroImageUploading(false);
                        }}
                        onError={() => {
                          // Image failed to load - hide loading states and show error
                          setHeroImageLoading(false);
                          setHeroImageUploading(false);
                          setHeroImageError('Failed to load image');
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
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '0';
                        }}
                      >
                        <ActionIcon
                          variant="white"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowHeroImageModal(true);
                          }}
                          aria-label="Edit hero image"
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Box>
                    </Box>
                  ) : (
                    <FileButton
                      onChange={handleHeroImageUpload}
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      disabled={heroImageUploading}
                    >
                      {(props) => (
                        <ActionIcon
                          {...props}
                          variant="light"
                          size="lg"
                          color="blue"
                          loading={heroImageUploading || heroImageLoading}
                          aria-label="Upload hero image"
                        >
                          <IconPhoto size={20} />
                        </ActionIcon>
                      )}
                    </FileButton>
                  )}
                </Group>
              </Group>

              {/* Hero Image Error Display */}
              {heroImageError && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="Hero Image Error"
                  color="red"
                  variant="light"
                  mb="md"
                  withCloseButton
                  onClose={() => setHeroImageError(null)}
                >
                  {heroImageError}
                </Alert>
              )}

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
              disabled={isLoading || heroImageUploading}
              loading={isLoading}
            >
              Save Changes
            </Button>
          </Group>
        </Stack>

        {/* Enhanced Hero Image Modal */}
        <Modal
          opened={showHeroImageModal}
          onClose={() => setShowHeroImageModal(false)}
          title="Edit Hero Image"
          size="md"
        >
          <Stack gap="md">
            {heroImageError && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Upload Error"
                color="red"
                variant="light"
              >
                {heroImageError}
              </Alert>
            )}

            {heroImageUploading && (
              <Box>
                <Text size="sm" fw={500} mb="xs">
                  Uploading image...
                </Text>
                <Progress
                  value={heroImageUploadProgress}
                  size="sm"
                  color="blue"
                  animated
                />
              </Box>
            )}

            {formData.heroImage && !heroImageUploading && (
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
              <FileButton
                onChange={handleHeroImageUpload}
                accept="image/jpeg,image/png,image/webp,image/avif"
                disabled={heroImageUploading}
              >
                {(props) => (
                  <Button
                    {...props}
                    variant="light"
                    leftSection={<IconUpload size={16} />}
                    loading={heroImageUploading}
                  >
                    {formData.heroImage ? 'Replace Image' : 'Upload Image'}
                  </Button>
                )}
              </FileButton>

              {formData.heroImage && !heroImageUploading && (
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

            <Text size="xs" c="dimmed">
              Supported formats: JPEG, PNG, WebP, AVIF (max 5MB)
            </Text>
          </Stack>
        </Modal>
      </Box>
    );
  }
);

ContentForm.displayName = 'ContentForm';
