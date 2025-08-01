// Mock the Next.js server components
jest.mock('next/server', () => {
  return {
    NextRequest: jest.fn().mockImplementation((url, options = {}) => ({
      url,
      nextUrl: new URL(url),
      headers: new Map(),
      json: jest.fn().mockResolvedValue(options.body ? JSON.parse(options.body) : {}),
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
  getServerSession: jest.fn(() => Promise.resolve({
    user: {
      id: '1',
      email: 'test@example.com',
      role: 'ADMIN',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  })),
}));

// Import after mocking
import { NextRequest, NextResponse } from 'next/server';
import { GET } from '../users/route';
import { prisma } from '@/lib/prisma';

// Mock the prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
    },
  },
}));

describe('Users API Routes', () => {
  const mockPrisma = prisma as jest.Mocked<typeof prisma>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return users list', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          name: 'User 1',
          role: 'ADMIN',
          department: 'IT',
        },
        {
          id: '2',
          email: 'user2@example.com',
          name: 'User 2',
          role: 'CONTRIBUTOR',
          department: 'Marketing',
        },
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const req = new NextRequest('http://localhost:3000/api/users');

      await GET(req);

      expect(NextResponse.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should handle error and return 500 status', async () => {
      mockPrisma.user.findMany.mockRejectedValue(new Error('Test error'));

      const req = new NextRequest('http://localhost:3000/api/users');

      await GET(req);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    });
  });
});
