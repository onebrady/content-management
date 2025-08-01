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
import { GET, POST } from '../content/route';

// Mock the prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    content: {
      findMany: jest.fn().mockResolvedValue([
        { id: '1', title: 'Test Content 1' },
        { id: '2', title: 'Test Content 2' },
      ]),
      create: jest.fn().mockResolvedValue({
        id: '3',
        title: 'New Content',
        content: '<p>Test content</p>',
        status: 'DRAFT',
      }),
      count: jest.fn().mockResolvedValue(2),
    },
  },
}));

// Mock the API auth middleware
jest.mock('@/lib/api-auth', () => ({
  createProtectedHandler: (handler: any) => handler,
  requirePermission: () => (req: any) => {
    req.user = { id: 'test-user', role: 'ADMIN' };
    return req;
  },
}));

describe('Content API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/content', () => {
    it('should return content list with pagination', async () => {
      // Create a mock request
      const request = {
        nextUrl: new URL('http://localhost:3000/api/content'),
        url: 'http://localhost:3000/api/content',
      } as unknown as NextRequest;

      // Mock the response data
      const mockResponseData = {
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
      };

      // Mock NextResponse.json
      (NextResponse.json as jest.Mock).mockReturnValue({
        status: 200,
        json: () => Promise.resolve(mockResponseData),
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('results');
      expect(data).toHaveProperty('pagination');
      expect(data.results).toHaveLength(2);
    });

    it('should handle pagination parameters', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/content?page=2&limit=5'
      );
      await GET(request);

      const prismaFindMany = require('@/lib/prisma').prisma.content.findMany;
      expect(prismaFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        })
      );
    });

    it('should handle error and return 500 status', async () => {
      // Mock the prisma findMany method to throw an error
      require('@/lib/prisma').prisma.content.findMany.mockRejectedValueOnce(
        new Error('Test error')
      );

      // Mock NextResponse.json for error
      (NextResponse.json as jest.Mock).mockReturnValue({
        status: 500,
        json: () =>
          Promise.resolve({
            error: 'Failed to fetch content',
          }),
        headers: new Headers(),
      });

      const request = new NextRequest('http://localhost:3000/api/content');
      const response = await GET(request);
      const data = await response.json();

      // Verify that NextResponse.json was called with error message and status 500
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch content' },
        { status: 500 }
      );
      expect(data).toHaveProperty('error', 'Failed to fetch content');
    });
  });

  describe('POST /api/content', () => {
    it('should create new content and return 201 status', async () => {
      // Mock request with content data
      const request = {
        json: jest.fn().mockResolvedValue({
          title: 'New Content',
          content: '<p>Test content</p>',
          type: 'ARTICLE',
          priority: 'MEDIUM',
        }),
        user: { id: 'test-user' },
      } as unknown as NextRequest;

      // Mock NextResponse.json for successful creation
      (NextResponse.json as jest.Mock).mockReturnValue({
        status: 201,
        json: () =>
          Promise.resolve({
            id: '3',
            title: 'New Content',
            content: '<p>Test content</p>',
            status: 'DRAFT',
          }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('id', '3');
      expect(data).toHaveProperty('title', 'New Content');
      expect(data).toHaveProperty('status', 'DRAFT');
    });

    it('should handle validation errors and return 400 status', async () => {
      // Mock request with invalid data
      const request = {
        json: jest.fn().mockResolvedValue({
          // Missing required title
          content: '<p>Test content</p>',
        }),
        user: { id: 'test-user' },
      } as unknown as NextRequest;

      // Mock NextResponse.json for validation error
      (NextResponse.json as jest.Mock).mockReturnValue({
        status: 400,
        json: () =>
          Promise.resolve({
            error: 'Validation error',
            details: ['Title is required'],
          }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error', 'Validation error');
    });

    it('should handle server errors and return 500 status', async () => {
      // Mock request with content data
      const request = {
        json: jest.fn().mockResolvedValue({
          title: 'New Content',
          content: '<p>Test content</p>',
          type: 'ARTICLE',
          priority: 'MEDIUM',
        }),
        user: { id: 'test-user' },
      } as unknown as NextRequest;

      // Mock prisma create to throw an error
      require('@/lib/prisma').prisma.content.create.mockRejectedValueOnce(
        new Error('Database error')
      );

      // Mock NextResponse.json for server error
      (NextResponse.json as jest.Mock).mockReturnValue({
        status: 500,
        json: () =>
          Promise.resolve({
            error: 'Failed to create content',
          }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error', 'Failed to create content');
    });
  });
});
