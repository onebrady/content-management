'use client';

import { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Typography,
  Checkbox,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  ArrowBack as ReturnIcon,
} from '@mui/icons-material';
import { BulkApprovalActions } from './BulkApprovalActions';
import { visuallyHidden } from '@mui/utils';
import { useRouter } from 'next/navigation';
import { ApprovalStatus, ContentStatus } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';

interface ApprovalListProps {
  approvals: any[];
  onStatusChange: () => void;
}

type Order = 'asc' | 'desc';

interface HeadCell {
  id: string;
  label: string;
  numeric: boolean;
  sortable: boolean;
}

const headCells: HeadCell[] = [
  { id: 'select', label: '', numeric: false, sortable: false },
  { id: 'title', label: 'Content', numeric: false, sortable: true },
  { id: 'type', label: 'Type', numeric: false, sortable: true },
  { id: 'author', label: 'Author', numeric: false, sortable: true },
  { id: 'status', label: 'Status', numeric: false, sortable: true },
  {
    id: 'contentStatus',
    label: 'Content Status',
    numeric: false,
    sortable: true,
  },
  { id: 'updatedAt', label: 'Last Updated', numeric: false, sortable: true },
  { id: 'actions', label: 'Actions', numeric: false, sortable: false },
];

export function ApprovalList({ approvals, onStatusChange }: ApprovalListProps) {
  const router = useRouter();
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<string>('updatedAt');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | 'return';
  }>({
    open: false,
    type: 'approve',
  });
  const [comments, setComments] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Selection handlers
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = visibleRows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelectClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const handleBulkActionComplete = () => {
    setSelected([]);
    onStatusChange();
  };

  const handleActionMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    approval: any
  ) => {
    setActionMenuAnchorEl(event.currentTarget);
    setSelectedApproval(approval);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
  };

  const handleOpenDialog = (type: 'approve' | 'reject' | 'return') => {
    setDialogOpen({
      open: true,
      type,
    });
    handleActionMenuClose();
  };

  const handleCloseDialog = () => {
    setDialogOpen({
      ...dialogOpen,
      open: false,
    });
    setComments('');
  };

  const handleApprove = async () => {
    if (!selectedApproval) return;

    try {
      const response = await fetch(
        `/api/content/${selectedApproval.content.id}/approval/${selectedApproval.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: ApprovalStatus.APPROVED,
            comments,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to approve content');
      }

      onStatusChange();
      handleCloseDialog();
    } catch (error) {
      console.error('Error approving content:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedApproval) return;

    try {
      const response = await fetch(
        `/api/content/${selectedApproval.content.id}/approval/${selectedApproval.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: ApprovalStatus.REJECTED,
            comments,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reject content');
      }

      onStatusChange();
      handleCloseDialog();
    } catch (error) {
      console.error('Error rejecting content:', error);
    }
  };

  const handleReturnToDraft = async () => {
    if (!selectedApproval) return;

    try {
      const response = await fetch(
        `/api/content/${selectedApproval.content.id}/workflow`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'return_to_draft',
            reason: comments,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to return content to draft');
      }

      onStatusChange();
      handleCloseDialog();
    } catch (error) {
      console.error('Error returning content to draft:', error);
    }
  };

  const handleViewContent = (contentId: string) => {
    router.push(`/content?view=${contentId}`);
  };

  // Get status color
  const getStatusColor = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.APPROVED:
        return 'success';
      case ApprovalStatus.REJECTED:
        return 'error';
      case ApprovalStatus.PENDING:
        return 'warning';
      default:
        return 'default';
    }
  };

  // Get content status color
  const getContentStatusColor = (status: ContentStatus) => {
    switch (status) {
      case ContentStatus.APPROVED:
        return 'success';
      case ContentStatus.REJECTED:
        return 'error';
      case ContentStatus.IN_REVIEW:
        return 'warning';
      case ContentStatus.PUBLISHED:
        return 'info';
      case ContentStatus.DRAFT:
      default:
        return 'default';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Sort function
  function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  function getComparator(
    order: Order,
    orderBy: string
  ): (a: any, b: any) => number {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function descendingComparator(a: any, b: any, orderBy: string): number {
    // Handle nested properties
    if (orderBy === 'title') {
      return (b.content?.title || '').localeCompare(a.content?.title || '');
    } else if (orderBy === 'type') {
      return (b.content?.type || '').localeCompare(a.content?.type || '');
    } else if (orderBy === 'author') {
      return (b.content?.author?.name || '').localeCompare(
        a.content?.author?.name || ''
      );
    } else if (orderBy === 'contentStatus') {
      return (b.content?.status || '').localeCompare(a.content?.status || '');
    }

    // Handle direct properties
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  // Avoid a layout jump when reaching the last page with empty rows
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - approvals.length) : 0;

  const visibleRows = stableSort(
    approvals,
    getComparator(order, orderBy)
  ).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Bulk Actions */}
      {selected.length > 0 && (
        <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1, mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="subtitle1">
              {selected.length} {selected.length === 1 ? 'item' : 'items'}{' '}
              selected
            </Typography>
            <BulkApprovalActions
              selectedApprovals={selected}
              onActionComplete={handleBulkActionComplete}
            />
          </Box>
        </Box>
      )}

      <TableContainer>
        <Table sx={{ minWidth: 750 }} aria-labelledby="approvalTable">
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.numeric ? 'right' : 'left'}
                  sortDirection={orderBy === headCell.id ? order : false}
                  sx={{ fontWeight: 'bold' }}
                >
                  {headCell.id === 'select' ? (
                    <Checkbox
                      color="primary"
                      indeterminate={
                        selected.length > 0 &&
                        selected.length < visibleRows.length
                      }
                      checked={
                        visibleRows.length > 0 &&
                        selected.length === visibleRows.length
                      }
                      onChange={handleSelectAllClick}
                      inputProps={{
                        'aria-label': 'select all approvals',
                      }}
                    />
                  ) : headCell.sortable ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={() => handleRequestSort(headCell.id)}
                    >
                      {headCell.label}
                      {orderBy === headCell.id ? (
                        <Box component="span" sx={visuallyHidden}>
                          {order === 'desc'
                            ? 'sorted descending'
                            : 'sorted ascending'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  ) : (
                    headCell.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map((row) => {
              const isItemSelected = isSelected(row.id);

              return (
                <TableRow
                  hover
                  key={row.id}
                  selected={isItemSelected}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                      onClick={(event) => handleSelectClick(event, row.id)}
                      inputProps={{
                        'aria-labelledby': `approval-${row.id}`,
                      }}
                    />
                  </TableCell>
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="medium">
                      {row.content?.title || 'Unknown Content'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.content?.type || 'Unknown'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {row.content?.author?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      color={getStatusColor(row.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.content?.status}
                      color={getContentStatusColor(row.content?.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(row.updatedAt)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex' }}>
                      <Tooltip title="View Content">
                        <IconButton
                          size="small"
                          onClick={() => handleViewContent(row.content?.id)}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Actions">
                        <IconButton
                          size="small"
                          onClick={(e) => handleActionMenuOpen(e, row)}
                        >
                          <MoreIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={8} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={approvals.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={() => handleOpenDialog('approve')}>
          <ListItemIcon>
            <ApproveIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>Approve</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleOpenDialog('reject')}>
          <ListItemIcon>
            <RejectIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Reject</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleOpenDialog('return')}>
          <ListItemIcon>
            <ReturnIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Return to Draft</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedApproval) {
              handleViewContent(selectedApproval.content?.id);
            }
            handleActionMenuClose();
          }}
        >
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
      </Menu>

      {/* Approval Dialog */}
      <Dialog
        open={dialogOpen.open && dialogOpen.type === 'approve'}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Approve Content</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are approving "{selectedApproval?.content?.title}". Please
            provide any comments (optional).
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Comments"
            fullWidth
            multiline
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleApprove} color="success" variant="contained">
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={dialogOpen.open && dialogOpen.type === 'reject'}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Reject Content</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are rejecting "{selectedApproval?.content?.title}". Please
            provide a reason for rejection.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Rejection"
            fullWidth
            multiline
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleReject}
            color="error"
            variant="contained"
            disabled={!comments.trim()}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Return to Draft Dialog */}
      <Dialog
        open={dialogOpen.open && dialogOpen.type === 'return'}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Return to Draft</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are returning "{selectedApproval?.content?.title}" to draft
            state. Please provide a reason.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Reason"
            fullWidth
            multiline
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleReturnToDraft}
            variant="contained"
            disabled={!comments.trim()}
          >
            Return to Draft
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
