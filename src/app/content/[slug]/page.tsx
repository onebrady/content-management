'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Text,
  Badge,
  Divider,
  Button,
  Loader,
  Alert,
  Group,
  Stack,
  Title,
} from '@mantine/core';
import {
  IconEdit,
  IconArrowLeft,
  IconCalendar,
  IconUser,
  IconUserCheck,
} from '@tabler/icons-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { ContentDetail } from '@/components/content/ContentDetail';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface Content {
  id: string;
  title: string;
  slug: string;
  body: any;
  status: string;
  type: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
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
  attachments: Array<{
    id: string;
    filename: string;
    url: string;
    size: number;
  }>;
  comments: Array<any>;
  approvals: Array<any>;
  _count: {
    comments: number;
    approvals: number;
    attachments: number;
  };
}

export default function ContentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = params.slug as string;

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/content/slug/${slug}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Content not found');
          } else {
            setError('Failed to load content');
          }
          return;
        }

        const data = await response.json();
        setContent(data);
      } catch (error) {
        console.error('Error fetching content:', error);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchContent();
    }
  }, [slug]);

  const handleEdit = () => {
    if (content) {
      router.push(`/content/edit/${content.id}`);
    }
  };

  const handleBack = () => {
    router.push('/content');
  };

  if (loading) {
    return (
      <AuthGuard>
        <AppLayout>
          <Box p="md" style={{ display: 'flex', justifyContent: 'center' }}>
            <Loader />
          </Box>
        </AppLayout>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <AppLayout>
          <Box p="md">
            <Alert color="red" mb="md">
              {error}
            </Alert>
            <Button
              variant="outline"
              leftSection={<IconArrowLeft size={16} />}
              onClick={handleBack}
            >
              Back to Content
            </Button>
          </Box>
        </AppLayout>
      </AuthGuard>
    );
  }

  if (!content) {
    return (
      <AuthGuard>
        <AppLayout>
          <Box p="md">
            <Alert color="yellow" mb="md">
              Content not found
            </Alert>
            <Button
              variant="outline"
              leftSection={<IconArrowLeft size={16} />}
              onClick={handleBack}
            >
              Back to Content
            </Button>
          </Box>
        </AppLayout>
      </AuthGuard>
    );
  }

  const canEdit = user?.role === 'ADMIN' || content.author.id === user?.id;

  return (
    <AuthGuard>
      <AppLayout>
        <Box p="md">
          {/* Header */}
          <Group justify="space-between" align="flex-start" mb="lg">
            <Box style={{ flex: 1 }}>
              <Breadcrumbs
                items={[
                  { label: 'Content', href: '/content' },
                  { label: content.title, href: `/content/${content.slug}` },
                ]}
              />
              <Title order={1} mt="md" mb="xs">
                {content.title}
              </Title>

              {/* Meta information */}
              <Group gap="xs" mb="md" wrap="wrap">
                <Badge
                  color={
                    content.status === 'PUBLISHED'
                      ? 'green'
                      : content.status === 'DRAFT'
                        ? 'gray'
                        : 'yellow'
                  }
                  size="sm"
                >
                  {content.status}
                </Badge>
                <Badge variant="outline" size="sm">
                  {content.type}
                </Badge>
                <Badge
                  color={
                    content.priority === 'HIGH'
                      ? 'red'
                      : content.priority === 'MEDIUM'
                        ? 'yellow'
                        : 'gray'
                  }
                  size="sm"
                >
                  {content.priority}
                </Badge>
              </Group>

              {/* Additional meta info */}
              <Group gap="lg" c="dimmed" size="sm">
                <Group gap="xs">
                  <IconUser size={16} />
                  <Text size="sm">{content.author.name}</Text>
                </Group>
                {content.assignee && (
                  <Group gap="xs">
                    <IconUserCheck size={16} />
                    <Text size="sm">{content.assignee.name}</Text>
                  </Group>
                )}
                <Group gap="xs">
                  <IconCalendar size={16} />
                  <Text size="sm">
                    {new Date(content.createdAt).toLocaleDateString()}
                  </Text>
                </Group>
              </Group>
            </Box>

            {canEdit && (
              <Button
                variant="filled"
                leftSection={<IconEdit size={16} />}
                onClick={handleEdit}
              >
                Edit
              </Button>
            )}
          </Group>

          <Divider mb="lg" />

          {/* Content */}
          <ContentDetail content={content} />
        </Box>
      </AppLayout>
    </AuthGuard>
  );
}
