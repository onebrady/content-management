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
import { GET, POST } from '../tags/route';
import { prisma } from '@/lib/prisma';

// Mock the prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    tag: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('Tags API Routes', () => {
  const mockPrisma = prisma as jest.Mocked<typeof prisma>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tags', () => {
    it('should return tags list', async () => {
      const mockTags = [
        { id: '1', name: 'Technology' },
        { id: '2', name: 'Business' },
      ];

      mockPrisma.tag.findMany.mockResolvedValue(mockTags);

      const req = new NextRequest('http://localhost:3000/api/tags');

      await GET(req);

      expect(NextResponse.json).toHaveBeenCalledWith(mockTags);
    });

    it('should handle error and return 500 status', async () => {
      mockPrisma.tag.findMany.mockRejectedValue(new Error('Test error'));

      const req = new NextRequest('http://localhost:3000/api/tags');

      await GET(req);

      // Verify NextResponse.json was called with error message and status 500
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch tags' },
        { status: 500 }
      );
    });
  });

  describe('POST /api/tags', () => {
    it('should create new tag successfully', async () => {
      const mockTag = {
        id: '1',
        name: 'New Tag',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.tag.findFirst.mockResolvedValue(null);
      mockPrisma.tag.create.mockResolvedValue(mockTag);

      const requestData = {
        name: 'New Tag',
      };

      const req = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      await POST(req);

      expect(NextResponse.json).toHaveBeenCalledWith(mockTag, { status: 201 });
    });

    it('should return existing tag for duplicate name', async () => {
      const existingTag = {
        id: '1',
        name: 'Existing Tag',
      };

      mockPrisma.tag.findFirst.mockResolvedValue(existingTag);

      const requestData = {
        name: 'Existing Tag',
      };

      const req = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      await POST(req);

      expect(NextResponse.json).toHaveBeenCalledWith(existingTag);
    });

    it('should return 400 for missing name', async () => {
      const requestData = {
        // Missing name
      };

      const req = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      await POST(req);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    });

    it('should handle server errors', async () => {
      mockPrisma.tag.findFirst.mockRejectedValue(new Error('Test error'));

      const requestData = {
        name: 'New Tag',
      };

      const req = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      await POST(req);

      // Verify NextResponse.json was called with status 500
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to create tag' },
        { status: 500 }
      );
    });
  });
});
