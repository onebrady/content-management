'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Text,
  Badge,
  Button,
  Grid,
  TextInput,
  Select,
  ActionIcon,
  Tooltip,
  Divider,
  Paper,
  Group,
  Stack,
  Title,
  Modal,
  AspectRatio,
  Image,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconSearch,
  IconFilter,
  IconPlus,
  IconEye,
  IconEdit,
  IconTrash,
  IconArticle,
} from '@tabler/icons-react';
import { ContentStatus, ContentType, Priority } from '@prisma/client';

interface Content {
  id: string;
  title: string;
  slug: string;
  heroImage?: string; // Add hero image field
  status: string;
  type: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  tags: Array<{ id: string; name: string }>;
  _count: {
    comments: number;
    approvals: number;
    attachments: number;
  };
}

interface ContentListProps {
  content: Content[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export function ContentList({
  content = [],
  onView,
  onEdit,
  onDelete,
  onCreate,
}: ContentListProps) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    priority: '',
  });

  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    contentId: string | null;
    contentTitle: string;
  }>({
    open: false,
    contentId: null,
    contentTitle: '',
  });

  const [filteredContent, setFilteredContent] = useState<Content[]>(content);

  useEffect(() => {
    const safeContent = Array.isArray(content) ? content : [];
    setFilteredContent(safeContent);
  }, [content]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // Enhanced status badge with proper contrast
  const getStatusBadgeProps = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return {
          color: 'gray',
          variant: 'filled' as const,
          style: { backgroundColor: '#495057', color: 'white' },
        };
      case 'IN_REVIEW':
        return {
          color: 'yellow',
          variant: 'filled' as const,
          style: { backgroundColor: '#f59f00', color: 'black' },
        };
      case 'APPROVED':
        return {
          color: 'green',
          variant: 'filled' as const,
          style: { backgroundColor: '#40c057', color: 'white' },
        };
      case 'PUBLISHED':
        return {
          color: 'blue',
          variant: 'filled' as const,
          style: { backgroundColor: '#339af0', color: 'white' },
        };
      case 'REJECTED':
        return {
          color: 'red',
          variant: 'filled' as const,
          style: { backgroundColor: '#fa5252', color: 'white' },
        };
      default:
        return { color: 'gray', variant: 'light' as const };
    }
  };

  // Enhanced priority badge with proper contrast
  const getPriorityBadgeProps = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return {
          color: 'gray',
          variant: 'filled' as const,
          style: { backgroundColor: '#868e96', color: 'white' },
        };
      case 'MEDIUM':
        return {
          color: 'yellow',
          variant: 'filled' as const,
          style: { backgroundColor: '#fcc419', color: 'black' },
        };
      case 'HIGH':
        return {
          color: 'orange',
          variant: 'filled' as const,
          style: { backgroundColor: '#fd7e14', color: 'white' },
        };
      case 'URGENT':
        return {
          color: 'red',
          variant: 'filled' as const,
          style: { backgroundColor: '#e03131', color: 'white' },
        };
      default:
        return { color: 'gray', variant: 'light' as const };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDeleteClick = (contentId: string, contentTitle: string) => {
    setDeleteDialog({
      open: true,
      contentId,
      contentTitle,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.contentId) {
      onDelete(deleteDialog.contentId);
      setDeleteDialog({ ...deleteDialog, open: false });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ ...deleteDialog, open: false });
  };

  // Default image placeholder component
  const DefaultImagePlaceholder = ({ title }: { title: string }) => (
    <Box
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <IconArticle size={48} style={{ marginBottom: '12px' }} />
      <Text
        size="sm"
        fw={600}
        style={{
          color: 'white',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          lineHeight: 1.2,
        }}
        lineClamp={2}
      >
        {title}
      </Text>
      <Text
        size="xs"
        style={{
          color: 'rgba(255,255,255,0.8)',
          marginTop: '4px',
        }}
      >
        No hero image set
      </Text>
    </Box>
  );

  // Enhanced hero image rendering with default placeholder
  const renderHeroImage = (item: Content) => {
    return (
      <Card.Section>
        <AspectRatio ratio={2.04 / 1}>
          <Box
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              backgroundColor: '#f8f9fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px 8px 0 0',
            }}
          >
            {item.heroImage ? (
              // Show hero image if available
              <Image
                src={item.heroImage}
                alt={`Hero image for ${item.title}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  console.error(
                    `Failed to load hero image for ${item.title}:`,
                    item.heroImage
                  );
                  // Replace with placeholder on error
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const placeholder = target.parentElement?.querySelector(
                    '.placeholder-fallback'
                  );
                  if (placeholder) {
                    (placeholder as HTMLElement).style.display = 'flex';
                  }
                }}
                onLoad={() => {
                  // Hide placeholder when image loads successfully
                  const placeholder = document.querySelector(
                    `.placeholder-fallback[data-content-id="${item.id}"]`
                  );
                  if (placeholder) {
                    (placeholder as HTMLElement).style.display = 'none';
                  }
                }}
              />
            ) : null}

            {/* Always render placeholder as fallback */}
            <Box
              className="placeholder-fallback"
              data-content-id={item.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: item.heroImage ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
              }}
            >
              <DefaultImagePlaceholder title={item.title} />
            </Box>
          </Box>
        </AspectRatio>
      </Card.Section>
    );
  };

  return (
    <Box>
      {/* Filters */}
      <Paper p="md" mb="lg" withBorder>
        <Title order={4} mb="md">
          Filters
        </Title>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <TextInput
              placeholder="Search content..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              leftSection={<IconSearch size={16} />}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Select
              placeholder="Status"
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value || '')}
              data={[
                { value: '', label: 'All Status' },
                { value: 'DRAFT', label: 'Draft' },
                { value: 'IN_REVIEW', label: 'In Review' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'PUBLISHED', label: 'Published' },
                { value: 'REJECTED', label: 'Rejected' },
              ]}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Select
              placeholder="Type"
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value || '')}
              data={[
                { value: '', label: 'All Types' },
                { value: 'ARTICLE', label: 'Article' },
                { value: 'BLOG_POST', label: 'Blog Post' },
                { value: 'NEWS', label: 'News' },
                { value: 'DOCUMENT', label: 'Document' },
              ]}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Select
              placeholder="Priority"
              value={filters.priority}
              onChange={(value) => handleFilterChange('priority', value || '')}
              data={[
                { value: '', label: 'All Priorities' },
                { value: 'LOW', label: 'Low' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HIGH', label: 'High' },
                { value: 'URGENT', label: 'Urgent' },
              ]}
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Content Grid */}
      <Grid>
        {(filteredContent || []).map((item) => (
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={item.id}>
            <Card
              withBorder
              shadow="sm"
              style={{
                position: 'relative',
                backgroundColor: isDark
                  ? 'var(--mantine-color-dark-7)'
                  : 'var(--mantine-color-white)',
                borderColor: isDark
                  ? 'var(--mantine-color-dark-4)'
                  : 'var(--mantine-color-gray-3)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: isDark
                    ? '0 8px 25px rgba(0,0,0,0.3)'
                    : '0 8px 25px rgba(0,0,0,0.1)',
                },
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = isDark
                  ? '0 8px 25px rgba(0,0,0,0.3)'
                  : '0 8px 25px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--mantine-shadow-sm)';
              }}
            >
              {/* Hero Image Section */}
              {renderHeroImage(item)}

              {/* Card Content */}
              <Card.Section p="md">
                {/* Top Row: Actions, Status, Priority */}
                <Group justify="space-between" align="flex-start" mb="md">
                  {/* Status and Priority Badges */}
                  <Group gap="xs">
                    <Badge {...getStatusBadgeProps(item.status)}>
                      {item.status}
                    </Badge>
                    <Badge {...getPriorityBadgeProps(item.priority)}>
                      {item.priority}
                    </Badge>
                  </Group>

                  {/* Action Buttons with High Contrast */}
                  <Group gap="xs">
                    <Tooltip label="View Article" withArrow>
                      <ActionIcon
                        variant="filled"
                        color="gray"
                        size="md"
                        style={{
                          backgroundColor: '#6c757d',
                          color: 'white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                        onClick={() => onView(item.id)}
                        aria-label={`View article: ${item.title}`}
                      >
                        <IconEye size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Edit Article" withArrow>
                      <ActionIcon
                        variant="filled"
                        color="green"
                        size="md"
                        style={{
                          backgroundColor: '#40c057',
                          color: 'white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                        onClick={() => onEdit(item.id)}
                        aria-label={`Edit article: ${item.title}`}
                      >
                        <IconEdit size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete Article" withArrow>
                      <ActionIcon
                        variant="filled"
                        color="red"
                        size="md"
                        style={{
                          backgroundColor: '#fa5252',
                          color: 'white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                        onClick={() => handleDeleteClick(item.id, item.title)}
                        aria-label={`Delete article: ${item.title}`}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>

                {/* Article Information */}
                <Stack gap="xs">
                  <Text
                    fw={700}
                    size="lg"
                    style={{
                      color: isDark
                        ? 'var(--mantine-color-gray-0)'
                        : 'var(--mantine-color-dark-9)',
                    }}
                    lineClamp={2}
                  >
                    {item.title}
                  </Text>

                  <Text
                    size="sm"
                    style={{
                      color: isDark
                        ? 'var(--mantine-color-gray-4)'
                        : 'var(--mantine-color-gray-6)',
                    }}
                  >
                    by {item.author.name}
                  </Text>

                  <Text
                    size="xs"
                    style={{ color: 'var(--mantine-color-gray-5)' }}
                  >
                    Created: {formatDate(item.createdAt)}
                  </Text>

                  {item.dueDate && (
                    <Text
                      size="xs"
                      style={{ color: 'var(--mantine-color-gray-5)' }}
                    >
                      Due: {formatDate(item.dueDate)}
                    </Text>
                  )}

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <Group gap="xs" mt="xs">
                      {item.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="light"
                          size="xs"
                          style={{
                            backgroundColor: 'var(--mantine-color-blue-1)',
                            color: 'var(--mantine-color-blue-7)',
                          }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge
                          variant="light"
                          size="xs"
                          style={{
                            backgroundColor: 'var(--mantine-color-gray-1)',
                            color: 'var(--mantine-color-gray-6)',
                          }}
                        >
                          +{item.tags.length - 3} more
                        </Badge>
                      )}
                    </Group>
                  )}
                </Stack>
              </Card.Section>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteDialog.open}
        onClose={handleDeleteCancel}
        title="Confirm Deletion"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete &quot;{deleteDialog.contentTitle}
            &quot;? This action cannot be undone.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="outlined" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
