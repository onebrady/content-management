'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Alert, Button, Loader, Group, Stack, Title } from '@mantine/core';
import {
  IconDeviceFloppy,
  IconArrowLeft,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import { ContentStatus, ContentType, Priority } from '@prisma/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { ContentList } from '@/components/content/ContentList';
import { ContentForm } from '@/components/content/ContentForm';
import { ContentDetail } from '@/components/content/ContentDetail';
import { useAuth } from '@/hooks/useAuth';

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

type ContentMode = 'list' | 'create' | 'view' | 'edit';

// Wrapper component that uses searchParams
function ContentPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [content, setContent] = useState<Content[]>([]);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [tags, setTags] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contentFormRef = useRef<{ submit: () => void }>(null);

  // Notification state
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Get current mode from URL params
  const mode = (searchParams.get('mode') as ContentMode) || 'list';
  const contentId = searchParams.get('id');

  // Fetch content list
  const fetchContent = async () => {
    console.log('Fetching content...');
    try {
      const response = await fetch('/api/content', {
        credentials: 'include',
      });
      console.log('Content response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched content response:', data);
        // Handle paginated response
        const contentArray = data.content || [];
        console.log('Setting content array:', contentArray);
        setContent(contentArray);
      } else {
        console.error('Failed to fetch content:', response.status);
        setContent([]);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      showNotification('Failed to load content', 'error');
      setContent([]);
    }
  };

  // Fetch tags and users
  const fetchTagsAndUsers = async () => {
    try {
      const [tagsResponse, usersResponse] = await Promise.all([
        fetch('/api/tags', { credentials: 'include' }),
        fetch('/api/users', { credentials: 'include' }),
      ]);

      if (tagsResponse.ok) {
        const tagsData = await tagsResponse.json();
        setTags(tagsData);
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching tags and users:', error);
    }
  };

  // Fetch individual content for view/edit modes
  const fetchContentById = async (id: string) => {
    try {
      const response = await fetch(`/api/content/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.status}`);
      }

      const contentItem = await response.json();
      setSelectedContent(contentItem);
    } catch (error) {
      console.error('Error fetching content details:', error);
      showNotification('Failed to load content details', 'error');
    }
  };

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      console.log('Initializing data, setting loading to true');
      setLoading(true);
      await Promise.all([fetchContent(), fetchTagsAndUsers()]);
      console.log('Data initialized, setting loading to false');
      setLoading(false);
    };

    initializeData();
  }, []);

  // Handle mode changes
  useEffect(() => {
    if (mode === 'view' || mode === 'edit') {
      if (contentId && !selectedContent) {
        fetchContentById(contentId);
      }
    } else {
      setSelectedContent(null);
    }
  }, [mode, contentId]);

  // Navigation functions
  const navigateToMode = (newMode: ContentMode, id?: string) => {
    const params = new URLSearchParams();
    if (newMode !== 'list') {
      params.set('mode', newMode);
      if (id) {
        params.set('id', id);
      }
    }
    const url = params.toString()
      ? `/content?${params.toString()}`
      : '/content';
    router.push(url);
  };

  const handleCreate = () => {
    navigateToMode('create');
  };

  const handleView = (id: string) => {
    navigateToMode('view', id);
  };

  const handleEdit = (id: string) => {
    navigateToMode('edit', id);
  };

  const handleViewBySlug = (slug: string) => {
    // Find content by slug and navigate to view mode
    const contentItem = content.find((item) => item.slug === slug);
    if (contentItem) {
      navigateToMode('view', contentItem.id);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        showNotification('Content deleted successfully', 'success');
        // Refresh the content list
        await fetchContent();
      } else {
        throw new Error(`Failed to delete content: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      showNotification('Failed to delete content', 'error');
    }
  };

  const handleBackToList = () => {
    navigateToMode('list');
  };

  // Form submission handlers
  const handleSubmit = async (contentData: any) => {
    setIsSubmitting(true);
    try {
      const url = selectedContent
        ? `/api/content/${selectedContent.id}`
        : '/api/content';

      const method = selectedContent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(contentData),
      });

      if (response.ok) {
        const savedContent = await response.json();

        if (selectedContent) {
          // Edit mode - redirect to view mode
          showNotification('Content updated successfully', 'success');
          navigateToMode('view', savedContent.id);
        } else {
          // Create mode - redirect to list and refresh
          showNotification('Content created successfully', 'success');
          await fetchContent(); // Refresh the list
          navigateToMode('list');
        }
      } else {
        throw new Error(
          `Failed to ${selectedContent ? 'update' : 'create'} content`
        );
      }
    } catch (error) {
      console.error('Error saving content:', error);
      showNotification(
        `Failed to ${selectedContent ? 'update' : 'create'} content`,
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (mode === 'create') {
      navigateToMode('list');
    } else if (mode === 'edit') {
      navigateToMode('view', contentId!);
    } else {
      navigateToMode('list');
    }
  };

  // Show notification function
  const showNotification = (
    message: string,
    severity: 'success' | 'error' | 'info' | 'warning'
  ) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  // Handle close notification
  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  // Generate breadcrumb items based on current mode
  const getBreadcrumbItems = () => {
    const items = [{ label: 'Content', href: '/content' }];

    if (mode === 'create') {
      items.push({ label: 'Create Content', href: '/content?mode=create' });
    } else if (mode === 'view' && selectedContent) {
      items.push({
        label: selectedContent.title,
        href: `/content?mode=view&id=${selectedContent.id}`,
      });
    } else if (mode === 'edit' && selectedContent) {
      items.push(
        {
          label: selectedContent.title,
          href: `/content?mode=view&id=${selectedContent.id}`,
        },
        { label: 'Edit', href: `/content?mode=edit&id=${selectedContent.id}` }
      );
    }

    return items;
  };

  // Loading state
  if (loading) {
    return (
      <AppLayout>
        <Box p="md" ta="center">
          <Loader size="lg" />
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box p="md">
        {/* Header with Breadcrumbs and Action Buttons */}
        <Group justify="space-between" align="center" mb="lg">
          <Breadcrumbs items={getBreadcrumbItems()} />

          <Group gap="sm">
            {/* Back button for non-list modes */}
            {mode !== 'list' && (
              <Button
                variant="outlined"
                leftSection={<IconArrowLeft size={16} />}
                onClick={handleBackToList}
              >
                Back to Content
              </Button>
            )}

            {/* Create button for list mode */}
            {mode === 'list' && (
              <Button
                variant="filled"
                onClick={handleCreate}
                color="blue"
                size="md"
              >
                Create Content
              </Button>
            )}

            {/* Save button for create/edit modes */}
            {(mode === 'create' || mode === 'edit') && (
              <Group gap="sm">
                <Button
                  variant="filled"
                  leftSection={<IconDeviceFloppy size={16} />}
                  onClick={() => {
                    contentFormRef.current?.submit();
                  }}
                  disabled={isSubmitting}
                  color="blue"
                  size="md"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
                {mode === 'edit' && selectedContent && (
                  <Button
                    variant="outlined"
                    color="red"
                    leftSection={<IconTrash size={16} />}
                    onClick={() => {
                      if (
                        confirm(
                          `Are you sure you want to delete "${selectedContent.title}"? This action cannot be undone.`
                        )
                      ) {
                        handleDelete(selectedContent.id);
                        navigateToMode('list');
                      }
                    }}
                  >
                    Delete
                  </Button>
                )}
              </Group>
            )}

            {/* Edit button for view mode */}
            {mode === 'view' && selectedContent && (
              <Group gap="sm">
                <Button
                  variant="filled"
                  leftSection={<IconEdit size={16} />}
                  onClick={() => handleEdit(selectedContent.id)}
                  color="blue"
                  size="md"
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={() => {
                    if (
                      confirm(
                        `Are you sure you want to delete "${selectedContent.title}"? This action cannot be undone.`
                      )
                    ) {
                      handleDelete(selectedContent.id);
                      navigateToMode('list');
                    }
                  }}
                >
                  Delete
                </Button>
              </Group>
            )}
          </Group>
        </Group>

        {/* Content based on mode */}
        {mode === 'list' && (
          <>
            {console.log(
              'Rendering ContentList with content:',
              content,
              'loading:',
              loading
            )}
            <ContentList
              content={content || []}
              onView={handleView}
              onEdit={handleEdit}
              onViewBySlug={handleViewBySlug}
              onCreate={handleCreate}
              onDelete={handleDelete}
            />
          </>
        )}

        {mode === 'create' && (
          <Box>
            <ContentForm
              ref={contentFormRef}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
              tags={tags}
              users={users}
            />
          </Box>
        )}

        {mode === 'view' && selectedContent && (
          <Box>
            <ContentDetail content={selectedContent} />
          </Box>
        )}

        {mode === 'edit' && selectedContent && (
          <Box>
            <ContentForm
              ref={contentFormRef}
              initialData={selectedContent}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
              tags={tags}
              users={users}
            />
          </Box>
        )}
      </Box>

      {/* Notification Alert */}
      {notification.open && (
        <Alert
          color={
            notification.severity === 'success'
              ? 'green'
              : notification.severity === 'error'
                ? 'red'
                : notification.severity === 'warning'
                  ? 'yellow'
                  : 'blue'
          }
          title={
            notification.severity === 'success'
              ? 'Success'
              : notification.severity === 'error'
                ? 'Error'
                : notification.severity === 'warning'
                  ? 'Warning'
                  : 'Info'
          }
          withCloseButton
          onClose={handleCloseNotification}
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 1000,
            minWidth: 300,
          }}
        >
          {notification.message}
        </Alert>
      )}
    </AppLayout>
  );
}

// Export the page with Suspense boundary
export default function ContentPage() {
  return (
    <Suspense
      fallback={
        <AppLayout>
          <Box p="md" ta="center">
            <Loader size="lg" />
          </Box>
        </AppLayout>
      }
    >
      <ContentPageClient />
    </Suspense>
  );
}
