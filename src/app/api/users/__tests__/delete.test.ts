import { DELETE } from '@/app/api/users/[id]/route';
import { prisma } from '@/lib/prisma';
import { PERMISSIONS } from '@/lib/permissions';
import { NextResponse } from 'next/server';
import { UserRole, ContentType, ContentStatus, Priority } from '@prisma/client';

// Mock the dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('@/lib/api-auth', () => ({
  createProtectedHandler: (handler: any) => handler,
  requirePermission: (permission: string) => (handler: any) => handler,
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      ...options,
      json: () => Promise.resolve(data),
      status: options?.status || 200,
    })),
  },
}));

describe('DELETE /api/users/[id]', () => {
  let req: any;
  let params: { id: string };

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: {
        id: 'admin-user-id',
        role: UserRole.ADMIN,
      },
    };
    params = { id: 'user-to-delete-id' };
  });

  it('should delete a user successfully', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: params.id,
      role: UserRole.CONTRIBUTOR,
    });
    (prisma.user.delete as jest.Mock).mockResolvedValue({});

    const response = await DELETE(req, { params });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.message).toBe('User deleted successfully');
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: params.id },
    });
  });

  it('should return 404 if user not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await DELETE(req, { params });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('User not found');
  });

  it('should return 400 if trying to delete the last admin', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: params.id,
      role: UserRole.ADMIN,
    });
    (prisma.user.count as jest.Mock).mockResolvedValue(1);

    const response = await DELETE(req, { params });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Cannot delete the last admin user');
  });

  it('should return 409 if user is linked to other records', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: params.id,
      role: UserRole.CONTRIBUTOR,
    });
    (prisma.user.delete as jest.Mock).mockRejectedValue({ code: 'P2003' });

    const response = await DELETE(req, { params });
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json.error).toContain('This user cannot be deleted');
  });

  it('should return 500 for other errors', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: params.id,
      role: UserRole.CONTRIBUTOR,
    });
    (prisma.user.delete as jest.Mock).mockRejectedValue(
      new Error('Some error')
    );

    const response = await DELETE(req, { params });
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Failed to delete user');
  });
});
