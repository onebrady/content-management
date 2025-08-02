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
  Dialog,
  Modal,
} from '@mantine/core';
import {
  IconSearch,
  IconFilter,
  IconPlus,
  IconEye,
  IconEdit,
  IconLink,
  IconTrash,
} from '@tabler/icons-react';
import { ContentStatus, ContentType, Priority } from '@prisma/client';

interface Content {
  id: string;
  title: string;
  slug: string;
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
  onViewBySlug: (slug: string) => void;
  onCreate: () => void;
}

export function ContentList({
  content = [],
  onView,
  onEdit,
  onDelete,
  onViewBySlug,
  onCreate,
}: ContentListProps) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'gray';
      case 'IN_REVIEW':
        return 'yellow';
      case 'APPROVED':
        return 'green';
      case 'PUBLISHED':
        return 'blue';
      case 'REJECTED':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'gray';
      case 'MEDIUM':
        return 'yellow';
      case 'HIGH':
        return 'orange';
      case 'URGENT':
        return 'red';
      default:
        return 'gray';
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
            <Card withBorder shadow="sm">
              <Card.Section p="md">
                <Group justify="space-between" align="flex-start">
                  <Box style={{ flex: 1 }}>
                    <Text fw={500} size="lg" mb="xs">
                      {item.title}
                    </Text>
                    <Text size="sm" c="dimmed" mb="xs">
                      by {item.author.name}
                    </Text>
                    <Group gap="xs" mb="xs">
                      <Badge
                        color={getStatusColor(item.status)}
                        variant="light"
                      >
                        {item.status}
                      </Badge>
                      <Badge
                        color={getPriorityColor(item.priority)}
                        variant="light"
                      >
                        {item.priority}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                      Created: {formatDate(item.createdAt)}
                    </Text>
                    {item.dueDate && (
                      <Text size="xs" c="dimmed">
                        Due: {formatDate(item.dueDate)}
                      </Text>
                    )}
                  </Box>
                  <Group gap="xs">
                    <Tooltip label="View">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => onView(item.id)}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Edit">
                      <ActionIcon
                        variant="light"
                        color="yellow"
                        onClick={() => onEdit(item.id)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="View by Slug">
                      <ActionIcon
                        variant="light"
                        color="green"
                        onClick={() => onViewBySlug(item.slug)}
                      >
                        <IconLink size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete">
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => handleDeleteClick(item.id, item.title)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
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
