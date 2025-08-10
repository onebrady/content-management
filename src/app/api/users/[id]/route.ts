import { NextRequest, NextResponse } from 'next/server';
import { createProtectedHandler, requirePermission } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

// GET /api/users/[id] - Get a specific user
export const GET = createProtectedHandler(async (req, context) => {
  try {
    const params =
      context?.params && typeof context.params.then === 'function'
        ? await context.params
        : context.params;
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.USER_VIEW));

// PUT /api/users/[id] - Update a user
export const PUT = createProtectedHandler(async (req, context) => {
  try {
    const params =
      context?.params && typeof context.params.then === 'function'
        ? await context.params
        : context.params;
    const { id } = params;
    let body: any = {};
    try {
      body = await req.json();
    } catch {}
    const { name, email, role, department } = body || {};

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build partial update; fall back to existing values when omitted
    const updateData: any = {
      ...(typeof name === 'string' && name.trim() ? { name } : {}),
      ...(typeof email === 'string' && email.trim() ? { email } : {}),
      ...(typeof role === 'string' && role.trim() ? { role } : {}),
      ...(department !== undefined ? { department: department || null } : {}),
    };

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided to update' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.USER_EDIT));

// DELETE /api/users/[id] - Delete a user
export const DELETE = createProtectedHandler(async (req, context) => {
  try {
    const params =
      context?.params && typeof context.params.then === 'function'
        ? await context.params
        : context.params;
    const { id } = params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deleting the last admin user
    if (existingUser.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last admin user' },
          { status: 400 }
        );
      }
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error);

    // Check for specific Prisma error for foreign key constraint violation
    if (error.code === 'P2003') {
      return NextResponse.json(
        {
          error:
            'This user cannot be deleted because they are still linked to other records (e.g., content they authored). Please reassign or delete their content before deleting the user.',
        },
        { status: 409 } // 409 Conflict
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.USER_DELETE));
