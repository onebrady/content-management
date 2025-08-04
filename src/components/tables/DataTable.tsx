'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  Pagination,
  TextInput,
  Select,
  ActionIcon,
  Group,
  Box,
  Paper,
  Text,
  Badge,
  Menu,
  Button,
  Tooltip,
  Divider,
  Checkbox,
  Stack,
} from '@mantine/core';
import {
  IconSearch,
  IconFilter,
  IconDotsVertical,
  IconRefresh,
  IconTrash,
  IconEdit,
  IconEye,
  IconDownload,
  IconChevronDown,
} from '@tabler/icons-react';

interface DataTableProps {
  rows: any[];
  columns: Array<{
    field: string;
    headerName: string;
    width?: number;
    renderCell?: (value: any, row: any) => React.ReactNode;
  }>;
  loading?: boolean;
  onRowClick?: (row: any) => void;
  onRowDoubleClick?: (row: any) => void;
  onSelectionChange?: (selection: string[]) => void;
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
  onFilterChange?: (filters: any) => void;
  onPaginationChange?: (page: number, pageSize: number) => void;
  onRefresh?: () => void;
  onDelete?: (selection: string[]) => void;
  onEdit?: (selection: string[]) => void;
  onView?: (selection: string[]) => void;
  onExport?: (selection: string[]) => void;
  onCustomAction?: (action: string, selection: string[]) => void;
  customActions?: Array<{
    name: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  title?: string;
  subtitle?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
  disableRowSelectionOnClick?: boolean;
  checkboxSelection?: boolean;
  hideFooter?: boolean;
  hideFooterPagination?: boolean;
  autoHeight?: boolean;
  height?: string | number;
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
  onSearch,
}: {
  title?: string;
  subtitle?: string;
  selection: string[];
  onRefresh?: () => void;
  onDelete?: (selection: string[]) => void;
  onEdit?: (selection: string[]) => void;
  onView?: (selection: string[]) => void;
  onExport?: (selection: string[]) => void;
  onCustomAction?: (action: string, selection: string[]) => void;
  customActions?: Array<{
    name: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  showQuickFilter?: boolean;
  onSearch?: (value: string) => void;
}) {
  const [searchValue, setSearchValue] = useState('');
  const [menuOpened, setMenuOpened] = useState(false);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const handleAction = (action: string) => {
    if (onCustomAction) {
      onCustomAction(action, selection);
    }
    setMenuOpened(false);
  };

  return (
    <Box p="md">
      {/* Title and subtitle */}
      {(title || subtitle) && (
        <Box mb="md">
          {title && (
            <Text size="lg" fw={600}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text size="sm" c="dimmed">
              {subtitle}
            </Text>
          )}
        </Box>
      )}

      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        {/* Left side - Selected items and actions */}
        <Group gap="xs">
          {selection.length > 0 && (
            <>
              <Badge color="blue" size="sm">
                {selection.length} selected
              </Badge>

              {onView && selection.length === 1 && (
                <Tooltip label="View">
                  <ActionIcon size="sm" onClick={() => onView(selection)}>
                    <IconEye size={16} />
                  </ActionIcon>
                </Tooltip>
              )}

              {onEdit && selection.length === 1 && (
                <Tooltip label="Edit">
                  <ActionIcon size="sm" onClick={() => onEdit(selection)}>
                    <IconEdit size={16} />
                  </ActionIcon>
                </Tooltip>
              )}

              {onDelete && (
                <Tooltip label="Delete">
                  <ActionIcon size="sm" color="red" onClick={() => onDelete(selection)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              )}

              {onExport && (
                <Tooltip label="Export">
                  <ActionIcon size="sm" onClick={() => onExport(selection)}>
                    <IconDownload size={16} />
                  </ActionIcon>
                </Tooltip>
              )}

              {customActions && customActions.length > 0 && (
                <>
                  <Menu opened={menuOpened} onOpen={setMenuOpened}>
                    <Menu.Target>
                      <Button size="xs" variant="outline" rightSection={<IconChevronDown size={14} />}>
                        Actions
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {customActions.map((action) => (
                        <Menu.Item
                          key={action.name}
                          onClick={() => handleAction(action.name)}
                          leftSection={action.icon}
                        >
                          {action.label}
                        </Menu.Item>
                      ))}
                    </Menu.Dropdown>
                  </Menu>
                </>
              )}

              <Divider orientation="vertical" />
            </>
          )}

          {onRefresh && (
            <Tooltip label="Refresh">
              <ActionIcon size="sm" onClick={onRefresh}>
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>

        {/* Right side - Search */}
        {showQuickFilter && (
          <TextInput
            placeholder="Search..."
            value={searchValue}
            onChange={(event) => handleSearch(event.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
            size="sm"
            style={{ minWidth: 200 }}
          />
        )}
      </Group>
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
  pagination,
  disableRowSelectionOnClick = false,
  checkboxSelection = true,
  hideFooter = false,
  hideFooterPagination = false,
  autoHeight = false,
  height = 500,
  pageSizeOptions = [10, 25, 50, 100],
  showToolbar = true,
  showQuickFilter = true,
}: DataTableProps) {
  const [selection, setSelection] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');

  // Handle selection changes
  const handleSelectionChange = (newSelection: string[]) => {
    setSelection(newSelection);
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  };

  // Handle row selection
  const handleRowSelect = (rowId: string, checked: boolean) => {
    const newSelection = checked
      ? [...selection, rowId]
      : selection.filter(id => id !== rowId);
    handleSelectionChange(newSelection);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? rows.map(row => row.id) : [];
    handleSelectionChange(newSelection);
  };

  // Handle row click
  const handleRowClick = (row: any) => {
    if (!disableRowSelectionOnClick) {
      onRowClick?.(row);
    }
  };

  // Filter rows based on search
  const filteredRows = useMemo(() => {
    if (!searchValue) return rows;
    
    return rows.filter(row =>
      columns.some(column => {
        const value = row[column.field];
        return value && value.toString().toLowerCase().includes(searchValue.toLowerCase());
      })
    );
  }, [rows, searchValue, columns]);

  // Custom toolbar with selection info and actions
  const CustomDataTableToolbar = useMemo(() => {
    if (!showToolbar) return null;

    return (
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
        onSearch={setSearchValue}
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
    <Paper shadow="sm" radius="md" withBorder>
      {CustomDataTableToolbar}
      
      <Box style={{ height: autoHeight ? 'auto' : height, overflow: 'auto' }}>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              {checkboxSelection && (
                <Table.Th style={{ width: 40 }}>
                  <Checkbox
                    checked={selection.length === rows.length && rows.length > 0}
                    indeterminate={selection.length > 0 && selection.length < rows.length}
                    onChange={(event) => handleSelectAll(event.currentTarget.checked)}
                  />
                </Table.Th>
              )}
              {columns.map((column) => (
                <Table.Th key={column.field} style={{ width: column.width }}>
                  {column.headerName}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredRows.map((row) => (
              <Table.Tr
                key={row.id}
                onClick={() => handleRowClick(row)}
                onDoubleClick={() => onRowDoubleClick?.(row)}
                style={{ cursor: disableRowSelectionOnClick ? 'default' : 'pointer' }}
              >
                {checkboxSelection && (
                  <Table.Td>
                    <Checkbox
                      checked={selection.includes(row.id)}
                      onChange={(event) => handleRowSelect(row.id, event.currentTarget.checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Table.Td>
                )}
                {columns.map((column) => (
                  <Table.Td key={column.field}>
                    {column.renderCell
                      ? column.renderCell(row[column.field], row)
                      : row[column.field]}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>

      {!hideFooter && !hideFooterPagination && pagination && (
        <Box p="md">
          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
              {pagination.total} results
            </Text>
            
            <Group gap="xs">
              <Select
                size="xs"
                value={pagination.pageSize.toString()}
                onChange={(value) => onPaginationChange?.(1, parseInt(value || '10'))}
                data={pageSizeOptions.map(size => ({ value: size.toString(), label: `${size} per page` }))}
                style={{ width: 120 }}
              />
              
              <Pagination
                total={pagination.pageCount}
                value={pagination.page}
                onChange={(page) => onPaginationChange?.(page, pagination.pageSize)}
                size="sm"
              />
            </Group>
          </Group>
        </Box>
      )}
    </Paper>
  );
}
