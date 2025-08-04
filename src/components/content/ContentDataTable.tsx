'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Text,
  Badge,
  ActionIcon,
  Tooltip,
  Button,
  Modal,
  Group,
  Avatar,
  Stack,
  Title,
} from '@mantine/core';
import {
  IconEdit,
  IconTrash,
  IconEye,
  IconFile,
  IconMessage,
  IconCheck,
  IconPlus,
} from '@tabler/icons-react';
import { DataTable } from '@/components/tables/DataTable';
import { ContentType, ContentStatus, Priority } from '@prisma/client';
import { useAuth } from '@/hooks/useAuth';
import { PERMISSIONS } from '@/lib/permissions';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

interface ContentDataTableProps {
  data: any[];
  loading?: boolean;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onCreate?: () => void;
  onPageChange?: (page: number, pageSize: number) => void;
  onSortChange?: (field: string, sort: 'asc' | 'desc') => void;
  onFilterChange?: (filters: any) => void;
  onRefresh?: () => void;
  onExport?: (selection: string[]) => void;
  onBulkDelete?: (ids: string[]) => void;
  onBulkAction?: (action: string, ids: string[]) => void;
}

export function ContentDataTable({
  data,
  loading = false,
  pagination,
  onView,
  onEdit,
  onDelete,
  onCreate,
  onPageChange,
  onSortChange,
  onFilterChange,
  onRefresh,
  onExport,
  onBulkDelete,
  onBulkAction,
}: ContentDataTableProps) {
  const { user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<string | string[]>(
    ''
  );
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Format date for display
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  // Get status color based on content status
  const getStatusColor = (status: ContentStatus) => {
    switch (status) {
      case ContentStatus.DRAFT:
        return 'gray';
      case ContentStatus.IN_REVIEW:
        return 'yellow';
      case ContentStatus.APPROVED:
        return 'green';
      case ContentStatus.REJECTED:
        return 'red';
      case ContentStatus.PUBLISHED:
        return 'blue';
      default:
        return 'gray';
    }
  };

  // Get priority color based on content priority
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.LOW:
        return 'green';
      case Priority.MEDIUM:
        return 'blue';
      case Priority.HIGH:
        return 'yellow';
      case Priority.URGENT:
        return 'red';
      default:
        return 'gray';
    }
  };

  // Check if user can edit content
  const canEdit = (contentItem: any) => {
    return user?.role === 'ADMIN' || contentItem.author.id === user?.id;
  };

  // Check if user can delete content
  const canDelete = (contentItem: any) => {
    return user?.role === 'ADMIN' || contentItem.author.id === user?.id;
  };

  // Handle view action
  const handleView = (id: string) => {
    if (onView) onView(id);
  };

  // Handle edit action
  const handleEdit = (id: string) => {
    if (onEdit) onEdit(id);
  };

  // Handle delete confirmation dialog
  const handleDeleteClick = (id: string | string[]) => {
    setSelectedForDelete(id);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (typeof selectedForDelete === 'string') {
      if (onDelete) onDelete(selectedForDelete);
    } else {
      if (onBulkDelete) onBulkDelete(selectedForDelete as string[]);
    }
    setDeleteDialogOpen(false);
    setSelectedForDelete('');
  };

  // Handle bulk actions
  const handleBulkAction = (action: string, selection: string[]) => {
    if (action === 'delete') {
      handleDeleteClick(selection);
    } else if (onBulkAction) {
      onBulkAction(action, selection);
    }
  };

  // Handle pagination changes
  const handlePaginationChange = (page: number, pageSize: number) => {
    if (onPageChange) {
      onPageChange(page, pageSize);
    }
  };

  // Handle sorting changes
  const handleSortChange = (field: string, sort: 'asc' | 'desc') => {
    if (onSortChange) {
      onSortChange(field, sort);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filters: any) => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  };

  // Define table columns
  const columns = useMemo(
    () => [
      {
        field: 'title',
        headerName: 'Title',
        width: 300,
        renderCell: (value: any, row: any) => (
          <Stack gap={4}>
            <Text size="sm" fw={500}>
              {value}
            </Text>
            <Text size="xs" c="dimmed">
              {row.type.replace('_', ' ')}
            </Text>
          </Stack>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: (value: any) => (
          <Badge color={getStatusColor(value)} size="sm">
            {value.replace('_', ' ')}
          </Badge>
        ),
      },
      {
        field: 'priority',
        headerName: 'Priority',
        width: 100,
        renderCell: (value: any) => (
          <Badge color={getPriorityColor(value)} size="sm">
            {value}
          </Badge>
        ),
      },
      {
        field: 'author',
        headerName: 'Author',
        width: 150,
        renderCell: (value: any, row: any) => (
          <Group gap="xs">
            <Avatar size="sm" color="blue">
              {row.author?.name?.charAt(0) || '?'}
            </Avatar>
            <Text size="sm">{row.author?.name}</Text>
          </Group>
        ),
      },
      {
        field: 'updatedAt',
        headerName: 'Updated',
        width: 170,
        renderCell: (value: any) => formatDate(value),
      },
      {
        field: '_count',
        headerName: 'Items',
        width: 150,
        renderCell: (value: any, row: any) => (
          <Group gap="md">
            <Tooltip label={`${row._count.comments} comments`}>
              <Group gap={4}>
                <IconMessage size={14} />
                <Text size="xs">{row._count.comments}</Text>
              </Group>
            </Tooltip>
            <Tooltip label={`${row._count.attachments} attachments`}>
              <Group gap={4}>
                <IconFile size={14} />
                <Text size="xs">{row._count.attachments}</Text>
              </Group>
            </Tooltip>
            <Tooltip label={`${row._count.approvals} approvals`}>
              <Group gap={4}>
                <IconCheck size={14} />
                <Text size="xs">{row._count.approvals}</Text>
              </Group>
            </Tooltip>
          </Group>
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        renderCell: (value: any, row: any) => (
          <Group gap="xs">
            <Tooltip label="View">
              <ActionIcon size="sm" onClick={() => handleView(row.id)}>
                <IconEye size={16} />
              </ActionIcon>
            </Tooltip>

            {canEdit(row) && (
              <Tooltip label="Edit">
                <ActionIcon size="sm" onClick={() => handleEdit(row.id)}>
                  <IconEdit size={16} />
                </ActionIcon>
              </Tooltip>
            )}

            {canDelete(row) && (
              <Tooltip label="Delete">
                <ActionIcon
                  size="sm"
                  color="red"
                  onClick={() => handleDeleteClick(row.id)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        ),
      },
    ],
    [user]
  );

  // Define custom actions
  const customActions = [
    {
      name: 'delete',
      label: 'Delete Selected',
      icon: <IconTrash size={16} />,
    },
    {
      name: 'markAsPublished',
      label: 'Mark as Published',
      icon: <IconCheck size={16} />,
    },
    {
      name: 'export',
      label: 'Export Selected',
      icon: <IconFile size={16} />,
    },
  ];

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={1}>Content Management</Title>

        <PermissionGuard permission={PERMISSIONS.CONTENT_CREATE}>
          <Button leftSection={<IconPlus size={16} />} onClick={onCreate}>
            Create Content
          </Button>
        </PermissionGuard>
      </Group>

      <DataTable
        rows={data}
        columns={columns}
        loading={loading}
        title="Content Items"
        subtitle={`Showing ${data.length} of ${pagination.total} items`}
        pagination={{
          page: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          pageCount: Math.ceil(pagination.total / pagination.pageSize),
        }}
        onRowClick={(row) => handleView(row.id)}
        onSelectionChange={setSelectedRows}
        onPaginationChange={handlePaginationChange}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
        onRefresh={onRefresh}
        onDelete={(selection) => handleDeleteClick(selection)}
        onEdit={(selection) => handleEdit(selection[0])}
        onView={(selection) => handleView(selection[0])}
        onExport={onExport ? (selection) => onExport(selection) : undefined}
        onCustomAction={handleBulkAction}
        customActions={customActions}
        checkboxSelection
        showToolbar
        showQuickFilter
      />

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Confirm Deletion"
      >
        <Text mb="md">
          {Array.isArray(selectedForDelete)
            ? `Are you sure you want to delete ${selectedForDelete.length} selected items? This action cannot be undone.`
            : 'Are you sure you want to delete this item? This action cannot be undone.'}
        </Text>

        <Group justify="flex-end" gap="xs">
          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Group>
      </Modal>
    </>
  );
}
