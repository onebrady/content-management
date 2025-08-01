'use client';

import { useState, useEffect, Suspense } from 'react';
import { Box, Alert, Snackbar } from '@mui/material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ContentList } from '@/components/content/ContentList';
import { ContentForm } from '@/components/content/ContentForm';
import { ContentDetail } from '@/components/content/ContentDetail';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

interface ContentData {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
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

interface Tag {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

function ContentPageInner() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [content, setContent] = useState<ContentData[]>([]);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    priority: '',
  });
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // Check for mode query parameter
    const mode = searchParams.get('mode');
    if (mode === 'create') {
      setViewMode('create');
    }
  }, [searchParams]);

  // Add error handling for API failures
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch content from API
  const fetchContent = async () => {
    try {
      setIsLoadingContent(true);
      setApiError(null);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
        ...(filters.priority && { priority: filters.priority }),
      });

      const response = await fetch(`/api/content?${params}`);
      if (!response.ok) {
        if (response.status === 401) {
          setApiError('Authentication required. Please sign in.');
          router.push('/auth/signin');
          return;
        }
        throw new Error(`Failed to fetch content: ${response.status}`);
      }

      const data = await response.json();
      setContent(data.content);
      setPagination({
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        pages: data.pagination.pages,
      });
    } catch (error) {
      console.error('Error fetching content:', error);
      setApiError('Failed to load content. Please try again.');
      showNotification('Failed to load content', 'error');
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Fetch tags from API
  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (!response.ok) {
        if (response.status === 401) {
          setApiError('Authentication required. Please sign in.');
          router.push('/auth/signin');
          return;
        }
        throw new Error('Failed to fetch tags');
      }
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setApiError('Failed to load tags. Please try again.');
      showNotification('Failed to load tags', 'error');
    }
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        if (response.status === 401) {
          setApiError('Authentication required. Please sign in.');
          router.push('/auth/signin');
          return;
        }
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setApiError('Failed to load users. Please try again.');
      showNotification('Failed to load users', 'error');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchContent();
      fetchTags();
      fetchUsers();
    }
  }, [isAuthenticated, pagination.page, filters]);

  const handleCreate = () => {
    setViewMode('create');
  };

  const handleEdit = (id: string) => {
    const contentItem = content.find((item) => item.id === id);
    if (contentItem) {
      setSelectedContent(contentItem);
      setViewMode('edit');
    }
  };

  const handleView = (id: string) => {
    const contentItem = content.find((item) => item.id === id);
    if (contentItem) {
      setSelectedContent(contentItem);
      setViewMode('detail');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete content');
      }

      setContent((prev) => prev.filter((item) => item.id !== id));
      showNotification('Content deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting content:', error);
      showNotification('Failed to delete content', 'error');
    }
  };

  const handleSubmit = async (data: any) => {
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
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save content');
      }

      const savedContent = await response.json();

      if (selectedContent) {
        // Update existing content
        setContent((prev) =>
          prev.map((item) =>
            item.id === selectedContent.id ? savedContent : item
          )
        );
        showNotification('Content updated successfully', 'success');
      } else {
        // Add new content
        setContent((prev) => [savedContent, ...prev]);
        showNotification('Content created successfully', 'success');
      }

      setViewMode('list');
      setSelectedContent(null);
    } catch (error) {
      console.error('Error saving content:', error);
      showNotification('Failed to save content', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedContent(null);
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilter = (newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

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

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Please sign in to access the content management system.
        </Alert>
      </Box>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Breadcrumbs />

        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        {viewMode === 'list' && (
          <ContentList
            content={content}
            pagination={pagination}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
            onFilter={handleFilter}
            isLoading={isLoadingContent}
          />
        )}

        {viewMode === 'create' && (
          <Box>
            <ContentForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
              tags={tags}
              users={users}
            />
          </Box>
        )}

        {viewMode === 'edit' && selectedContent && (
          <Box>
            <ContentForm
              initialData={selectedContent}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
              tags={tags}
              users={users}
            />
          </Box>
        )}

        {viewMode === 'detail' && selectedContent && (
          <ContentDetail
            content={selectedContent}
            onEdit={() => handleEdit(selectedContent.id)}
            onDelete={() => {
              handleDelete(selectedContent.id);
              setViewMode('list');
            }}
            onBack={() => setViewMode('list')}
          />
        )}

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  );
}

export default function ContentPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ContentPageInner />
    </Suspense>
  );
}
