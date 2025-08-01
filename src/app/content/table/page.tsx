'use client';

import { useState, useEffect } from 'react';
import { Box, Alert, Snackbar } from '@mui/material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ContentDataTable } from '@/components/content/ContentDataTable';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function ContentTablePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // State for content data and loading
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [sorting, setSorting] = useState<{
    field: string;
    sort: 'asc' | 'desc';
  }>({
    field: 'updatedAt',
    sort: 'desc',
  });
  const [filters, setFilters] = useState<Record<string, any>>({});
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
  const mockContent = [
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
    {
      id: '3',
      title: 'Content SEO Best Practices',
      type: 'GUIDE',
      status: 'PUBLISHED',
      priority: 'HIGH',
      createdAt: '2024-01-10T08:45:00Z',
      updatedAt: '2024-01-12T16:30:00Z',
      author: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      },
      assignee: {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
      },
      tags: [
        { id: '5', name: 'SEO' },
        { id: '6', name: 'Marketing' },
      ],
      _count: {
        comments: 8,
        approvals: 3,
        attachments: 4,
      },
    },
    {
      id: '4',
      title: 'Content Strategy for 2024',
      type: 'WHITEPAPER',
      status: 'APPROVED',
      priority: 'URGENT',
      createdAt: '2024-01-05T11:20:00Z',
      updatedAt: '2024-01-11T14:45:00Z',
      author: {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
      },
      assignee: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      },
      tags: [
        { id: '7', name: 'Strategy' },
        { id: '8', name: 'Planning' },
      ],
      _count: {
        comments: 12,
        approvals: 5,
        attachments: 3,
      },
    },
    {
      id: '5',
      title: 'Mobile Content Optimization',
      type: 'ARTICLE',
      status: 'DRAFT',
      priority: 'MEDIUM',
      createdAt: '2024-01-08T09:30:00Z',
      updatedAt: '2024-01-09T13:15:00Z',
      author: {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
      },
      tags: [
        { id: '9', name: 'Mobile' },
        { id: '10', name: 'Optimization' },
      ],
      _count: {
        comments: 2,
        approvals: 0,
        attachments: 1,
      },
    },
    {
      id: '6',
      title: 'Video Content Production Guide',
      type: 'GUIDE',
      status: 'IN_REVIEW',
      priority: 'HIGH',
      createdAt: '2024-01-03T15:45:00Z',
      updatedAt: '2024-01-07T10:30:00Z',
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
        { id: '11', name: 'Video' },
        { id: '12', name: 'Production' },
      ],
      _count: {
        comments: 7,
        approvals: 2,
        attachments: 5,
      },
    },
    {
      id: '7',
      title: 'Email Marketing Content Templates',
      type: 'TEMPLATE',
      status: 'PUBLISHED',
      priority: 'MEDIUM',
      createdAt: '2023-12-28T12:00:00Z',
      updatedAt: '2024-01-02T09:45:00Z',
      author: {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
      },
      tags: [
        { id: '13', name: 'Email' },
        { id: '14', name: 'Marketing' },
      ],
      _count: {
        comments: 4,
        approvals: 3,
        attachments: 2,
      },
    },
    {
      id: '8',
      title: 'Social Media Content Calendar',
      type: 'TEMPLATE',
      status: 'APPROVED',
      priority: 'LOW',
      createdAt: '2023-12-20T14:15:00Z',
      updatedAt: '2023-12-27T11:30:00Z',
      author: {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
      },
      assignee: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      },
      tags: [
        { id: '15', name: 'Social Media' },
        { id: '16', name: 'Calendar' },
      ],
      _count: {
        comments: 6,
        approvals: 4,
        attachments: 1,
      },
    },
    {
      id: '9',
      title: 'Content Localization Guidelines',
      type: 'GUIDE',
      status: 'REJECTED',
      priority: 'HIGH',
      createdAt: '2023-12-15T10:45:00Z',
      updatedAt: '2023-12-22T16:30:00Z',
      author: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      },
      tags: [
        { id: '17', name: 'Localization' },
        { id: '18', name: 'International' },
      ],
      _count: {
        comments: 9,
        approvals: 1,
        attachments: 3,
      },
    },
    {
      id: '10',
      title: 'Interactive Content Development',
      type: 'WHITEPAPER',
      status: 'DRAFT',
      priority: 'URGENT',
      createdAt: '2023-12-10T09:00:00Z',
      updatedAt: '2023-12-18T14:15:00Z',
      author: {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
      },
      assignee: {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
      },
      tags: [
        { id: '19', name: 'Interactive' },
        { id: '20', name: 'Development' },
      ],
      _count: {
        comments: 5,
        approvals: 0,
        attachments: 4,
      },
    },
    {
      id: '11',
      title: 'Content Analytics and Reporting',
      type: 'ARTICLE',
      status: 'PUBLISHED',
      priority: 'MEDIUM',
      createdAt: '2023-12-05T13:30:00Z',
      updatedAt: '2023-12-12T10:45:00Z',
      author: {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
      },
      tags: [
        { id: '21', name: 'Analytics' },
        { id: '22', name: 'Reporting' },
      ],
      _count: {
        comments: 7,
        approvals: 3,
        attachments: 2,
      },
    },
    {
      id: '12',
      title: 'Content Governance Framework',
      type: 'WHITEPAPER',
      status: 'IN_REVIEW',
      priority: 'HIGH',
      createdAt: '2023-11-28T11:15:00Z',
      updatedAt: '2023-12-08T15:30:00Z',
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
        { id: '23', name: 'Governance' },
        { id: '24', name: 'Framework' },
      ],
      _count: {
        comments: 10,
        approvals: 2,
        attachments: 5,
      },
    },
  ];

  // Load content data
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, isLoading, router]);

  // Load content data
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);

      try {
        // In a real application, this would be an API call
        // const response = await fetch(`/api/content?page=${pagination.page}&limit=${pagination.pageSize}&sort=${sorting.field}&order=${sorting.sort}&${new URLSearchParams(filters).toString()}`);
        // const data = await response.json();

        // For demonstration, we'll use mock data
        setTimeout(() => {
          // Apply pagination
          const start = (pagination.page - 1) * pagination.pageSize;
          const end = start + pagination.pageSize;
          const paginatedContent = mockContent.slice(start, end);

          setContent(paginatedContent);
          setPagination((prev) => ({
            ...prev,
            total: mockContent.length,
          }));
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error loading content:', error);
        showNotification('Failed to load content', 'error');
        setLoading(false);
      }
    };

    loadContent();
  }, [pagination.page, pagination.pageSize, sorting, filters]);

  // Handle view content
  const handleView = (id: string) => {
    router.push(`/content?view=${id}`);
  };

  // Handle edit content
  const handleEdit = (id: string) => {
    router.push(`/content?edit=${id}`);
  };

  // Handle delete content
  const handleDelete = async (id: string) => {
    try {
      // In a real application, this would be an API call
      // await fetch(`/api/content/${id}`, { method: 'DELETE' });

      // For demonstration, we'll just update the state
      setContent((prev) => prev.filter((item) => item.id !== id));
      showNotification('Content deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting content:', error);
      showNotification('Failed to delete content', 'error');
    }
  };

  // Handle create content
  const handleCreate = () => {
    router.push('/content?create=true');
  };

  // Handle page change
  const handlePageChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
      pageSize,
    }));
  };

  // Handle sort change
  const handleSortChange = (field: string, sort: 'asc' | 'desc') => {
    setSorting({ field, sort });
  };

  // Handle filter change
  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  // Handle refresh
  const handleRefresh = () => {
    // Reset pagination to first page
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));

    // This will trigger the useEffect to reload data
  };

  // Handle bulk delete
  const handleBulkDelete = async (ids: string[]) => {
    try {
      // In a real application, this would be an API call
      // await Promise.all(ids.map(id => fetch(`/api/content/${id}`, { method: 'DELETE' })));

      // For demonstration, we'll just update the state
      setContent((prev) => prev.filter((item) => !ids.includes(item.id)));
      showNotification(`${ids.length} items deleted successfully`, 'success');
    } catch (error) {
      console.error('Error deleting content:', error);
      showNotification('Failed to delete content', 'error');
    }
  };

  // Handle bulk action
  const handleBulkAction = async (action: string, ids: string[]) => {
    try {
      if (action === 'markAsPublished') {
        // In a real application, this would be an API call
        // await Promise.all(ids.map(id => fetch(`/api/content/${id}/publish`, { method: 'POST' })));

        // For demonstration, we'll just update the state
        setContent((prev) =>
          prev.map((item) =>
            ids.includes(item.id)
              ? {
                  ...item,
                  status: 'PUBLISHED',
                  updatedAt: new Date().toISOString(),
                }
              : item
          )
        );
        showNotification(
          `${ids.length} items published successfully`,
          'success'
        );
      } else if (action === 'export') {
        // In a real application, this would trigger a download
        showNotification(`Exporting ${ids.length} items...`, 'info');
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      showNotification(`Failed to perform ${action}`, 'error');
    }
  };

  // Show notification
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

        <ContentDataTable
          data={content}
          loading={loading}
          pagination={pagination}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
          onFilterChange={handleFilterChange}
          onRefresh={handleRefresh}
          onBulkDelete={handleBulkDelete}
          onBulkAction={handleBulkAction}
        />

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
