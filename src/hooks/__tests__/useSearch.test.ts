import { renderHook, act } from '@testing-library/react';
import { useSearch } from '../useSearch';
import { searchContent } from '@/lib/search';

// Mock searchContent function
jest.mock('@/lib/search', () => ({
  searchContent: jest.fn(),
}));

describe('useSearch Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (searchContent as jest.Mock).mockResolvedValue({
      results: [
        { id: '1', title: 'Test Content 1' },
        { id: '2', title: 'Test Content 2' },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      },
    });
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSearch());

    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });
    // Just check that filters exists as an object
    expect(typeof result.current.filters).toBe('object');
  });

  it('should perform search initially', async () => {
    renderHook(() => useSearch());

    // Wait for initial search to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400)); // Wait for debounce
    });

    expect(searchContent).toHaveBeenCalled();
  });

  it('should update filters when updateFilters is called', async () => {
    const { result } = renderHook(() => useSearch());

    await act(async () => {
      result.current.updateFilters({
        query: 'test',
        status: ['DRAFT', 'IN_REVIEW'],
        type: ['ARTICLE'],
        priority: ['HIGH'],
      });
    });

    expect(result.current.filters).toEqual(
      expect.objectContaining({
        query: 'test',
        status: ['DRAFT', 'IN_REVIEW'],
        type: ['ARTICLE'],
        priority: ['HIGH'],
      })
    );
  });

  it('should update page in filters', async () => {
    const { result } = renderHook(() => useSearch());

    await act(async () => {
      // First directly update the filters with a page
      result.current.updateFilters({ page: 2 });
    });

    // Verify the page was updated in filters
    expect(result.current.filters.page).toBe(2);
  });

  it('should update limit when updateFilters is called with limit', async () => {
    const { result } = renderHook(() => useSearch());

    await act(async () => {
      result.current.updateFilters({ limit: 20 });
    });

    expect(result.current.filters.limit).toBe(20);
  });

  it('should handle error when search fails', async () => {
    (searchContent as jest.Mock).mockRejectedValueOnce(
      new Error('Search failed')
    );

    const { result } = renderHook(() => useSearch());

    // Wait for initial search to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400)); // Wait for debounce
    });

    expect(result.current.error).toBe(
      'Failed to perform search. Please try again.'
    );
    expect(result.current.loading).toBe(false);
  });

  it('should reset filters when resetFilters is called', async () => {
    const { result } = renderHook(() =>
      useSearch({
        query: 'test',
        status: ['DRAFT'],
        type: ['ARTICLE'],
      })
    );

    // Verify initial filters
    expect(result.current.filters.query).toBe('test');

    await act(async () => {
      result.current.resetFilters();
    });

    // Verify filters are reset
    expect(result.current.filters).toEqual({
      query: '',
      page: 1,
      limit: 10,
    });
  });
});
