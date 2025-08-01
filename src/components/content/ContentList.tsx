'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Pagination,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  FilterList,
} from '@mui/icons-material';
import { ContentType, ContentStatus, Priority } from '@prisma/client';
import { useAuth } from '@/hooks/useAuth';
import { PERMISSIONS } from '@/lib/permissions';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

interface ContentListProps {
  content: Array<{
    id: string;
    title: string;
    type: ContentType;
    status: ContentStatus;
    priority: Priority;
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
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onPageChange: (page: number) => void;
  onSearch: (search: string) => void;
  onFilter: (filters: any) => void;
  isLoading?: boolean;
}

export function ContentList({
  content,
  pagination,
  onView,
  onEdit,
  onDelete,
  onCreate,
  onPageChange,
  onSearch,
  onFilter,
  isLoading = false,
}: ContentListProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: '',
  });

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

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const canEdit = (contentItem: any) => {
    return user?.role === 'ADMIN' || contentItem.author.id === user?.id;
  };

  const canDelete = (contentItem: any) => {
    return user?.role === 'ADMIN' || contentItem.author.id === user?.id;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h2">
          Content Management
        </Typography>
        <PermissionGuard permission={PERMISSIONS.CONTENT_CREATE}>
          <Button variant="contained" startIcon={<Add />} onClick={onCreate}>
            Create Content
          </Button>
        </PermissionGuard>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  {Object.values(ContentStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  label="Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  {Object.values(ContentType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority}
                  onChange={(e) =>
                    handleFilterChange('priority', e.target.value)
                  }
                  label="Priority"
                >
                  <MenuItem value="">All Priorities</MenuItem>
                  {Object.values(Priority).map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Content List */}
      {content.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No content found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || Object.values(filters).some((f) => f)
                ? 'Try adjusting your search or filters'
                : 'Create your first piece of content to get started'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {content.map((item) => (
            <Grid item xs={12} key={item.id}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {item.title}
                      </Typography>

                      <Box
                        sx={{
                          display: 'flex',
                          gap: 1,
                          mb: 2,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Chip
                          label={item.type.replace('_', ' ')}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={item.status.replace('_', ' ')}
                          color={getStatusColor(item.status)}
                          size="small"
                        />
                        <Chip
                          label={item.priority}
                          color={getPriorityColor(item.priority)}
                          size="small"
                        />
                        {item.tags.map((tag) => (
                          <Chip
                            key={tag.id}
                            label={tag.name}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          gap: 2,
                          color: 'text.secondary',
                          fontSize: '0.875rem',
                        }}
                      >
                        <span>By {item.author.name}</span>
                        {item.assignee && (
                          <span>Assigned to {item.assignee.name}</span>
                        )}
                        <span>
                          Updated{' '}
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </span>
                        <span>{item._count.comments} comments</span>
                        <span>{item._count.approvals} approvals</span>
                        <span>{item._count.attachments} attachments</span>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => onView(item.id)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>

                      {canEdit(item) && (
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => onEdit(item.id)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      )}

                      {canDelete(item) && (
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => onDelete(item.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pagination.pages}
            page={pagination.page}
            onChange={(_, page) => onPageChange(page)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}
