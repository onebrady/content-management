'use client';

import { useState, useEffect, useCallback } from 'react';
import { searchContent, SearchFilters, SearchResults } from '@/lib/search';
import { debounce } from 'lodash';

export function useSearch(initialFilters: SearchFilters = {}) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [results, setResults] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchFilters: SearchFilters) => {
      setLoading(true);
      setError(null);

      try {
        const searchResults = await searchContent(searchFilters);
        setResults(searchResults.results);
        setPagination(searchResults.pagination);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to perform search. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Execute search when filters change
  useEffect(() => {
    debouncedSearch(filters);

    return () => {
      debouncedSearch.cancel();
    };
  }, [filters, debouncedSearch]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
      // Reset to page 1 when filters change (except when explicitly changing page)
      page: newFilters.page || 1,
    }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({
      query: '',
      page: 1,
      limit: 10,
    });
  }, []);

  // Change page
  const setPage = useCallback(
    (page: number) => {
      updateFilters({ page });
    },
    [updateFilters]
  );

  return {
    filters,
    results,
    pagination,
    loading,
    error,
    updateFilters,
    resetFilters,
    setPage,
  };
}
