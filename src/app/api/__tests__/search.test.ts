// Mock the Next.js server components
jest.mock('next/server', () => {
  return {
    NextRequest: jest.fn().mockImplementation((url, options = {}) => ({
      url,
      nextUrl: new URL(url),
      headers: new Map(),
      json: jest
        .fn()
        .mockResolvedValue(options.body ? JSON.parse(options.body) : {}),
      method: options.method || 'GET',
      body: options.body,
    })),
    NextResponse: {
      json: jest.fn().mockImplementation((data, options) => ({
        status: options?.status || 200,
        json: () => Promise.resolve(data),
        headers: new Headers(),
      })),
    },
  };
});

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() =>
    Promise.resolve({
      user: {
        id: '1',
        email: 'test@example.com',
        role: 'ADMIN',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
  ),
}));

// Import after mocking
import { NextRequest, NextResponse } from 'next/server';
import { GET } from '../search/route';
import { prisma } from '@/lib/prisma';

// Mock the prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    content: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('Search API Routes', () => {
  const mockPrisma = prisma as jest.Mocked<typeof prisma>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/search', () => {
    it('should return search results', async () => {
      const mockResults = [
        {
          id: '1',
          title: 'Test Content',
          body: { content: [], type: 'doc' },
          type: 'ARTICLE',
          status: 'DRAFT',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.content.findMany.mockResolvedValue(mockResults);
      mockPrisma.content.count.mockResolvedValue(1);

      const req = new NextRequest(
        'http://localhost:3000/api/search?q=test&page=1&limit=10'
      );

      await GET(req);

      expect(NextResponse.json).toHaveBeenCalledWith({
        results: mockResults,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
    });

    it('should handle error and return 500 status', async () => {
      mockPrisma.content.findMany.mockRejectedValue(new Error('Test error'));

      const req = new NextRequest('http://localhost:3000/api/search?q=test');

      await GET(req);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to perform search' },
        { status: 500 }
      );
    });
  });
});
