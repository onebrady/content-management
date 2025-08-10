import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type ProjectRole = 'VIEWER' | 'MEMBER' | 'ADMIN';

interface AuthResult {
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
  membership?: {
    id: string;
    role: string;
    projectId: string;
    userId: string;
  };
}

/**
 * Authentication middleware for project-based operations
 * Verifies user session and project membership with role-based access
 */
export async function withProjectAuth(
  req: NextRequest,
  projectId: string,
  requiredRole: ProjectRole = 'VIEWER'
): Promise<AuthResult> {
  // Global ADMINs have full access across all projects
  // and should bypass membership checks entirely
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role === 'ADMIN') {
      return {
        user: {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.name || undefined,
          role: session.user.role,
        },
      };
    }
  } catch {}
  // Test/E2E bypass: allow auth in non-production when E2E_TEST is set
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.E2E_TEST === 'true'
  ) {
    const fallbackUser = await prisma.user.findFirst({
      where: { email: { in: ['admin@example.com', 'test@example.com'] } },
      select: { id: true, email: true, name: true, role: true },
    });
    if (fallbackUser) {
      return {
        user: {
          id: fallbackUser.id,
          email: fallbackUser.email,
          name: fallbackUser.name ?? undefined,
          role: (fallbackUser as any).role ?? 'ADMIN',
        },
      };
    }
    // Fallback static user if DB not seeded
    return {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
      },
    };
  }

  // Get user session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized - No valid session');
  }

  // Get role hierarchy for permission checking
  const roleHierarchy = getRoleHierarchy(requiredRole);

  // Check project membership and role
  const membership = await prisma.projectMember.findFirst({
    where: {
      projectId,
      userId: session.user.id,
      role: { in: roleHierarchy },
    },
    include: {
      user: true,
      project: true,
    },
  });

  if (!membership) {
    // If no membership found, check if user is project owner
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: session.user.id,
      },
    });

    if (!project) {
      throw new Error('Forbidden - Insufficient permissions');
    }

    // Project owner has admin access
    return {
      user: {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.name || undefined,
        role: session.user.role || 'CONTRIBUTOR',
      },
    };
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.name || undefined,
      role: session.user.role || 'CONTRIBUTOR',
    },
    membership: {
      id: membership.id,
      role: membership.role,
      projectId: membership.projectId,
      userId: membership.userId,
    },
  };
}

/**
 * Simple authentication check for non-project-specific routes
 */
export async function withAuth(req: NextRequest): Promise<AuthResult> {
  // Test/E2E bypass: allow auth in non-production when E2E_TEST is set
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.E2E_TEST === 'true'
  ) {
    const fallbackUser = await prisma.user.findFirst({
      where: { email: { in: ['admin@example.com', 'test@example.com'] } },
      select: { id: true, email: true, name: true, role: true },
    });
    if (fallbackUser) {
      return {
        user: {
          id: fallbackUser.id,
          email: fallbackUser.email,
          name: fallbackUser.name ?? undefined,
          role: (fallbackUser as any).role ?? 'ADMIN',
        },
      };
    }
    return {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
      },
    };
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized - No valid session');
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.name || undefined,
      role: session.user.role || 'CONTRIBUTOR',
    },
  };
}

/**
 * Get role hierarchy for permission checking
 * Higher roles include permissions of lower roles
 */
function getRoleHierarchy(requiredRole: ProjectRole): string[] {
  const roleMap = {
    VIEWER: ['VIEWER', 'MEMBER', 'ADMIN'],
    MEMBER: ['MEMBER', 'ADMIN'],
    ADMIN: ['ADMIN'],
  };

  return roleMap[requiredRole] || [];
}

/**
 * Extract project ID from request URL or body
 */
export function extractProjectId(
  req: NextRequest,
  pathSegment: string = 'projects'
): string | null {
  const url = new URL(req.url);
  const pathSegments = url.pathname.split('/');
  const projectIndex = pathSegments.findIndex(
    (segment) => segment === pathSegment
  );

  if (projectIndex !== -1 && pathSegments[projectIndex + 1]) {
    return pathSegments[projectIndex + 1];
  }

  return null;
}

/**
 * Create authenticated API route wrapper
 */
export function createAuthenticatedRoute<T = any>(
  handler: (
    req: NextRequest,
    auth: AuthResult,
    ...args: any[]
  ) => Promise<NextResponse<T>>,
  requireProjectAuth: boolean = false
) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse<T>> => {
    try {
      let auth: AuthResult;

      if (requireProjectAuth) {
        const projectId = extractProjectId(req);
        if (!projectId) {
          return NextResponse.json(
            { error: 'Project ID is required' },
            { status: 400 }
          );
        }
        auth = await withProjectAuth(req, projectId);
      } else {
        auth = await withAuth(req);
      }

      return await handler(req, auth, ...args);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Authentication failed';

      if (message.includes('Unauthorized')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      if (message.includes('Forbidden')) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Rate limiting helper (basic implementation)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  const now = Date.now();
  const current = rateLimitMap.get(identifier);

  if (!current || now > current.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  return true;
}

/**
 * Apply rate limiting to API routes
 */
export function withRateLimit(
  req: NextRequest,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000
): boolean {
  const identifier = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
  return rateLimit(identifier, maxRequests, windowMs);
}
