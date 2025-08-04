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
import { AuthGuard } from '@/components/auth/AuthGuard';

interface Content {
  id: string;
  title: string;
  slug: string;
  heroImage?: string; // Add hero image field
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
    try {
      const response = await fetch('/api/content', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const contentArray = data.content || [];
        setContent(contentArray);
      } else {
        console.error('Failed to fetch content:', response.status);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
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
      setLoading(true);
      await Promise.all([fetchContent(), fetchTagsAndUsers()]);
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

  // Refresh content list when navigating to list mode
  useEffect(() => {
    if (mode === 'list') {
      fetchContent();
    }
  }, [mode]);

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

  const handleBackToList = async () => {
    // Refresh content list when navigating back to ensure it's up to date
    await fetchContent();
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
          // Edit mode - refresh content list and redirect to view mode
          // Optimistically update the content list with the new data
          setContent((prevContent) =>
            prevContent.map((item) =>
              item.id === savedContent.id ? { ...item, ...savedContent } : item
            )
          );

          // Refresh the content list to ensure all data is up to date
          await fetchContent();

          // Update the selected content with the latest data
          setSelectedContent(savedContent);

          navigateToMode('view', savedContent.id);
        } else {
          // Create mode - redirect to list and refresh
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

  // Add approval action handlers
  const handleSubmitForReview = async (contentId: string) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/content/${contentId}/workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'submit_for_review' }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit content for review');
      }

      showNotification('Content submitted for review successfully!', 'success');
      await fetchContentById(contentId); // Refresh the content
    } catch (error) {
      console.error('Error submitting for review:', error);
      showNotification(
        error instanceof Error ? error.message : 'Failed to submit for review',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (contentId: string, comments?: string) => {
    try {
      setIsSubmitting(true);

      // Use the approval API instead of workflow API
      const response = await fetch(`/api/content/${contentId}/approval`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'APPROVED',
          comments,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to approve content');
      }

      const result = await response.json();
      showNotification('Content approved successfully!', 'success');

      // Refresh the content and the content list
      await fetchContentById(contentId);
      await fetchContent(); // Refresh the main content list
    } catch (error) {
      console.error('Error approving content:', error);
      showNotification(
        error instanceof Error ? error.message : 'Failed to approve content',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (contentId: string, comments?: string) => {
    try {
      setIsSubmitting(true);

      // Use the approval API instead of workflow API
      const response = await fetch(`/api/content/${contentId}/approval`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'REJECTED',
          comments,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to reject content');
      }

      const result = await response.json();
      showNotification('Content rejected successfully!', 'success');

      // Refresh the content and the content list
      await fetchContentById(contentId);
      await fetchContent(); // Refresh the main content list
    } catch (error) {
      console.error('Error rejecting content:', error);
      showNotification(
        error instanceof Error ? error.message : 'Failed to reject content',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async (contentId: string) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/content/${contentId}/workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'publish' }),
      });

      if (!response.ok) {
        throw new Error('Failed to publish content');
      }

      showNotification('Content published successfully!', 'success');
      await fetchContentById(contentId); // Refresh the content
    } catch (error) {
      console.error('Error publishing content:', error);
      showNotification(
        error instanceof Error ? error.message : 'Failed to publish content',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnToDraft = async (contentId: string, reason: string) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/content/${contentId}/workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'return_to_draft',
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to return content to draft');
      }

      showNotification('Content returned to draft successfully!', 'success');
      await fetchContentById(contentId); // Refresh the content
    } catch (error) {
      console.error('Error returning to draft:', error);
      showNotification(
        error instanceof Error ? error.message : 'Failed to return to draft',
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
    const items = [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Content', href: '/content' },
    ];

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
            <ContentList
              content={content || []}
              onView={handleView}
              onEdit={handleEdit}
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
            <ContentDetail
              content={selectedContent}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onBack={handleBackToList}
              onSubmitForReview={handleSubmitForReview}
              onApprove={handleApprove}
              onReject={handleReject}
              onPublish={handlePublish}
              onReturnToDraft={handleReturnToDraft}
              loading={isSubmitting}
            />
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
      <AuthGuard>
        <ContentPageClient />
      </AuthGuard>
    </Suspense>
  );
}
