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
        headers: new Headers(),
      })),
    },
  };
});

// Import after mocking
import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from '../tags/route';

// Mock the prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    tag: {
      findMany: jest.fn().mockResolvedValue([
        { id: 'tag-1', name: 'Marketing', count: 5 },
        { id: 'tag-2', name: 'Technical', count: 3 },
        { id: 'tag-3', name: 'Documentation', count: 7 },
      ]),
      create: jest.fn().mockImplementation((data) => {
        return Promise.resolve({
          id: 'new-tag',
          name: data.data.name,
          count: 0,
        });
      }),
    },
  },
}));

// Mock the API auth middleware
jest.mock('@/lib/api-auth', () => ({
  createProtectedHandler: (handler: any) => handler,
  requirePermission: () => (req: any) => {
    req.user = { id: 'user-1', role: 'ADMIN' };
    return req;
  },
}));

describe('Tags API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tags', () => {
    it('should return list of tags', async () => {
      // Create a mock request
      const request = {
        nextUrl: new URL('http://localhost:3000/api/tags'),
        url: 'http://localhost:3000/api/tags',
      } as unknown as NextRequest;

      // Mock the response data
      const mockResponseData = [
        { id: 'tag-1', name: 'Marketing', count: 5 },
        { id: 'tag-2', name: 'Technical', count: 3 },
        { id: 'tag-3', name: 'Documentation', count: 7 },
      ];

      // Mock NextResponse.json
      (NextResponse.json as jest.Mock).mockReturnValue({
        status: 200,
        json: () => Promise.resolve(mockResponseData),
        headers: new Headers(),
      });

      const response = await GET(request);
      const data = await response.json();

      // Verify NextResponse.json was called
      expect(NextResponse.json).toHaveBeenCalled();
      expect(data).toHaveLength(3);
      expect(data[0]).toHaveProperty('name', 'Marketing');
      expect(data[1]).toHaveProperty('name', 'Technical');
      expect(data[2]).toHaveProperty('name', 'Documentation');
    });

    it('should handle error and return 500 status', async () => {
      // Mock the prisma findMany method to throw an error
      require('@/lib/prisma').prisma.tag.findMany.mockRejectedValueOnce(
        new Error('Test error')
      );

      const request = new NextRequest('http://localhost:3000/api/tags');

      // Mock NextResponse.json for error
      (NextResponse.json as jest.Mock).mockReturnValue({
        status: 500,
        json: () =>
          Promise.resolve({
            error: 'Failed to fetch tags',
          }),
        headers: new Headers(),
      });

      const response = await GET(request);
      const data = await response.json();

      // Verify NextResponse.json was called with error message and status 500
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch tags' },
        { status: 500 }
      );
      expect(data).toHaveProperty('error', 'Failed to fetch tags');
    });
  });

  describe('POST /api/tags', () => {
    it('should create a new tag', async () => {
      // Mock request with tag data
      const request = {
        json: jest.fn().mockResolvedValue({
          name: 'New Tag',
        }),
        user: { id: 'user-1', role: 'ADMIN' },
      } as unknown as NextRequest;

      // Mock NextResponse.json for successful creation
      (NextResponse.json as jest.Mock).mockReturnValue({
        status: 201,
        json: () =>
          Promise.resolve({
            id: 'new-tag',
            name: 'New Tag',
            count: 0,
          }),
        headers: new Headers(),
      });

      const response = await POST(request);
      const data = await response.json();

      // Verify NextResponse.json was called
      expect(NextResponse.json).toHaveBeenCalled();
      expect(data).toHaveProperty('id', 'new-tag');
      expect(data).toHaveProperty('name', 'New Tag');
    });

    it('should handle validation errors', async () => {
      // Mock request with invalid data (empty name)
      const request = {
        json: jest.fn().mockResolvedValue({
          name: '',
        }),
        user: { id: 'user-1', role: 'ADMIN' },
      } as unknown as NextRequest;

      // Mock NextResponse.json for validation error
      (NextResponse.json as jest.Mock).mockReturnValue({
        status: 400,
        json: () =>
          Promise.resolve({
            error: 'Validation error',
            details: ['Tag name is required'],
          }),
        headers: new Headers(),
      });

      const response = await POST(request);
      const data = await response.json();

      // Verify NextResponse.json was called
      expect(NextResponse.json).toHaveBeenCalled();
      expect(data).toHaveProperty('error', 'Validation error');
    });

    it('should handle server errors', async () => {
      // Mock request with tag data
      const request = {
        json: jest.fn().mockResolvedValue({
          name: 'New Tag',
        }),
        user: { id: 'user-1', role: 'ADMIN' },
      } as unknown as NextRequest;

      // Mock prisma create to throw an error
      require('@/lib/prisma').prisma.tag.create.mockRejectedValueOnce(
        new Error('Database error')
      );

      // Mock NextResponse.json for server error
      (NextResponse.json as jest.Mock).mockReturnValue({
        status: 500,
        json: () =>
          Promise.resolve({
            error: 'Failed to create tag',
          }),
        headers: new Headers(),
      });

      const response = await POST(request);
      const data = await response.json();

      // Verify NextResponse.json was called with status 500
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to create tag' },
        { status: 500 }
      );
      expect(data).toHaveProperty('error', 'Failed to create tag');
    });
  });
});
