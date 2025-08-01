'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  GridColDef,
  GridRenderCellParams,
  GridValueFormatterParams,
  GridRowSelectionModel,
  GridSortModel,
  GridFilterModel,
  GridPaginationModel,
} from '@mui/x-data-grid';
import {
  Edit,
  Delete,
  Visibility,
  FilePresent,
  Comment,
  CheckCircle,
  Add,
} from '@mui/icons-material';
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
  const theme = useTheme();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<string | string[]>(
    ''
  );
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);

  // Format date for display
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  // Get status color based on content status
  const getStatusColor = (status: ContentStatus) => {
    switch (status) {
      case ContentStatus.DRAFT:
        return 'default';
      case ContentStatus.IN_REVIEW:
        return 'warning';
      case ContentStatus.APPROVED:
        return 'success';
      case ContentStatus.REJECTED:
        return 'error';
      case ContentStatus.PUBLISHED:
        return 'info';
      default:
        return 'default';
    }
  };

  // Get priority color based on content priority
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.LOW:
        return 'success';
      case Priority.MEDIUM:
        return 'info';
      case Priority.HIGH:
        return 'warning';
      case Priority.URGENT:
        return 'error';
      default:
        return 'default';
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
  const handleBulkAction = (
    action: string,
    selection: GridRowSelectionModel
  ) => {
    if (action === 'delete') {
      handleDeleteClick(selection as string[]);
    } else if (onBulkAction) {
      onBulkAction(action, selection as string[]);
    }
  };

  // Handle pagination changes
  const handlePaginationChange = (params: GridPaginationModel) => {
    if (onPageChange) {
      onPageChange(params.page + 1, params.pageSize);
    }
  };

  // Handle sorting changes
  const handleSortChange = (sortModel: GridSortModel) => {
    if (sortModel.length > 0 && onSortChange) {
      const { field, sort } = sortModel[0];
      onSortChange(field, sort as 'asc' | 'desc');
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterModel: GridFilterModel) => {
    if (onFilterChange) {
      // Convert filter model to a simpler format for the API
      const apiFilters: Record<string, any> = {};

      if (filterModel.items && filterModel.items.length > 0) {
        filterModel.items.forEach((filter) => {
          if (filter.field && filter.value !== undefined) {
            apiFilters[filter.field] = filter.value;
          }
        });
      }

      onFilterChange(apiFilters);
    }
  };

  // Define table columns
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'title',
        headerName: 'Title',
        flex: 2,
        minWidth: 200,
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.type.replace('_', ' ')}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 1,
        minWidth: 120,
        renderCell: (params: GridRenderCellParams) => (
          <Chip
            label={params.value.replace('_', ' ')}
            size="small"
            color={getStatusColor(params.value)}
          />
        ),
      },
      {
        field: 'priority',
        headerName: 'Priority',
        flex: 1,
        minWidth: 100,
        renderCell: (params: GridRenderCellParams) => (
          <Chip
            label={params.value}
            size="small"
            color={getPriorityColor(params.value)}
          />
        ),
      },
      {
        field: 'author',
        headerName: 'Author',
        flex: 1,
        minWidth: 150,
        valueGetter: (params) => params.row.author?.name || 'Unknown',
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                bgcolor: theme.palette.primary.main,
              }}
            >
              {params.row.author?.name?.charAt(0) || '?'}
            </Avatar>
            <Typography variant="body2">{params.row.author?.name}</Typography>
          </Box>
        ),
      },
      {
        field: 'updatedAt',
        headerName: 'Updated',
        flex: 1,
        minWidth: 170,
        valueFormatter: (params: GridValueFormatterParams) =>
          formatDate(params.value as string),
      },
      {
        field: '_count',
        headerName: 'Items',
        flex: 1,
        minWidth: 150,
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title={`${params.row._count.comments} comments`}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Comment fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2">
                  {params.row._count.comments}
                </Typography>
              </Box>
            </Tooltip>
            <Tooltip title={`${params.row._count.attachments} attachments`}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FilePresent fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2">
                  {params.row._count.attachments}
                </Typography>
              </Box>
            </Tooltip>
            <Tooltip title={`${params.row._count.approvals} approvals`}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2">
                  {params.row._count.approvals}
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        flex: 1,
        minWidth: 120,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="View">
              <IconButton
                size="small"
                onClick={() => handleView(params.row.id)}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>

            {canEdit(params.row) && (
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => handleEdit(params.row.id)}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {canDelete(params.row) && (
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={() => handleDeleteClick(params.row.id)}
                  color="error"
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ],
    [theme, user]
  );

  // Define custom actions
  const customActions = [
    {
      name: 'delete',
      label: 'Delete Selected',
      icon: <Delete fontSize="small" />,
    },
    {
      name: 'markAsPublished',
      label: 'Mark as Published',
      icon: <CheckCircle fontSize="small" />,
    },
    {
      name: 'export',
      label: 'Export Selected',
      icon: <FilePresent fontSize="small" />,
    },
  ];

  // Initial state for the data grid
  const initialState = {
    pagination: {
      paginationModel: {
        page: pagination.page - 1, // Convert from 1-indexed to 0-indexed
        pageSize: pagination.pageSize,
      },
    },
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" component="h1">
          Content Management
        </Typography>

        <PermissionGuard permission={PERMISSIONS.CONTENT_CREATE}>
          <Button variant="contained" startIcon={<Add />} onClick={onCreate}>
            Create Content
          </Button>
        </PermissionGuard>
      </Box>

      <DataTable
        rows={data}
        columns={columns}
        loading={loading}
        title="Content Items"
        subtitle={`Showing ${data.length} of ${pagination.total} items`}
        initialState={initialState}
        onRowClick={(params) => handleView(params.id as string)}
        onSelectionChange={setSelectedRows}
        onPaginationChange={handlePaginationChange}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
        onRefresh={onRefresh}
        onDelete={(selection) => handleDeleteClick(selection as string[])}
        onEdit={(selection) => handleEdit(selection[0] as string)}
        onView={(selection) => handleView(selection[0] as string)}
        onExport={
          onExport ? (selection) => onExport(selection as string[]) : undefined
        }
        onCustomAction={handleBulkAction}
        customActions={customActions}
        checkboxSelection
        showToolbar
        showQuickFilter
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {Array.isArray(selectedForDelete)
              ? `Are you sure you want to delete ${selectedForDelete.length} selected items? This action cannot be undone.`
              : 'Are you sure you want to delete this item? This action cannot be undone.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
