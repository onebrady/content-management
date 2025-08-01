import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { hasPermission } from '@/lib/permissions';
import { PERMISSIONS } from '@/lib/permissions';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/auth/signin', '/auth/error'];
    if (publicRoutes.includes(path)) {
      return NextResponse.next();
    }

    // Check if user is authenticated
    if (!token) {
      // Redirect to signin without adding callbackUrl to prevent redirect loops
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    // Role-based route protection using permissions
    const userRole = token.role as string;

    // Admin-only routes (require admin permissions)
    const adminRoutes = ['/admin', '/api/admin'];
    if (adminRoutes.some((route) => path.startsWith(route))) {
      if (!hasPermission(userRole, PERMISSIONS.USER_ROLE_MANAGE)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Approval routes (require approval permissions)
    const approvalRoutes = ['/approvals', '/api/approvals'];
    if (approvalRoutes.some((route) => path.startsWith(route))) {
      if (!hasPermission(userRole, PERMISSIONS.APPROVAL_VIEW)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Content creation routes (require content create permissions)
    const contentCreateRoutes = ['/content/create', '/content/edit'];
    if (contentCreateRoutes.some((route) => path.startsWith(route))) {
      if (!hasPermission(userRole, PERMISSIONS.CONTENT_CREATE)) {
        return NextResponse.redirect(new URL('/content', req.url));
      }
    }

    // Content management API routes (require content permissions)
    const contentApiRoutes = ['/api/content'];
    if (contentApiRoutes.some((route) => path.startsWith(route))) {
      if (!hasPermission(userRole, PERMISSIONS.CONTENT_VIEW)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Settings routes (require settings permissions)
    const settingsRoutes = ['/admin/settings', '/api/settings'];
    if (settingsRoutes.some((route) => path.startsWith(route))) {
      if (!hasPermission(userRole, PERMISSIONS.SETTINGS_VIEW)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};