'use client';

import { useState, useMemo } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
  GridToolbarColumnsButton,
  GridRowSelectionModel,
  GridSortModel,
  GridFilterModel,
  GridPaginationModel,
} from '@mui/x-data-grid';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Menu,
  MenuItem,
  Tooltip,
  IconButton,
  TextField,
  InputAdornment,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search,
  FilterList,
  MoreVert,
  Refresh,
  Delete,
  Edit,
  Visibility,
  Download,
  KeyboardArrowDown,
} from '@mui/icons-material';

interface DataTableProps {
  rows: GridRowsProp;
  columns: GridColDef[];
  loading?: boolean;
  onRowClick?: (params: any) => void;
  onRowDoubleClick?: (params: any) => void;
  onSelectionChange?: (selection: GridRowSelectionModel) => void;
  onSortChange?: (sortModel: GridSortModel) => void;
  onFilterChange?: (filterModel: GridFilterModel) => void;
  onPaginationChange?: (paginationModel: GridPaginationModel) => void;
  onRefresh?: () => void;
  onDelete?: (selection: GridRowSelectionModel) => void;
  onEdit?: (selection: GridRowSelectionModel) => void;
  onView?: (selection: GridRowSelectionModel) => void;
  onExport?: (selection: GridRowSelectionModel) => void;
  onCustomAction?: (action: string, selection: GridRowSelectionModel) => void;
  customActions?: Array<{
    name: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  title?: string;
  subtitle?: string;
  initialState?: {
    pagination?: {
      paginationModel: GridPaginationModel;
    };
    sorting?: {
      sortModel: GridSortModel;
    };
    filter?: {
      filterModel: GridFilterModel;
    };
  };
  disableRowSelectionOnClick?: boolean;
  checkboxSelection?: boolean;
  disableColumnMenu?: boolean;
  hideFooter?: boolean;
  hideFooterPagination?: boolean;
  autoHeight?: boolean;
  height?: string | number;
  density?: 'compact' | 'standard' | 'comfortable';
  pageSizeOptions?: number[];
  showToolbar?: boolean;
  showQuickFilter?: boolean;
}

// Custom toolbar component with additional features
function CustomToolbar({
  title,
  subtitle,
  selection,
  onRefresh,
  onDelete,
  onEdit,
  onView,
  onExport,
  onCustomAction,
  customActions,
  showQuickFilter,
}: {
  title?: string;
  subtitle?: string;
  selection: GridRowSelectionModel;
  onRefresh?: () => void;
  onDelete?: (selection: GridRowSelectionModel) => void;
  onEdit?: (selection: GridRowSelectionModel) => void;
  onView?: (selection: GridRowSelectionModel) => void;
  onExport?: (selection: GridRowSelectionModel) => void;
  onCustomAction?: (action: string, selection: GridRowSelectionModel) => void;
  customActions?: Array<{
    name: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  showQuickFilter?: boolean;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: string) => {
    if (onCustomAction) {
      onCustomAction(action, selection);
    }
    handleClose();
  };

  return (
    <Box sx={{ p: 1 }}>
      {/* Title and subtitle */}
      {(title || subtitle) && (
        <Box sx={{ mb: 2 }}>
          {title && (
            <Typography variant="h6" component="h2">
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        {/* Left side - Selected items and actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {selection.length > 0 && (
            <>
              <Chip
                label={`${selection.length} selected`}
                color="primary"
                size="small"
                sx={{ mr: 1 }}
              />

              {onView && selection.length === 1 && (
                <Tooltip title="View">
                  <IconButton size="small" onClick={() => onView(selection)}>
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {onEdit && selection.length === 1 && (
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => onEdit(selection)}>
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {onDelete && (
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={() => onDelete(selection)}
                    color="error"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {onExport && (
                <Tooltip title="Export">
                  <IconButton size="small" onClick={() => onExport(selection)}>
                    <Download fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {customActions && customActions.length > 0 && (
                <>
                  <Button
                    size="small"
                    endIcon={<KeyboardArrowDown />}
                    onClick={handleClick}
                    variant="outlined"
                    sx={{ ml: 1 }}
                  >
                    Actions
                  </Button>
                  <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                    {customActions.map((action) => (
                      <MenuItem
                        key={action.name}
                        onClick={() => handleAction(action.name)}
                      >
                        {action.icon && (
                          <Box
                            component="span"
                            sx={{
                              mr: 1,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            {action.icon}
                          </Box>
                        )}
                        {action.label}
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}

              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            </>
          )}

          {onRefresh && (
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={onRefresh}>
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Right side - Standard toolbar items */}
        <GridToolbarContainer sx={{ justifyContent: 'flex-end' }}>
          {showQuickFilter && (
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ mr: 2, width: { xs: '100%', sm: 'auto' } }}
            />
          )}
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton />
          <GridToolbarDensitySelector />
          <GridToolbarExport />
        </GridToolbarContainer>
      </Box>
    </Box>
  );
}

export function DataTable({
  rows,
  columns,
  loading = false,
  onRowClick,
  onRowDoubleClick,
  onSelectionChange,
  onSortChange,
  onFilterChange,
  onPaginationChange,
  onRefresh,
  onDelete,
  onEdit,
  onView,
  onExport,
  onCustomAction,
  customActions,
  title,
  subtitle,
  initialState,
  disableRowSelectionOnClick = false,
  checkboxSelection = true,
  disableColumnMenu = false,
  hideFooter = false,
  hideFooterPagination = false,
  autoHeight = false,
  height = 500,
  density = 'standard',
  pageSizeOptions = [10, 25, 50, 100],
  showToolbar = true,
  showQuickFilter = true,
}: DataTableProps) {
  const [selection, setSelection] = useState<GridRowSelectionModel>([]);
  const theme = useTheme();

  // Handle selection changes
  const handleSelectionChange = (newSelection: GridRowSelectionModel) => {
    setSelection(newSelection);
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  };

  // Custom toolbar with selection info and actions
  const CustomDataGridToolbar = useMemo(() => {
    if (!showToolbar) return null;

    return () => (
      <CustomToolbar
        title={title}
        subtitle={subtitle}
        selection={selection}
        onRefresh={onRefresh}
        onDelete={onDelete}
        onEdit={onEdit}
        onView={onView}
        onExport={onExport}
        onCustomAction={onCustomAction}
        customActions={customActions}
        showQuickFilter={showQuickFilter}
      />
    );
  }, [
    title,
    subtitle,
    selection,
    onRefresh,
    onDelete,
    onEdit,
    onView,
    onExport,
    onCustomAction,
    customActions,
    showToolbar,
    showQuickFilter,
  ]);

  return (
    <Paper
      sx={{
        height: autoHeight ? 'auto' : height,
        width: '100%',
        '& .MuiDataGrid-cell:focus': {
          outline: 'none',
        },
        '& .MuiDataGrid-row:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
        },
        '& .MuiDataGrid-row.Mui-selected': {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
          },
        },
      }}
      elevation={1}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        initialState={initialState}
        checkboxSelection={checkboxSelection}
        disableRowSelectionOnClick={disableRowSelectionOnClick}
        disableColumnMenu={disableColumnMenu}
        autoHeight={autoHeight}
        hideFooter={hideFooter}
        hideFooterPagination={hideFooterPagination}
        pageSizeOptions={pageSizeOptions}
        density={density}
        onRowClick={onRowClick}
        onRowDoubleClick={onRowDoubleClick}
        onRowSelectionModelChange={handleSelectionChange}
        onSortModelChange={onSortChange}
        onFilterModelChange={onFilterChange}
        onPaginationModelChange={onPaginationChange}
        slots={{
          toolbar: CustomDataGridToolbar,
        }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: `1px solid ${theme.palette.divider}`,
          },
        }}
      />
    </Paper>
  );
}
