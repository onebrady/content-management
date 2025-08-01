'use client';

import { useState, useEffect } from 'react';
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

export default function ContentPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [content, setContent] = useState<ContentData[]>([]);
  const [selectedContent, setSelectedContent] = useState<any>(null);
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

  // Mock data for demonstration
  const mockContent: ContentData[] = [
    {
      id: '1',
      title: 'Getting Started with Content Management',
      type: 'ARTICLE',
      status: 'DRAFT',
      priority: 'MEDIUM',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      author: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      },
      assignee: {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
      },
      tags: [
        { id: '1', name: 'Tutorial' },
        { id: '2', name: 'Guide' },
      ],
      _count: {
        comments: 3,
        approvals: 1,
        attachments: 2,
      },
    },
    {
      id: '2',
      title: 'Advanced Content Creation Techniques',
      type: 'BLOG_POST',
      status: 'IN_REVIEW',
      priority: 'HIGH',
      createdAt: '2024-01-14T14:30:00Z',
      updatedAt: '2024-01-15T09:15:00Z',
      author: {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
      },
      tags: [
        { id: '3', name: 'Advanced' },
        { id: '4', name: 'Techniques' },
      ],
      _count: {
        comments: 5,
        approvals: 2,
        attachments: 1,
      },
    },
  ];

  const mockTags = [
    { id: '1', name: 'Tutorial' },
    { id: '2', name: 'Guide' },
    { id: '3', name: 'Advanced' },
    { id: '4', name: 'Techniques' },
    { id: '5', name: 'Marketing' },
    { id: '6', name: 'SEO' },
  ];

  const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
  ];

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

  useEffect(() => {
    // Simulate loading content
    setIsLoadingContent(true);
    setTimeout(() => {
      setContent(mockContent);
      setPagination({
        page: 1,
        limit: 10,
        total: mockContent.length,
        pages: Math.ceil(mockContent.length / 10),
      });
      setIsLoadingContent(false);
    }, 1000);
  }, []);

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

  const handleDelete = (id: string) => {
    setContent((prev) => prev.filter((item) => item.id !== id));
    showNotification('Content deleted successfully', 'success');
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (viewMode === 'edit') {
        // Update existing content
        setContent((prev) =>
          prev.map((item) =>
            item.id === selectedContent.id
              ? { ...item, ...data, updatedAt: new Date().toISOString() }
              : item
          )
        );
        showNotification('Content updated successfully', 'success');
      } else {
        // Create new content
        const newContent: ContentData = {
          id: Date.now().toString(),
          title: data.title,
          type: data.type,
          status: 'DRAFT',
          priority: data.priority,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: {
            id: user?.id || '1',
            name: user?.name || 'Current User',
            email: user?.email || 'user@example.com',
          },
          assignee: data.assigneeId
            ? mockUsers.find((u) => u.id === data.assigneeId)
            : undefined,
          tags: data.tags
            ? mockTags.filter((tag) => data.tags.includes(tag.id))
            : [],
          _count: {
            comments: 0,
            approvals: 0,
            attachments: 0,
          },
        };

        setContent((prev) => [newContent, ...prev]);
        showNotification('Content created successfully', 'success');
      }

      setViewMode('list');
      setSelectedContent(null);
    } catch (error) {
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
  };

  const handleFilter = (newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
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
    return null;
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Breadcrumbs />

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
              tags={mockTags}
              users={mockUsers}
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
              tags={mockTags}
              users={mockUsers}
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
