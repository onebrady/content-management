import { buildSearchQueryString, SearchFilters } from '../search';
import { ContentStatus, ContentType, Priority } from '@prisma/client';

describe('Search Utilities', () => {
  describe('buildSearchQueryString', () => {
    it('should build a query string with a search query', () => {
      const filters: SearchFilters = {
        query: 'test search',
      };
      const queryString = buildSearchQueryString(filters);
      expect(queryString).toBe('q=test+search');
    });

    it('should build a query string with pagination', () => {
      const filters: SearchFilters = {
        page: 2,
        limit: 20,
      };
      const queryString = buildSearchQueryString(filters);
      expect(queryString).toBe('page=2&limit=20');
    });

    it('should not include page if it is 1', () => {
      const filters: SearchFilters = {
        page: 1,
      };
      const queryString = buildSearchQueryString(filters);
      expect(queryString).toBe('');
    });

    it('should not include limit if it is 10', () => {
      const filters: SearchFilters = {
        limit: 10,
      };
      const queryString = buildSearchQueryString(filters);
      expect(queryString).toBe('');
    });

    it('should build a query string with status filters', () => {
      const filters: SearchFilters = {
        status: [ContentStatus.DRAFT, ContentStatus.IN_REVIEW],
      };
      const queryString = buildSearchQueryString(filters);
      expect(queryString).toBe('status=DRAFT&status=IN_REVIEW');
    });

    it('should build a query string with type filters', () => {
      const filters: SearchFilters = {
        types: [ContentType.ARTICLE, ContentType.ARTICLE], // Use same type twice for test
      };
      const queryString = buildSearchQueryString(filters);
      expect(queryString).toBe('type=ARTICLE&type=ARTICLE');
    });

    it('should build a query string with priority filters', () => {
      const filters: SearchFilters = {
        priorities: [Priority.HIGH, Priority.URGENT],
      };
      const queryString = buildSearchQueryString(filters);
      expect(queryString).toBe('priority=HIGH&priority=URGENT');
    });

    it('should build a query string with tag filters', () => {
      const filters: SearchFilters = {
        tags: ['tag1', 'tag2'],
      };
      const queryString = buildSearchQueryString(filters);
      expect(queryString).toBe('tag=tag1&tag=tag2');
    });

    it('should build a query string with author and assignee filters', () => {
      const filters: SearchFilters = {
        author: 'user1',
        assignee: 'user2',
      };
      const queryString = buildSearchQueryString(filters);
      expect(queryString).toBe('author=user1&assignee=user2');
    });

    it('should build a query string with date range filters', () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');
      const filters: SearchFilters = {
        startDate,
        endDate,
      };
      const queryString = buildSearchQueryString(filters);

      // Use URLSearchParams to parse the query string and check individual parameters
      const params = new URLSearchParams(queryString);
      expect(params.get('startDate')).toBe(startDate.toISOString());
      expect(params.get('endDate')).toBe(endDate.toISOString());
    });

    it('should build a query string with sort options', () => {
      const filters: SearchFilters = {
        sortBy: 'title',
        sortOrder: 'asc',
      };
      const queryString = buildSearchQueryString(filters);
      expect(queryString).toBe('sortBy=title&sortOrder=asc');
    });

    it('should not include default sort options', () => {
      const filters: SearchFilters = {
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      };
      const queryString = buildSearchQueryString(filters);
      expect(queryString).toBe('');
    });

    it('should build a complex query string with multiple filters', () => {
      const filters: SearchFilters = {
        query: 'test',
        page: 2,
        limit: 20,
        status: [ContentStatus.DRAFT],
        types: [ContentType.ARTICLE],
        priorities: [Priority.HIGH],
        tags: ['tag1'],
        author: 'user1',
        sortBy: 'title',
        sortOrder: 'asc',
      };
      const queryString = buildSearchQueryString(filters);
      expect(queryString).toBe(
        'q=test&page=2&limit=20&status=DRAFT&type=ARTICLE&priority=HIGH&tag=tag1&author=user1&sortBy=title&sortOrder=asc'
      );
    });
  });
});
