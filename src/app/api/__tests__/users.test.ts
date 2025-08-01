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

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn(),
  },
}));

describe('Users API Route', () => {
  const mockPrisma = prisma as jest.Mocked<typeof prisma>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return users list', async () => {
    const mockUsers = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'ADMIN',
        department: 'IT',
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'CONTRIBUTOR',
        department: 'Marketing',
      },
    ];

    mockPrisma.user.findMany.mockResolvedValue(mockUsers);

    const req = new NextRequest('http://localhost:3000/api/users');
    (req as any).user = { id: '1', role: 'ADMIN' };

    await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(mockUsers);
  });

  it('should filter users by role when query parameter is provided', async () => {
    const mockUsers = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'ADMIN',
        department: 'IT',
      },
    ];

    mockPrisma.user.findMany.mockResolvedValue(mockUsers);

    const req = new NextRequest('http://localhost:3000/api/users?role=ADMIN');
    (req as any).user = { id: '1', role: 'ADMIN' };

    await GET(req);

    expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
      },
      orderBy: { name: 'asc' },
    });
  });

  it('should handle error and return 500 status', async () => {
    mockPrisma.user.findMany.mockRejectedValue(new Error('Test error'));

    const req = new NextRequest('http://localhost:3000/api/users');
    (req as any).user = { id: '1', role: 'ADMIN' };

    await GET(req);

    // Verify NextResponse.json was called with error message and status 500
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  });
});
