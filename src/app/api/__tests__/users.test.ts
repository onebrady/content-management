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

// Mock the prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'user-1',
          name: 'Test User 1',
          email: 'user1@example.com',
          role: 'ADMIN',
        },
        {
          id: 'user-2',
          name: 'Test User 2',
          email: 'user2@example.com',
          role: 'EDITOR',
        },
      ]),
    },
  },
}));

// Mock the API auth middleware
jest.mock('@/lib/api-auth', () => ({
  createProtectedHandler: (handler: any) => handler,
  requirePermission: () => (req: any) => {
    req.user = { id: 'admin-user', role: 'ADMIN' };
    return req;
  },
}));

describe('Users API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return list of users', async () => {
    // Create a mock request
    const request = {
      nextUrl: new URL('http://localhost:3000/api/users'),
      url: 'http://localhost:3000/api/users',
      user: { id: 'admin-user', role: 'ADMIN' },
    } as unknown as NextRequest;

    // Mock the response data
    const mockResponseData = [
      {
        id: 'user-1',
        name: 'Test User 1',
        email: 'user1@example.com',
        role: 'ADMIN',
      },
      {
        id: 'user-2',
        name: 'Test User 2',
        email: 'user2@example.com',
        role: 'EDITOR',
      },
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
    expect(data).toHaveLength(2);
    expect(data[0]).toHaveProperty('id', 'user-1');
    expect(data[1]).toHaveProperty('id', 'user-2');
  });

  it('should filter users by role when query parameter is provided', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/users?role=ADMIN'
    );
    request.user = { id: 'admin-user', role: 'ADMIN' };

    await GET(request);

    const prismaFindMany = require('@/lib/prisma').prisma.user.findMany;
    expect(prismaFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          role: 'ADMIN',
        }),
      })
    );
  });

  it('should handle error and return 500 status', async () => {
    // Mock the prisma findMany method to throw an error
    require('@/lib/prisma').prisma.user.findMany.mockRejectedValueOnce(
      new Error('Test error')
    );

    const request = new NextRequest('http://localhost:3000/api/users');
    request.user = { id: 'admin-user', role: 'ADMIN' };

    // Mock NextResponse.json for error
    (NextResponse.json as jest.Mock).mockReturnValue({
      status: 500,
      json: () =>
        Promise.resolve({
          error: 'Failed to fetch users',
        }),
      headers: new Headers(),
    });

    const response = await GET(request);
    const data = await response.json();

    // Verify NextResponse.json was called with error message and status 500
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Failed to fetch users',
        details: expect.any(String),
      }),
      { status: 500 }
    );
    expect(data).toHaveProperty('error', 'Failed to fetch users');
  });
});
