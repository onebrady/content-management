'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  Compare as CompareIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { diff as DiffEditor } from 'react-ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';

interface VersionCompareProps {
  contentId: string;
  version1: number;
  version2: number;
  onBack: () => void;
}

interface VersionData {
  id: string;
  versionNumber: number;
  title: string;
  body: any;
  status: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
  changeDescription: string | null;
  createdBy: {
    id: string;
    name: string;
  };
}

interface ComparisonResult {
  titleChanged: boolean;
  bodyChanged: boolean;
  statusChanged: boolean;
  priorityChanged: boolean;
  dueDateChanged: boolean;
  version1: VersionData | null;
  version2: VersionData | null;
}

export function VersionCompare({
  contentId,
  version1,
  version2,
  onBack,
}: VersionCompareProps) {
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch comparison data
  useEffect(() => {
    const fetchComparison = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/content/${contentId}/versions/compare?v1=${version1}&v2=${version2}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch version comparison');
        }

        const data = await response.json();
        setComparison(data);
      } catch (err) {
        console.error('Error fetching version comparison:', err);
        setError('Failed to load version comparison. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (contentId && version1 && version2) {
      fetchComparison();
    }
  }, [contentId, version1, version2]);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Format JSON for diff editor
  const formatJson = (json: any) => {
    try {
      return JSON.stringify(json, null, 2);
    } catch (error) {
      return '{}';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
          Back to Version History
        </Button>
      </Box>
    );
  }

  if (!comparison || !comparison.version1 || !comparison.version2) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Could not load comparison data
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
          Back to Version History
        </Button>
      </Box>
    );
  }

  const { version1: v1, version2: v2 } = comparison;

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <CompareIcon />
          Comparing Versions
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
          Back to Version History
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle1">
                Version {v1.versionNumber}
              </Typography>
              <Chip
                label={`v${v1.versionNumber}`}
                size="small"
                color="primary"
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Created by {v1.createdBy.name} {formatDate(v1.createdAt)}
            </Typography>
            {v1.changeDescription && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {v1.changeDescription}
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle1">
                Version {v2.versionNumber}
              </Typography>
              <Chip
                label={`v${v2.versionNumber}`}
                size="small"
                color="primary"
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Created by {v2.createdBy.name} {formatDate(v2.createdAt)}
            </Typography>
            {v2.changeDescription && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {v2.changeDescription}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Changes
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          {/* Title comparison */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Title{' '}
              {comparison.titleChanged && (
                <Chip label="Changed" size="small" color="warning" />
              )}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: comparison.titleChanged
                      ? 'error.50'
                      : 'background.default',
                  }}
                >
                  <Typography>{v1.title}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: comparison.titleChanged
                      ? 'success.50'
                      : 'background.default',
                  }}
                >
                  <Typography>{v2.title}</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Status comparison */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Status{' '}
              {comparison.statusChanged && (
                <Chip label="Changed" size="small" color="warning" />
              )}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: comparison.statusChanged
                      ? 'error.50'
                      : 'background.default',
                  }}
                >
                  <Chip label={v1.status} />
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: comparison.statusChanged
                      ? 'success.50'
                      : 'background.default',
                  }}
                >
                  <Chip label={v2.status} />
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Priority comparison */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Priority{' '}
              {comparison.priorityChanged && (
                <Chip label="Changed" size="small" color="warning" />
              )}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: comparison.priorityChanged
                      ? 'error.50'
                      : 'background.default',
                  }}
                >
                  <Chip label={v1.priority} />
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: comparison.priorityChanged
                      ? 'success.50'
                      : 'background.default',
                  }}
                >
                  <Chip label={v2.priority} />
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Due date comparison */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Due Date{' '}
              {comparison.dueDateChanged && (
                <Chip label="Changed" size="small" color="warning" />
              )}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: comparison.dueDateChanged
                      ? 'error.50'
                      : 'background.default',
                  }}
                >
                  <Typography>
                    {v1.dueDate
                      ? new Date(v1.dueDate).toLocaleDateString()
                      : 'Not set'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: comparison.dueDateChanged
                      ? 'success.50'
                      : 'background.default',
                  }}
                >
                  <Typography>
                    {v2.dueDate
                      ? new Date(v2.dueDate).toLocaleDateString()
                      : 'Not set'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Content body comparison */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Content Body{' '}
        {comparison.bodyChanged && (
          <Chip label="Changed" size="small" color="warning" />
        )}
      </Typography>

      <Paper sx={{ p: 0, mb: 3, overflow: 'hidden' }}>
        <DiffEditor
          mode="json"
          theme="github"
          value={[formatJson(v1.body), formatJson(v2.body)]}
          readOnly={true}
          width="100%"
          height="400px"
          setOptions={{
            showLineNumbers: true,
            showPrintMargin: false,
          }}
          editorProps={{ $blockScrolling: true }}
        />
      </Paper>
    </Box>
  );
}
