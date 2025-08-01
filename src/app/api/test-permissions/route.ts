import { NextResponse } from 'next/server';
import {
  createProtectedHandler,
  requirePermission,
  requireMinimumRole,
} from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { UserRole } from '@/types/database';

// Test route that requires content view permission
export const GET = createProtectedHandler(async (req) => {
  return NextResponse.json({
    message: 'You have permission to view content',
    user: req.user,
  });
}, requirePermission(PERMISSIONS.CONTENT_VIEW));

// Test route that requires content create permission
export const POST = createProtectedHandler(async (req) => {
  return NextResponse.json({
    message: 'You have permission to create content',
    user: req.user,
  });
}, requirePermission(PERMISSIONS.CONTENT_CREATE));

// Test route that requires moderator or higher role
export const PUT = createProtectedHandler(async (req) => {
  return NextResponse.json({
    message: 'You have moderator or higher permissions',
    user: req.user,
  });
}, requireMinimumRole(UserRole.MODERATOR));
