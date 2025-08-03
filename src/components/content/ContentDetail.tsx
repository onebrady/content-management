'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  Text,
  Button,
  Badge,
  Grid,
  Divider,
  ActionIcon,
  Tooltip,
  Alert,
  Modal,
  Tabs,
  Group,
  Stack,
  Title,
  Paper,
  Image,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconEdit,
  IconTrash,
  IconArrowLeft,
  IconUser,
  IconCalendar,
  IconTag,
  IconMessage,
  IconCheck,
  IconPaperclip,
  IconHistory,
} from '@tabler/icons-react';
import {
  ContentType,
  ContentStatus,
  Priority,
  ApprovalStatus,
} from '@prisma/client';
import { useAuth } from '@/hooks/useAuth';
import { PERMISSIONS } from '@/lib/permissions';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { ApprovalStatus as ApprovalStatusComponent } from '@/components/approval/ApprovalStatus';
import { ApprovalWorkflow } from '@/components/approval/ApprovalWorkflow';
import { ContentActivity } from '@/components/approval/ContentActivity';
import { CommentList } from '@/components/comments/CommentList';
import { VersionHistory } from '@/components/version/VersionHistory';
import { VersionCompare } from '@/components/version/VersionCompare';

interface ContentDetailProps {
  content: {
    id: string;
    title: string;
    body: any;
    type: ContentType;
    status: ContentStatus;
    priority: Priority;
    dueDate?: string;
    heroImage?: string;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    author: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    assignee?: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    tags: Array<{ id: string; name: string }>;
    comments: Array<{
      id: string;
      commentText: string;
      createdAt: string;
      user: {
        id: string;
        name: string;
        email: string;
        role?: string;
      };
    }>;
    approvals: Array<{
      id: string;
      status: ApprovalStatus;
      comments?: string;
      createdAt: string;
      updatedAt: string;
      user: {
        id: string;
        name: string;
        email: string;
        role?: string;
      };
    }>;
    attachments: Array<{
      id: string;
      filename: string;
      url: string;
      size: number;
      createdAt: string;
    }>;
    activities?: Array<{
      id: string;
      action: string;
      details?: string;
      createdAt: string;
      user: {
        id: string;
        name: string;
        role: string;
      };
    }>;
    _count?: {
      comments: number;
      approvals: number;
      attachments: number;
    };
  };
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
  onApprove?: (contentId: string, comments?: string) => Promise<void>;
  onReject?: (contentId: string, comments?: string) => Promise<void>;
  onSubmitForReview?: (contentId: string) => Promise<void>;
  onPublish?: (contentId: string) => Promise<void>;
  onReturnToDraft?: (contentId: string, reason: string) => Promise<void>;
  loading?: boolean;
}

export function ContentDetail({
  content,
  onEdit,
  onDelete,
  onBack,
  onApprove,
  onReject,
  onSubmitForReview,
  onPublish,
  onReturnToDraft,
  loading = false,
}: ContentDetailProps) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const [activeTab, setActiveTab] = useState<string | null>('overview');
  const [showVersionCompare, setShowVersionCompare] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: ContentStatus) => {
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

  const getPriorityColor = (priority: Priority) => {
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

  const canEdit = () => {
    return content.status === 'DRAFT' || content.status === 'REJECTED';
  };

  const canDelete = () => {
    return content.status === 'DRAFT';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      {/* Header */}
      <Card withBorder mb="lg">
        <Card.Section p="md">
          <Group justify="space-between" align="flex-start">
            <Box style={{ flex: 1 }}>
              <Title order={2} mb="sm">
                {content.title}
              </Title>
              {content.heroImage && (
                <Box mb="md">
                  <Image
                    src={content.heroImage}
                    alt="Hero"
                    style={{
                      width: '100%',
                      maxHeight: 300,
                      objectFit: 'cover',
                      borderRadius: 8,
                    }}
                  />
                </Box>
              )}
              <Group gap="xs" mb="sm">
                <Badge color={getStatusColor(content.status)} variant="light">
                  {content.status}
                </Badge>
                <Badge
                  color={getPriorityColor(content.priority)}
                  variant="light"
                >
                  {content.priority}
                </Badge>
                <Badge variant="outline">{content.type}</Badge>
              </Group>
              <Text size="sm" c="dimmed">
                Created by {content.author.name} on{' '}
                {formatDate(content.createdAt)}
              </Text>
            </Box>
            <Group gap="sm">
              <Tooltip label="Back">
                <ActionIcon variant="light" onClick={onBack}>
                  <IconArrowLeft size={16} />
                </ActionIcon>
              </Tooltip>
              {canEdit() && (
                <Tooltip label="Edit">
                  <ActionIcon variant="light" color="blue" onClick={onEdit}>
                    <IconEdit size={16} />
                  </ActionIcon>
                </Tooltip>
              )}
              {canDelete() && (
                <Tooltip label="Delete">
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          </Group>
        </Card.Section>
      </Card>

      {/* Content Tabs */}
      <Tabs
        value={activeTab}
        onChange={(value) => setActiveTab(value || 'overview')}
      >
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconUser size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="content" leftSection={<IconMessage size={16} />}>
            Content
          </Tabs.Tab>
          <Tabs.Tab value="comments" leftSection={<IconMessage size={16} />}>
            Comments ({content._count?.comments || 0})
          </Tabs.Tab>
          <Tabs.Tab value="approvals" leftSection={<IconCheck size={16} />}>
            Approvals ({content._count?.approvals || 0})
          </Tabs.Tab>
          <Tabs.Tab
            value="attachments"
            leftSection={<IconPaperclip size={16} />}
          >
            Attachments ({content._count?.attachments || 0})
          </Tabs.Tab>
          <Tabs.Tab value="history" leftSection={<IconHistory size={16} />}>
            History
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder>
                <Card.Section p="md">
                  <Title order={4} mb="md">
                    Content Information
                  </Title>
                  <Stack gap="sm">
                    <Group>
                      <IconUser size={16} />
                      <Text size="sm">
                        <strong>Author:</strong> {content.author.name} (
                        {content.author.email})
                      </Text>
                    </Group>
                    {content.assignee && (
                      <Group>
                        <IconUser size={16} />
                        <Text size="sm">
                          <strong>Assignee:</strong> {content.assignee.name} (
                          {content.assignee.email})
                        </Text>
                      </Group>
                    )}
                    <Group>
                      <IconCalendar size={16} />
                      <Text size="sm">
                        <strong>Created:</strong>{' '}
                        {formatDate(content.createdAt)}
                      </Text>
                    </Group>
                    <Group>
                      <IconCalendar size={16} />
                      <Text size="sm">
                        <strong>Updated:</strong>{' '}
                        {formatDate(content.updatedAt)}
                      </Text>
                    </Group>
                    {content.dueDate && (
                      <Group>
                        <IconCalendar size={16} />
                        <Text size="sm">
                          <strong>Due Date:</strong>{' '}
                          {formatDate(content.dueDate)}
                        </Text>
                      </Group>
                    )}
                    {content.publishedAt && (
                      <Group>
                        <IconCalendar size={16} />
                        <Text size="sm">
                          <strong>Published:</strong>{' '}
                          {formatDate(content.publishedAt)}
                        </Text>
                      </Group>
                    )}
                  </Stack>
                </Card.Section>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder>
                <Card.Section p="md">
                  <Title order={4} mb="md">
                    Tags
                  </Title>
                  {content.tags.length > 0 ? (
                    <Group gap="xs">
                      {content.tags.map((tag) => (
                        <Badge key={tag.id} variant="light">
                          {tag.name}
                        </Badge>
                      ))}
                    </Group>
                  ) : (
                    <Text size="sm" c="dimmed">
                      No tags assigned
                    </Text>
                  )}
                </Card.Section>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="content" pt="md">
          <Card withBorder>
            <Card.Section p="md">
              <Title order={4} mb="md">
                Content
              </Title>
              <Box
                dangerouslySetInnerHTML={{ __html: content.body }}
                style={{
                  lineHeight: 1.6,
                  fontSize: '1rem',
                }}
              />
            </Card.Section>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="comments" pt="md">
          <CommentList comments={content.comments} contentId={content.id} />
        </Tabs.Panel>

        <Tabs.Panel value="approvals" pt="md">
          <ApprovalWorkflow
            currentStatus={content.status}
            contentId={content.id}
            onApprove={onApprove}
            onReject={onReject}
            onSubmitForReview={onSubmitForReview}
            onPublish={onPublish}
            onReturnToDraft={onReturnToDraft}
            loading={loading}
          />
        </Tabs.Panel>

        <Tabs.Panel value="attachments" pt="md">
          <Card withBorder>
            <Card.Section p="md">
              <Title order={4} mb="md">
                Attachments
              </Title>
              {content.attachments && content.attachments.length > 0 ? (
                <Stack gap="sm">
                  {content.attachments.map((attachment) => (
                    <Paper key={attachment.id} p="sm" withBorder>
                      <Group justify="space-between">
                        <Group>
                          <IconPaperclip size={16} />
                          <Text size="sm">{attachment.filename}</Text>
                        </Group>
                        <Text size="xs" c="dimmed">
                          {formatFileSize(attachment.size)}
                        </Text>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Text size="sm" c="dimmed">
                  No attachments
                </Text>
              )}
            </Card.Section>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="history" pt="md">
          <VersionHistory contentId={content.id} />
        </Tabs.Panel>
      </Tabs>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Confirm Deletion"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete &quot;{content.title}&quot;? This
            action cannot be undone.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="outlined"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => {
                onDelete();
                setShowDeleteDialog(false);
              }}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
