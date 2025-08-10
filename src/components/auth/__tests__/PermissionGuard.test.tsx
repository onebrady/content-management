import React from 'react';
import { render, screen } from '@/utils/test-utils';
import { PermissionGuard } from '../PermissionGuard';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/permissions';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock the hasPermission function
jest.mock('@/lib/permissions', () => ({
  hasPermission: jest.fn(),
  PERMISSIONS: {
    CONTENT_VIEW: 'content:view',
    CONTENT_CREATE: 'content:create',
  },
}));
const mockHasPermission = hasPermission as jest.MockedFunction<
  typeof hasPermission
>;

describe.skip('PermissionGuard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when user has permission', () => {
    // Mock the useAuth hook to return a user with ADMIN role
    mockUseAuth.mockReturnValue({
      user: {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        role: 'ADMIN',
      },
      status: 'authenticated',
      signOut: jest.fn(),
    } as any);

    // Mock hasPermission to return true
    mockHasPermission.mockReturnValue(true);

    render(
      <PermissionGuard permission="content:view">
        <div data-testid="protected-content">Protected Content</div>
      </PermissionGuard>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should not render children when user does not have permission', () => {
    // Mock the useAuth hook to return a user with VIEWER role
    mockUseAuth.mockReturnValue({
      user: {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        role: 'VIEWER',
      },
      status: 'authenticated',
      signOut: jest.fn(),
    } as any);

    // Mock hasPermission to return false
    mockHasPermission.mockReturnValue(false);

    render(
      <PermissionGuard permission="content:create">
        <div data-testid="protected-content">Protected Content</div>
      </PermissionGuard>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    // The component returns null as fallback by default, not an error message
  });

  it('should render custom fallback when provided', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        role: 'VIEWER',
      },
      status: 'authenticated',
      signOut: jest.fn(),
    } as any);

    mockHasPermission.mockReturnValue(false);

    render(
      <PermissionGuard
        permission="content:create"
        fallback={<div>Custom Fallback</div>}
      >
        <div>Protected Content</div>
      </PermissionGuard>
    );

    expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should return fallback when user is null', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      status: 'loading',
      signOut: jest.fn(),
    } as any);

    render(
      <PermissionGuard
        permission="content:view"
        fallback={<div>Loading Fallback</div>}
      >
        <div>Protected Content</div>
      </PermissionGuard>
    );

    expect(screen.getByText('Loading Fallback')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should show content when no permission is specified', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        role: 'VIEWER',
      },
      status: 'authenticated',
      signOut: jest.fn(),
    } as any);

    render(
      <PermissionGuard>
        <div>Protected Content</div>
      </PermissionGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
