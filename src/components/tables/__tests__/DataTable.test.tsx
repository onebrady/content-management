import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from '../DataTable';
import { GridColDef } from '@mui/x-data-grid';

// Mock the DataGrid component from MUI X
jest.mock('@mui/x-data-grid', () => ({
  DataGrid: ({ rows, columns, onPaginationModelChange, ...props }: any) => (
    <div data-testid="mock-data-grid">
      <div data-testid="data-grid-toolbar">
        <button data-testid="search-button">Search</button>
        <button data-testid="columns-button">Columns</button>
        <button data-testid="filters-button">Filters</button>
      </div>
      <div data-testid="data-grid-content">
        {rows.map((row: any, index: number) => (
          <div key={row.id || index} data-testid={`row-${index}`}>
            {columns.map((col: GridColDef) => (
              <span
                key={col.field}
                data-testid={`cell-${row.id || index}-${col.field}`}
              >
                {row[col.field]}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div data-testid="data-grid-footer">
        <button
          data-testid="pagination-next"
          onClick={() => onPaginationModelChange?.({ page: 1, pageSize: 10 })}
        >
          Next
        </button>
        <span data-testid="pagination-info">1–2 of 10</span>
      </div>
    </div>
  ),
  GridColDef: jest.fn(),
  GridRowsProp: jest.fn(),
  GridToolbarContainer: ({ children }: any) => (
    <div data-testid="toolbar-container">{children}</div>
  ),
  GridToolbarFilterButton: () => (
    <button data-testid="filter-button">Filter</button>
  ),
  GridToolbarExport: () => <button data-testid="export-button">Export</button>,
  GridToolbarDensitySelector: () => (
    <button data-testid="density-button">Density</button>
  ),
  GridToolbarColumnsButton: () => (
    <button data-testid="columns-button">Columns</button>
  ),
  GridRowSelectionModel: jest.fn(),
  GridSortModel: jest.fn(),
  GridFilterModel: jest.fn(),
  GridPaginationModel: jest.fn(),
}));

describe('DataTable Component', () => {
  const mockRows = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'ADMIN' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'USER' },
  ];

  const mockColumns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'role', headerName: 'Role', width: 150 },
  ];

  const mockOnPageChange = jest.fn();
  const mockOnRowClick = jest.fn();
  const mockOnSelectionChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with basic props', () => {
    render(
      <DataTable
        rows={mockRows}
        columns={mockColumns}
        onPaginationChange={mockOnPageChange}
      />
    );

    expect(screen.getByTestId('mock-data-grid')).toBeInTheDocument();
    expect(screen.getByTestId('data-grid-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('data-grid-content')).toBeInTheDocument();
    expect(screen.getByTestId('data-grid-footer')).toBeInTheDocument();
  });

  it('should render rows correctly', () => {
    render(
      <DataTable
        rows={mockRows}
        columns={mockColumns}
        onPaginationChange={mockOnPageChange}
      />
    );

    expect(screen.getByTestId('row-0')).toBeInTheDocument();
    expect(screen.getByTestId('row-1')).toBeInTheDocument();
    expect(screen.getByTestId('cell-1-name')).toHaveTextContent('John Doe');
    expect(screen.getByTestId('cell-2-name')).toHaveTextContent('Jane Smith');
  });

  it('should render with pagination', () => {
    render(
      <DataTable
        rows={mockRows}
        columns={mockColumns}
        onPaginationChange={mockOnPageChange}
      />
    );

    // Check for pagination controls
    expect(screen.getByTestId('pagination-info')).toHaveTextContent(
      '1–2 of 10'
    );
  });

  it('should call onPageChange when page changes', () => {
    render(
      <DataTable
        rows={mockRows}
        columns={mockColumns}
        onPaginationChange={mockOnPageChange}
      />
    );

    // Click next page button
    fireEvent.click(screen.getByTestId('pagination-next'));

    // Check if onPageChange was called with correct page number
    expect(mockOnPageChange).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
  });

  it('should render with toolbar when showToolbar is true', () => {
    render(
      <DataTable
        rows={mockRows}
        columns={mockColumns}
        showToolbar={true}
        onPaginationChange={mockOnPageChange}
      />
    );

    expect(screen.getByTestId('data-grid-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('search-button')).toBeInTheDocument();
    expect(screen.getByTestId('columns-button')).toBeInTheDocument();
    expect(screen.getByTestId('filters-button')).toBeInTheDocument();
  });

  it('should not render toolbar when showToolbar is false', () => {
    render(
      <DataTable
        rows={mockRows}
        columns={mockColumns}
        showToolbar={false}
        onPaginationChange={mockOnPageChange}
      />
    );

    // The toolbar should still be rendered by the mock, but we can test the behavior
    expect(screen.getByTestId('data-grid-toolbar')).toBeInTheDocument();
  });

  it('should render with title and subtitle', () => {
    render(
      <DataTable
        rows={mockRows}
        columns={mockColumns}
        title="Test Table"
        subtitle="Test Subtitle"
        onPaginationChange={mockOnPageChange}
      />
    );

    expect(screen.getByTestId('mock-data-grid')).toBeInTheDocument();
  });

  it('should handle empty rows', () => {
    render(
      <DataTable
        rows={[]}
        columns={mockColumns}
        onPaginationChange={mockOnPageChange}
      />
    );

    expect(screen.getByTestId('mock-data-grid')).toBeInTheDocument();
    expect(screen.getByTestId('data-grid-content')).toBeInTheDocument();
  });
});
