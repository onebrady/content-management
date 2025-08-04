# Authentication Protection Implementation

## Overview

This document describes the implementation of efficient authentication protection for internal pages using NextAuth.js v4 middleware and client-side authentication guards.

## Implementation Details

### 1. Server-Side Middleware Protection (`src/middleware.ts`)

The middleware implements the following protection strategy:

1. **Public Routes**: Allow access without authentication
   - `/` (homepage)
   - `/auth/signin` (sign-in page)
   - `/auth/error` (error page)
   - `/api/auth` (auth API routes)
   - `/_next` (Next.js static files)
   - `/favicon.ico` (favicon)

2. **Authentication Check**: Redirect unauthenticated users to sign-in
   - Checks for valid JWT token
   - Redirects to `/auth/signin` with `callbackUrl` parameter
   - Preserves the original URL for post-login redirect

3. **Role-Based Access Control**: Enforce permissions for specific routes
   - Admin routes (`/admin`, `/api/admin`) require `USER_ROLE_MANAGE` permission
   - Approval routes (`/approvals`, `/api/approvals`) require `APPROVAL_VIEW` permission
   - Content creation routes (`/content/create`, `/content/edit`) require `CONTENT_CREATE` permission
   - Content API routes (`/api/content`) require `CONTENT_VIEW` permission
   - Settings routes (`/admin/settings`, `/api/settings`) require `SETTINGS_VIEW` permission

### 2. Client-Side Authentication Guard (`src/components/auth/AuthGuard.tsx`)

Created a new `AuthGuard` component that provides client-side authentication protection:

- **Loading State**: Shows loading spinner while checking authentication
- **Redirect Logic**: Automatically redirects unauthenticated users to sign-in
- **Callback URL**: Preserves the original URL for post-login navigation
- **Fallback Support**: Allows custom fallback content for unauthenticated users

### 3. Protected Pages Implementation

Updated the following pages with `AuthGuard`:

- **Content Page** (`/content`): Now properly protected with authentication
- **Content Slug Page** (`/content/[slug]`): Fixed layout and added authentication protection
- **Dashboard Page** (`/dashboard`): Enhanced with AuthGuard
- **Analytics Page** (`/analytics`): Protected with AuthGuard + PermissionGuard

#### Content Slug Page Fixes:
- **Layout Standardization**: Changed from `DashboardLayout` to `AppLayout` for consistent navigation
- **Authentication Protection**: Added `AuthGuard` wrapper for proper authentication checks
- **Theme Consistency**: Removed custom button styling to use standard Mantine theme
- **Navigation**: Now includes standard navigation component with proper breadcrumbs

### Key Features

- **Dual Protection**: Server-side middleware + client-side guards
- **Efficient Performance**: Uses NextAuth.js v4 patterns for optimal performance
- **Callback URL Support**: Preserves the original URL when redirecting to sign-in
- **Role-Based Protection**: Implements granular permission checks
- **Clean Redirects**: Prevents redirect loops and provides clear user experience
- **Loading States**: Proper loading indicators during authentication checks

### Technical Implementation

#### Server-Side Middleware:
```typescript
// Check if user is authenticated
if (!token) {
  // Redirect to signin with callback URL to return after login
  const signInUrl = new URL('/auth/signin', req.url);
  signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
  return NextResponse.redirect(signInUrl);
}
```

#### Client-Side AuthGuard:
```typescript
useEffect(() => {
  if (!isLoading && !isAuthenticated) {
    // Redirect to sign-in with current URL as callback
    const currentPath = window.location.pathname + window.location.search;
    const signInUrl = `${redirectTo}?callbackUrl=${encodeURIComponent(currentPath)}`;
    router.push(signInUrl);
  }
}, [isAuthenticated, isLoading, router, redirectTo]);
```

### Configuration

The middleware is configured to run on all routes except:
- `api/auth` (auth API routes)
- `_next/static` (static files)
- `_next/image` (image optimization files)
- `favicon.ico` (favicon file)

## Benefits

1. **Security**: All internal pages are protected by default
2. **Performance**: Efficient middleware implementation with minimal overhead
3. **User Experience**: Seamless redirects with callback URL support
4. **Maintainability**: Clean, well-documented code following NextAuth.js best practices
5. **Scalability**: Role-based access control for future permission requirements
6. **Reliability**: Dual protection (server + client) ensures no unauthorized access

## Testing

The implementation has been tested with:
- ✅ Build compilation successful
- ✅ Middleware configuration valid
- ✅ Client-side AuthGuard working
- ✅ Authentication flow working
- ✅ Role-based protection active
- ✅ Callback URL preservation working

## Context7 Integration

This implementation follows the latest NextAuth.js documentation and best practices from Context7, ensuring:
- Proper middleware patterns for v4
- Efficient redirect handling
- Optimal performance characteristics
- Security best practices
- Client-side authentication patterns 