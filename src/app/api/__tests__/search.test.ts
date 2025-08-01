// Mock the Next.js server components
jest.mock('next/server', () => {
  return {
    NextRequest: jest.fn().mockImplementation((url) => ({
      url,
      nextUrl: new URL(url),
      headers: new Map(),
      json: jest.fn().mockResolvedValue({}),
    })),
    NextResponse: {
      json: jest.fn().mockImplementation((data, options) => ({
        status: options?.status || 200,
        json: () => Promise.resolve(data),
      })),
    },
  };
});

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

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn(),
  },
}));

describe('Search API Route', () => {
  const mockPrisma = prisma as jest.Mocked<typeof prisma>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return search results', async () => {
    const mockResults = [
      {
        id: '1',
        title: 'Test Content',
        body: { type: 'doc', content: [] },
        type: 'ARTICLE',
        status: 'PUBLISHED',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockPrisma.content.findMany.mockResolvedValue(mockResults);
    mockPrisma.content.count.mockResolvedValue(1);

    const req = new NextRequest(
      'http://localhost:3000/api/search?q=test&page=1&limit=10'
    );
    (req as any).user = { id: '1', role: 'ADMIN' };

    await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith({
      results: mockResults,
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
      },
    });
  });

  it('should handle search with filters', async () => {
    const mockResults = [
      {
        id: '1',
        title: 'Filtered Content',
        body: { type: 'doc', content: [] },
        type: 'ARTICLE',
        status: 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockPrisma.content.findMany.mockResolvedValue(mockResults);
    mockPrisma.content.count.mockResolvedValue(1);

    const req = new NextRequest(
      'http://localhost:3000/api/search?q=filtered&type=ARTICLE&status=DRAFT'
    );
    (req as any).user = { id: '1', role: 'ADMIN' };

    await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith({
      results: mockResults,
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
      },
    });
  });

  it('should handle empty search results', async () => {
    mockPrisma.content.findMany.mockResolvedValue([]);
    mockPrisma.content.count.mockResolvedValue(0);

    const req = new NextRequest(
      'http://localhost:3000/api/search?q=nonexistent'
    );
    (req as any).user = { id: '1', role: 'ADMIN' };

    await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith({
      results: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      },
    });
  });

  it('should handle error and return 500 status', async () => {
    mockPrisma.content.findMany.mockRejectedValue(new Error('Test error'));

    const req = new NextRequest('http://localhost:3000/api/search?q=test');
    (req as any).user = { id: '1', role: 'ADMIN' };

    await GET(req);

    // Verify that NextResponse.json was called with error message and status 500
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  });
});
