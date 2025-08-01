import React from 'react';
import { render, screen, fireEvent } from '@/utils/test-utils';
import { DataTable } from '../DataTable';

describe('DataTable Component', () => {
  const mockColumns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'title', headerName: 'Title', width: 200 },
    { field: 'status', headerName: 'Status', width: 150 },
  ];

  const mockRows = [
    { id: '1', title: 'Test Item 1', status: 'Active' },
    { id: '2', title: 'Test Item 2', status: 'Inactive' },
    { id: '3', title: 'Test Item 3', status: 'Pending' },
  ];

  it('should render with columns and rows', () => {
    render(
      <DataTable
        columns={mockColumns}
        rows={mockRows}
        pageSize={10}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
      />
    );

    // Check column headers are rendered
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();

    // Check row data is rendered
    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    expect(screen.getByText('Test Item 3')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('should render with loading state', () => {
    render(
      <DataTable
        columns={mockColumns}
        rows={[]}
        pageSize={10}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        loading={true}
      />
    );

    // Check for loading indicator
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render with empty state when no rows', () => {
    render(
      <DataTable
        columns={mockColumns}
        rows={[]}
        pageSize={10}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
      />
    );

    // Check for empty state message
    expect(screen.getByText('No rows')).toBeInTheDocument();
  });

  it('should render with pagination', () => {
    render(
      <DataTable
        columns={mockColumns}
        rows={mockRows}
        pageSize={2}
        rowCount={10}
        page={0}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
      />
    );

    // Check for pagination controls
    expect(screen.getByText('1–2 of 10')).toBeInTheDocument();
  });

  it('should call onPageChange when page changes', () => {
    const mockOnPageChange = jest.fn();

    render(
      <DataTable
        columns={mockColumns}
        rows={mockRows}
        pageSize={2}
        rowCount={10}
        page={0}
        onPageChange={mockOnPageChange}
        onPageSizeChange={() => {}}
      />
    );

    // Find and click next page button
    const nextPageButton = screen.getByLabelText('Go to next page');
    fireEvent.click(nextPageButton);

    // Check if onPageChange was called with correct page number
    expect(mockOnPageChange).toHaveBeenCalledWith(1);
  });
});
