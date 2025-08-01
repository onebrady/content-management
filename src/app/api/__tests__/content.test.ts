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
import { prisma } from '@/lib/prisma';
import { PERMISSIONS } from '@/lib/permissions';

// Mock the prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    content: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock the permissions
jest.mock('@/lib/permissions', () => ({
  PERMISSIONS: {
    CONTENT_VIEW: 'content:view',
    CONTENT_CREATE: 'content:create',
  },
  requirePermission: jest.fn((permission) => (handler: any) => handler),
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn(),
  },
}));

describe('Content API Routes', () => {
  const mockPrisma = prisma as jest.Mocked<typeof prisma>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/content', () => {
    it('should return content list with pagination', async () => {
      const mockContent = [
        {
          id: '1',
          title: 'Test Content',
          body: { type: 'doc', content: [] },
          type: 'ARTICLE',
          status: 'DRAFT',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.content.findMany.mockResolvedValue(mockContent);
      mockPrisma.content.count.mockResolvedValue(1);

      const req = new NextRequest('http://localhost:3000/api/content?page=1&limit=10');
      (req as any).user = { id: '1', role: 'ADMIN' };

      await GET(req);

      expect(NextResponse.json).toHaveBeenCalledWith({
        content: mockContent,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
        },
      });
    });

    it('should handle error and return 500 status', async () => {
      mockPrisma.content.findMany.mockRejectedValue(new Error('Test error'));

      const req = new NextRequest('http://localhost:3000/api/content');
      (req as any).user = { id: '1', role: 'ADMIN' };

      await GET(req);

      // Verify that NextResponse.json was called with error message and status 500
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch content' },
        { status: 500 }
      );
    });
  });

  describe('POST /api/content', () => {
    it('should create new content successfully', async () => {
      const mockContent = {
        id: '1',
        title: 'New Content',
        body: { type: 'doc', content: [] },
        type: 'ARTICLE',
        status: 'DRAFT',
        authorId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.content.create.mockResolvedValue(mockContent);

      const requestData = {
        title: 'New Content',
        body: JSON.stringify({ type: 'doc', content: [] }),
        type: 'ARTICLE',
        priority: 'MEDIUM',
      };

      const req = new NextRequest('http://localhost:3000/api/content', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      (req as any).user = { id: '1', role: 'ADMIN' };

      await POST(req);

      expect(NextResponse.json).toHaveBeenCalledWith(mockContent, { status: 201 });
    });

    it('should return 400 for missing required fields', async () => {
      const requestData = {
        title: 'New Content',
        // Missing body and type
      };

      const req = new NextRequest('http://localhost:3000/api/content', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      (req as any).user = { id: '1', role: 'ADMIN' };

      await POST(req);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Title, body, and type are required' },
        { status: 400 }
      );
    });

    it('should handle error and return 500 status', async () => {
      mockPrisma.content.create.mockRejectedValue(new Error('Test error'));

      const requestData = {
        title: 'New Content',
        body: JSON.stringify({ type: 'doc', content: [] }),
        type: 'ARTICLE',
      };

      const req = new NextRequest('http://localhost:3000/api/content', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      (req as any).user = { id: '1', role: 'ADMIN' };

      await POST(req);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to create content' },
        { status: 500 }
      );
    });
  });
});
