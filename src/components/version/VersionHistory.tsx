'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Restore as RestoreIcon,
  Compare as CompareIcon,
  MoreVert as MoreIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { CONTENT_PERMISSIONS } from '@/lib/permissions';

interface Version {
  id: string;
  versionNumber: number;
  title: string;
  createdAt: string;
  changeDescription: string | null;
  createdBy: {
    id: string;
    name: string;
  };
}

interface VersionHistoryProps {
  contentId: string;
  currentVersion: number;
  onVersionRestore?: (versionNumber: number) => Promise<void>;
  onVersionCompare?: (version1: number, version2: number) => void;
}

export function VersionHistory({
  contentId,
  currentVersion,
  onVersionRestore,
  onVersionCompare,
}: VersionHistoryProps) {
  const { user } = useAuth();
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<number | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersions, setCompareVersions] = useState<number[]>([]);

  // Fetch versions
  useEffect(() => {
    const fetchVersions = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/content/${contentId}/versions`);

        if (!response.ok) {
          throw new Error('Failed to fetch versions');
        }

        const data = await response.json();
        setVersions(data.versions);
      } catch (err) {
        console.error('Error fetching versions:', err);
        setError('Failed to load version history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (contentId) {
      fetchVersions();
    }
  }, [contentId]);

  // Check if user can restore versions
  const canRestoreVersion =
    user && CONTENT_PERMISSIONS.canRestoreVersion(user.role);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Handle version restore
  const handleRestoreClick = (versionNumber: number) => {
    setVersionToRestore(versionNumber);
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (versionToRestore !== null && onVersionRestore) {
      try {
        await onVersionRestore(versionToRestore);
        setRestoreDialogOpen(false);
        setVersionToRestore(null);
      } catch (err) {
        console.error('Error restoring version:', err);
        setError('Failed to restore version. Please try again.');
      }
    }
  };

  // Handle menu
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    versionNumber: number
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedVersion(versionNumber);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedVersion(null);
  };

  // Handle compare mode
  const handleCompareClick = () => {
    setCompareMode(true);
    handleMenuClose();
  };

  const handleVersionSelect = (versionNumber: number) => {
    if (compareMode) {
      if (compareVersions.includes(versionNumber)) {
        // Remove if already selected
        setCompareVersions(compareVersions.filter((v) => v !== versionNumber));
      } else if (compareVersions.length < 2) {
        // Add if less than 2 versions selected
        setCompareVersions([...compareVersions, versionNumber]);
      }
    }
  };

  const handleCompare = () => {
    if (compareVersions.length === 2 && onVersionCompare) {
      onVersionCompare(compareVersions[0], compareVersions[1]);
      setCompareMode(false);
      setCompareVersions([]);
    }
  };

  const handleCancelCompare = () => {
    setCompareMode(false);
    setCompareVersions([]);
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <HistoryIcon fontSize="small" />
          Version History
        </Typography>

        {compareMode ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleCompare}
              disabled={compareVersions.length !== 2}
            >
              Compare ({compareVersions.length}/2)
            </Button>
            <Button
              variant="text"
              color="inherit"
              onClick={handleCancelCompare}
            >
              Cancel
            </Button>
          </Box>
        ) : (
          <Button
            variant="outlined"
            startIcon={<CompareIcon />}
            onClick={() => setCompareMode(true)}
            disabled={versions.length < 2}
          >
            Compare Versions
          </Button>
        )}
      </Box>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Version list */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : versions.length === 0 ? (
        <Alert severity="info">No version history available</Alert>
      ) : (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {versions.map((version) => (
            <ListItem
              key={version.id}
              alignItems="flex-start"
              sx={{
                borderLeft: compareVersions.includes(version.versionNumber)
                  ? '4px solid'
                  : version.versionNumber === currentVersion
                    ? '4px dashed'
                    : '4px solid transparent',
                borderColor: compareVersions.includes(version.versionNumber)
                  ? 'primary.main'
                  : version.versionNumber === currentVersion
                    ? 'grey.400'
                    : 'transparent',
                pl: 2,
                cursor: compareMode ? 'pointer' : 'default',
                '&:hover': {
                  bgcolor: compareMode ? 'action.hover' : 'transparent',
                },
              }}
              onClick={
                compareMode
                  ? () => handleVersionSelect(version.versionNumber)
                  : undefined
              }
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">{version.title}</Typography>
                    <Chip
                      label={`v${version.versionNumber}`}
                      size="small"
                      color={
                        version.versionNumber === currentVersion
                          ? 'primary'
                          : 'default'
                      }
                      variant={
                        version.versionNumber === currentVersion
                          ? 'filled'
                          : 'outlined'
                      }
                    />
                    {version.versionNumber === currentVersion && (
                      <Chip label="Current" size="small" color="success" />
                    )}
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {version.changeDescription || 'No description provided'}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 0.5 }}
                    >
                      Created by {version.createdBy.name}{' '}
                      {formatDate(version.createdAt)}
                    </Typography>
                  </Box>
                }
              />

              {!compareMode && version.versionNumber !== currentVersion && (
                <ListItemSecondaryAction>
                  {canRestoreVersion && (
                    <Tooltip title="Restore this version">
                      <IconButton
                        edge="end"
                        onClick={() =>
                          handleRestoreClick(version.versionNumber)
                        }
                      >
                        <RestoreIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <IconButton
                    edge="end"
                    onClick={(e) => handleMenuOpen(e, version.versionNumber)}
                  >
                    <MoreIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
        </List>
      )}

      {/* Version action menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleCompareClick}>
          <CompareIcon fontSize="small" sx={{ mr: 1 }} />
          Compare with another version
        </MenuItem>
        {canRestoreVersion && selectedVersion !== currentVersion && (
          <MenuItem
            onClick={() => {
              if (selectedVersion !== null) {
                handleRestoreClick(selectedVersion);
              }
              handleMenuClose();
            }}
          >
            <RestoreIcon fontSize="small" sx={{ mr: 1 }} />
            Restore this version
          </MenuItem>
        )}
      </Menu>

      {/* Restore confirmation dialog */}
      <Dialog
        open={restoreDialogOpen}
        onClose={() => setRestoreDialogOpen(false)}
      >
        <DialogTitle>Restore Version</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to restore version {versionToRestore}? This
            will replace the current content with the content from this version.
            A backup of the current version will be created automatically.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRestoreConfirm} color="primary" autoFocus>
            Restore
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
