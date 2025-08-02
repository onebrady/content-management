import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '@/lib/permissions';
import { UserRole } from '@/types/database';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    department: string | null;
  };
}

export async function authenticateRequest(
  req: NextRequest
): Promise<AuthenticatedRequest> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const authenticatedReq = req as AuthenticatedRequest;
  authenticatedReq.user = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role as UserRole,
    department: session.user.department,
  };

  return authenticatedReq;
}

export function requirePermission(permission: string) {
  return async (req: NextRequest) => {
    console.log('requirePermission called with permission:', permission);
    const authenticatedReq = await authenticateRequest(req);
    console.log('Authenticated user:', authenticatedReq.user);

    const hasPerm = hasPermission(authenticatedReq.user!.role, permission);
    console.log('Permission check result:', { permission, userRole: authenticatedReq.user!.role, hasPermission: hasPerm });

    if (!hasPerm) {
      console.log('Insufficient permissions, returning 403');
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    console.log('Permission check passed');
    return authenticatedReq;
  };
}

export function requireAnyPermission(permissions: string[]) {
  return async (req: NextRequest) => {
    const authenticatedReq = await authenticateRequest(req);

    if (!hasAnyPermission(authenticatedReq.user!.role, permissions)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return authenticatedReq;
  };
}

export function requireAllPermissions(permissions: string[]) {
  return async (req: NextRequest) => {
    const authenticatedReq = await authenticateRequest(req);

    if (!hasAllPermissions(authenticatedReq.user!.role, permissions)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return authenticatedReq;
  };
}

export function requireMinimumRole(minimumRole: UserRole) {
  return async (req: NextRequest) => {
    const authenticatedReq = await authenticateRequest(req);

    const roleHierarchy = {
      [UserRole.VIEWER]: 0,
      [UserRole.CONTRIBUTOR]: 1,
      [UserRole.MODERATOR]: 2,
      [UserRole.ADMIN]: 3,
    };

    const userLevel = roleHierarchy[authenticatedReq.user!.role] || 0;
    const requiredLevel = roleHierarchy[minimumRole] || 0;

    if (userLevel < requiredLevel) {
      return NextResponse.json(
        { error: 'Insufficient role level' },
        { status: 403 }
      );
    }

    return authenticatedReq;
  };
}

export function createProtectedHandler(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  permissionCheck: (req: NextRequest) => Promise<AuthenticatedRequest>
) {
  return async (req: NextRequest) => {
    try {
      const authenticatedReq = await permissionCheck(req);
      return await handler(authenticatedReq);
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      console.error('API Error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
