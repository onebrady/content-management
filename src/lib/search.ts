import { ContentStatus, ContentType, Priority } from '@prisma/client';

export interface SearchFilters {
  query?: string;
  status?: ContentStatus[];
  types?: ContentType[];
  priorities?: Priority[];
  tags?: string[];
  author?: string;
  assignee?: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SearchResults<T> {
  results: T[];
  pagination: SearchPagination;
}

/**
 * Builds a query string from search filters
 */
export function buildSearchQueryString(filters: SearchFilters): string {
  const params = new URLSearchParams();

  if (filters.query) {
    params.append('q', filters.query);
  }

  if (filters.page && filters.page > 1) {
    params.append('page', filters.page.toString());
  }

  if (filters.limit && filters.limit !== 10) {
    params.append('limit', filters.limit.toString());
  }

  if (filters.status && filters.status.length > 0) {
    filters.status.forEach((status) => params.append('status', status));
  }

  if (filters.types && filters.types.length > 0) {
    filters.types.forEach((type) => params.append('type', type));
  }

  if (filters.priorities && filters.priorities.length > 0) {
    filters.priorities.forEach((priority) =>
      params.append('priority', priority)
    );
  }

  if (filters.tags && filters.tags.length > 0) {
    filters.tags.forEach((tag) => params.append('tag', tag));
  }

  if (filters.author) {
    params.append('author', filters.author);
  }

  if (filters.assignee) {
    params.append('assignee', filters.assignee);
  }

  if (filters.startDate) {
    const startDate =
      filters.startDate instanceof Date
        ? filters.startDate.toISOString()
        : filters.startDate;
    params.append('startDate', startDate);
  }

  if (filters.endDate) {
    const endDate =
      filters.endDate instanceof Date
        ? filters.endDate.toISOString()
        : filters.endDate;
    params.append('endDate', endDate);
  }

  if (filters.sortBy && filters.sortBy !== 'updatedAt') {
    params.append('sortBy', filters.sortBy);
  }

  if (filters.sortOrder && filters.sortOrder !== 'desc') {
    params.append('sortOrder', filters.sortOrder);
  }

  return params.toString();
}

/**
 * Performs a search request
 */
export async function searchContent(
  filters: SearchFilters
): Promise<SearchResults<any>> {
  const queryString = buildSearchQueryString(filters);
  const response = await fetch(`/api/search?${queryString}`);

  if (!response.ok) {
    throw new Error('Search failed');
  }

  return response.json();
}

/**
 * Gets all available tags for filtering
 */
export async function getAllTags(): Promise<{ id: string; name: string }[]> {
  const response = await fetch('/api/tags');

  if (!response.ok) {
    throw new Error('Failed to fetch tags');
  }

  return response.json();
}

/**
 * Gets all available users for filtering
 */
export async function getAllUsers(): Promise<
  { id: string; name: string; email: string; role: string }[]
> {
  const response = await fetch('/api/users');

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
}
