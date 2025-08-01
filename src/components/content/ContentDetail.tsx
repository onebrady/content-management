'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Edit,
  Delete,
  ArrowBack,
  Person,
  Schedule,
  Label,
  Comment,
  Approval as ApprovalIcon,
  Attachment,
  History,
} from '@mui/icons-material';
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
    _count: {
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
  const { user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersions, setCompareVersions] = useState<
    [number, number] | null
  >(null);

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

  const canEdit = () => {
    return user?.role === 'ADMIN' || content.author.id === user?.id;
  };

  const canDelete = () => {
    return user?.role === 'ADMIN' || content.author.id === user?.id;
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={onBack}>
            Back
          </Button>
          <Typography variant="h4" component="h1">
            {content.title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {canEdit() && (
            <PermissionGuard permission={PERMISSIONS.CONTENT_EDIT}>
              <Button variant="outlined" startIcon={<Edit />} onClick={onEdit}>
                Edit
              </Button>
            </PermissionGuard>
          )}

          {canDelete() && (
            <PermissionGuard permission={PERMISSIONS.CONTENT_DELETE}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>
            </PermissionGuard>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Content
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{
                  '& h1, & h2, & h3, & h4, & h5, & h6': {
                    mt: 2,
                    mb: 1,
                  },
                  '& p': {
                    mb: 1,
                  },
                  '& ul, & ol': {
                    mb: 1,
                  },
                }}
                dangerouslySetInnerHTML={{
                  __html:
                    typeof content.body === 'string'
                      ? content.body
                      : JSON.stringify(content.body),
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={2}>
            {/* Content Info */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Content Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={content.type.replace('_', ' ')}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={content.status.replace('_', ' ')}
                        color={getStatusColor(content.status)}
                        size="small"
                      />
                      <Chip
                        label={content.priority}
                        color={getPriorityColor(content.priority)}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2">
                        By {content.author.name} ({content.author.email})
                      </Typography>
                    </Box>

                    {content.assignee && (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Person fontSize="small" color="action" />
                        <Typography variant="body2">
                          Assigned to {content.assignee.name} (
                          {content.assignee.email})
                        </Typography>
                      </Box>
                    )}

                    {content.dueDate && (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Schedule fontSize="small" color="action" />
                        <Typography variant="body2">
                          Due: {new Date(content.dueDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule fontSize="small" color="action" />
                      <Typography variant="body2">
                        Created:{' '}
                        {new Date(content.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule fontSize="small" color="action" />
                      <Typography variant="body2">
                        Updated:{' '}
                        {new Date(content.updatedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Tags */}
            {content.tags.length > 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Tags
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {content.tags.map((tag) => (
                        <Chip
                          key={tag.id}
                          label={tag.name}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Statistics */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Statistics
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Comment fontSize="small" color="action" />
                      <Typography variant="body2">
                        {content._count.comments} comments
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ApprovalIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {content._count.approvals} approvals
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Attachment fontSize="small" color="action" />
                      <Typography variant="body2">
                        {content._count.attachments} attachments
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Approval Status and Workflow */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
                sx={{ mb: 2 }}
              >
                <Tab label="Approval Status" />
                <Tab label="Workflow" />
                <Tab label={`Comments (${content._count.comments})`} />
                <Tab label={`Versions (${content._count.versions || 0})`} />
                {content.activities && content.activities.length > 0 && (
                  <Tab label="Activity History" />
                )}
              </Tabs>

              <Divider sx={{ mb: 2 }} />

              {tabValue === 0 && (
                <ApprovalStatusComponent
                  content={content}
                  approvals={content.approvals}
                  onApprove={onApprove}
                  onReject={onReject}
                  onSubmitForReview={onSubmitForReview}
                  onPublish={onPublish}
                  onReturnToDraft={onReturnToDraft}
                  loading={loading}
                />
              )}

              {tabValue === 1 && (
                <ApprovalWorkflow currentStatus={content.status} />
              )}

              {tabValue === 2 && (
                <CommentList
                  contentId={content.id}
                  initialComments={content.comments}
                />
              )}

              {tabValue === 3 && !compareMode && (
                <VersionHistory
                  contentId={content.id}
                  currentVersion={content.version}
                  onVersionRestore={async (versionNumber) => {
                    try {
                      const response = await fetch(
                        `/api/content/${content.id}/versions/${versionNumber}`,
                        {
                          method: 'POST',
                        }
                      );

                      if (!response.ok) {
                        throw new Error('Failed to restore version');
                      }

                      // Refresh the page to show the restored version
                      window.location.reload();
                    } catch (error) {
                      console.error('Error restoring version:', error);
                      alert('Failed to restore version. Please try again.');
                    }
                  }}
                  onVersionCompare={(v1, v2) => {
                    setCompareVersions([v1, v2]);
                    setCompareMode(true);
                  }}
                />
              )}

              {tabValue === 3 && compareMode && compareVersions && (
                <VersionCompare
                  contentId={content.id}
                  version1={compareVersions[0]}
                  version2={compareVersions[1]}
                  onBack={() => {
                    setCompareMode(false);
                    setCompareVersions(null);
                  }}
                />
              )}

              {tabValue === 4 && content.activities && (
                <ContentActivity activities={content.activities} />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Attachments */}
        {content.attachments.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Attachments ({content.attachments.length})
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {content.attachments.map((attachment) => (
                    <Box
                      key={attachment.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2">
                        {attachment.filename}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(attachment.size)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Content</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{content.title}"? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              onDelete();
            }}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
