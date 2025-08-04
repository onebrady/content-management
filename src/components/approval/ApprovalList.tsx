'use client';

import { useState } from 'react';
import {
  Box,
  Table,
  Text,
  Badge,
  ActionIcon,
  Pagination,
  Divider,
  Loader,
  Alert,
  Tooltip,
  Menu,
  Button,
  Modal,
  Textarea,
  Checkbox,
  Group,
  Stack,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconDotsVertical,
  IconCheck,
  IconX,
  IconEye,
  IconArrowBack,
} from '@tabler/icons-react';
import { BulkApprovalActions } from './BulkApprovalActions';
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
  const { colorScheme } = useMantineColorScheme();
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<string>('updatedAt');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [actionMenuOpened, setActionMenuOpened] = useState<string | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [modalOpened, setModalOpened] = useState<{
    opened: boolean;
    type: 'approve' | 'reject' | 'return';
  }>({
    opened: false,
    type: 'approve',
  });
  const [comments, setComments] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const isDark = colorScheme === 'dark';

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangePageSize = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
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

  const handleActionMenuToggle = (approvalId: string) => {
    setActionMenuOpened(actionMenuOpened === approvalId ? null : approvalId);
  };

  const handleOpenModal = (
    type: 'approve' | 'reject' | 'return',
    approval: any
  ) => {
    setSelectedApproval(approval);
    setModalOpened({
      opened: true,
      type,
    });
    setActionMenuOpened(null);
  };

  const handleCloseModal = () => {
    setModalOpened({
      ...modalOpened,
      opened: false,
    });
    setComments('');
  };

  const handleApprove = async () => {
    if (!selectedApproval) return;

    try {
      // Check if this is a pending approval (no existing approval record)
      const isPendingApproval = selectedApproval._isPendingApproval;

      let response;
      if (isPendingApproval) {
        // Create new approval record
        response = await fetch(
          `/api/content/${selectedApproval.content.id}/approval`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: ApprovalStatus.APPROVED,
              comments,
            }),
          }
        );
      } else {
        // Update existing approval record
        response = await fetch(
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
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to approve content');
      }

      // Close modal and refresh data
      handleCloseModal();
      onStatusChange();
    } catch (error) {
      console.error('Error approving content:', error);
      // You might want to show a notification here
    }
  };

  const handleReject = async () => {
    if (!selectedApproval) return;

    try {
      // Check if this is a pending approval (no existing approval record)
      const isPendingApproval = selectedApproval._isPendingApproval;

      let response;
      if (isPendingApproval) {
        // Create new approval record
        response = await fetch(
          `/api/content/${selectedApproval.content.id}/approval`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: ApprovalStatus.REJECTED,
              comments,
            }),
          }
        );
      } else {
        // Update existing approval record
        response = await fetch(
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
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to reject content');
      }

      // Close modal and refresh data
      handleCloseModal();
      onStatusChange();
    } catch (error) {
      console.error('Error rejecting content:', error);
      // You might want to show a notification here
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
      handleCloseModal();
    } catch (error) {
      console.error('Error returning content to draft:', error);
    }
  };

  const handleViewContent = (contentId: string, slug?: string) => {
    if (slug) {
      // Link to the actual article page using slug
      router.push(`/content/${slug}`);
    } else {
      // Fallback to the content view if no slug is available
      router.push(`/content?view=${contentId}`);
    }
  };

  // Get status color
  const getStatusColor = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.APPROVED:
        return 'green';
      case ApprovalStatus.REJECTED:
        return 'red';
      case ApprovalStatus.PENDING:
        return 'orange';
      default:
        return 'gray';
    }
  };

  // Get content status color
  const getContentStatusColor = (status: ContentStatus) => {
    switch (status) {
      case ContentStatus.APPROVED:
        return 'green';
      case ContentStatus.REJECTED:
        return 'red';
      case ContentStatus.IN_REVIEW:
        return 'orange';
      case ContentStatus.PUBLISHED:
        return 'blue';
      case ContentStatus.DRAFT:
      default:
        return 'gray';
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

  // Calculate pagination
  const totalPages = Math.ceil(approvals.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const visibleRows = stableSort(
    approvals,
    getComparator(order, orderBy)
  ).slice(startIndex, endIndex);

  return (
    <Box w="100%">
      {/* Bulk Actions */}
      {selected.length > 0 && (
        <Box
          p="md"
          mb="md"
          style={{
            backgroundColor: isDark
              ? 'var(--mantine-color-blue-9)'
              : 'var(--mantine-color-blue-1)',
            borderRadius: 8,
          }}
        >
          <Group justify="space-between" align="center">
            <Text size="sm" fw={500}>
              {selected.length} {selected.length === 1 ? 'item' : 'items'}{' '}
              selected
            </Text>
            <BulkApprovalActions
              selectedApprovals={selected}
              onActionComplete={handleBulkActionComplete}
            />
          </Group>
        </Box>
      )}

      {/* Table */}
      <Table.ScrollContainer minWidth={750}>
        <Table
          highlightOnHover
          withTableBorder
          withColumnBorders
          style={{
            backgroundColor: isDark
              ? 'var(--mantine-color-dark-6)'
              : 'var(--mantine-color-white)',
          }}
        >
          <Table.Thead>
            <Table.Tr>
              {headCells.map((headCell) => (
                <Table.Th key={headCell.id} style={{ fontWeight: 'bold' }}>
                  {headCell.id === 'select' ? (
                    <Checkbox
                      color="blue"
                      indeterminate={
                        selected.length > 0 &&
                        selected.length < visibleRows.length
                      }
                      checked={
                        visibleRows.length > 0 &&
                        selected.length === visibleRows.length
                      }
                      onChange={handleSelectAllClick}
                    />
                  ) : headCell.sortable ? (
                    <Button
                      variant="subtle"
                      size="xs"
                      onClick={() => handleRequestSort(headCell.id)}
                      rightSection={
                        orderBy === headCell.id
                          ? order === 'desc'
                            ? '↓'
                            : '↑'
                          : null
                      }
                    >
                      {headCell.label}
                    </Button>
                  ) : (
                    headCell.label
                  )}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {visibleRows.map((row) => {
              const isItemSelected = isSelected(row.id);

              return (
                <Table.Tr
                  key={row.id}
                  style={{
                    backgroundColor: isItemSelected
                      ? isDark
                        ? 'var(--mantine-color-blue-9)'
                        : 'var(--mantine-color-blue-1)'
                      : undefined,
                  }}
                >
                  <Table.Td>
                    <Checkbox
                      color="blue"
                      checked={isItemSelected}
                      onChange={(event) => handleSelectClick(event, row.id)}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {row.content?.title || 'Unknown Content'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" variant="outline" color="gray">
                      {row.content?.type || 'Unknown'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{row.content?.author?.name || 'Unknown'}</Table.Td>
                  <Table.Td>
                    <Badge
                      size="sm"
                      color={getStatusColor(row.status)}
                      variant="light"
                    >
                      {row.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      size="sm"
                      color={getContentStatusColor(row.content?.status)}
                      variant="light"
                    >
                      {row.content?.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{formatDate(row.updatedAt)}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="View Article">
                        <ActionIcon
                          size="sm"
                          variant="light"
                          onClick={() =>
                            handleViewContent(
                              row.content?.id,
                              row.content?.slug
                            )
                          }
                        >
                          <IconEye size={14} />
                        </ActionIcon>
                      </Tooltip>
                      <Menu
                        opened={actionMenuOpened === row.id}
                        onClose={() => setActionMenuOpened(null)}
                      >
                        <Menu.Target>
                          <ActionIcon
                            size="sm"
                            variant="light"
                            onClick={() => handleActionMenuToggle(row.id)}
                          >
                            <IconDotsVertical size={14} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconCheck size={14} />}
                            onClick={() => handleOpenModal('approve', row)}
                            color="green"
                          >
                            Approve
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconX size={14} />}
                            onClick={() => handleOpenModal('reject', row)}
                            color="red"
                          >
                            Reject
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconArrowBack size={14} />}
                            onClick={() => handleOpenModal('return', row)}
                          >
                            Return to Draft
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item
                            leftSection={<IconEye size={14} />}
                            onClick={() => {
                              handleViewContent(
                                row.content?.id,
                                row.content?.slug
                              );
                              setActionMenuOpened(null);
                            }}
                          >
                            View Article
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: 32,
          }}
        >
          <Pagination
            total={totalPages}
            value={page}
            onChange={handleChangePage}
            color="blue"
          />
        </Box>
      )}

      {/* Approval Modal */}
      <Modal
        opened={modalOpened.opened && modalOpened.type === 'approve'}
        onClose={handleCloseModal}
        title="Approve Content"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            You are approving "{selectedApproval?.content?.title}". Please
            provide any comments (optional).
          </Text>
          <Textarea
            label="Comments"
            placeholder="Add your comments here..."
            value={comments}
            onChange={(e) => setComments(e.currentTarget.value)}
            rows={4}
            autosize
          />
          <Group justify="flex-end" gap="sm">
            <Button variant="light" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button color="green" onClick={handleApprove}>
              Approve
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Reject Modal */}
      <Modal
        opened={modalOpened.opened && modalOpened.type === 'reject'}
        onClose={handleCloseModal}
        title="Reject Content"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            You are rejecting "{selectedApproval?.content?.title}". Please
            provide a reason for rejection.
          </Text>
          <Textarea
            label="Reason for Rejection"
            placeholder="Enter rejection reason..."
            value={comments}
            onChange={(e) => setComments(e.currentTarget.value)}
            rows={4}
            autosize
            required
          />
          <Group justify="flex-end" gap="sm">
            <Button variant="light" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleReject}
              disabled={!comments.trim()}
            >
              Reject
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Return to Draft Modal */}
      <Modal
        opened={modalOpened.opened && modalOpened.type === 'return'}
        onClose={handleCloseModal}
        title="Return to Draft"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            You are returning "{selectedApproval?.content?.title}" to draft
            state. Please provide a reason.
          </Text>
          <Textarea
            label="Reason"
            placeholder="Enter reason for returning to draft..."
            value={comments}
            onChange={(e) => setComments(e.currentTarget.value)}
            rows={4}
            autosize
            required
          />
          <Group justify="flex-end" gap="sm">
            <Button variant="light" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleReturnToDraft} disabled={!comments.trim()}>
              Return to Draft
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
