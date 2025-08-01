import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { useSession, signIn, signOut } from 'next-auth/react';
import { UserRole } from '@/types/database';

// Mock next-auth
jest.mock('next-auth/react');

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return authenticated status and user when session exists', () => {
    const mockUser = {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.ADMIN,
      department: 'IT',
    };

    mockUseSession.mockReturnValue({
      data: { user: mockUser, expires: '2024-12-31' },
      status: 'authenticated',
      update: jest.fn(),
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
  });

  it('should return unauthenticated status and null user when no session', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('should return loading status when session is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn(),
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
  });

  it('should call signIn when login is called', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn('credentials', {
        email: 'test@example.com',
        password: 'password',
      });
    });

    expect(mockSignIn).toHaveBeenCalledWith('credentials', {
      email: 'test@example.com',
      password: 'password',
    });
  });

  it('should call signOut when logout is called', async () => {
    const mockUser = {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.ADMIN,
      department: 'IT',
    };

    mockUseSession.mockReturnValue({
      data: { user: mockUser, expires: '2024-12-31' },
      status: 'authenticated',
      update: jest.fn(),
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('should return correct role checks for admin user', () => {
    const mockUser = {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.ADMIN,
      department: 'IT',
    };

    mockUseSession.mockReturnValue({
      data: { user: mockUser, expires: '2024-12-31' },
      status: 'authenticated',
      update: jest.fn(),
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isModerator).toBe(true);
    expect(result.current.isContributor).toBe(true);
    expect(result.current.isViewer).toBe(true);
  });

  it('should return correct role checks for moderator user', () => {
    const mockUser = {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.MODERATOR,
      department: 'IT',
    };

    mockUseSession.mockReturnValue({
      data: { user: mockUser, expires: '2024-12-31' },
      status: 'authenticated',
      update: jest.fn(),
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isModerator).toBe(true);
    expect(result.current.isContributor).toBe(true);
    expect(result.current.isViewer).toBe(true);
  });

  it('should return correct role checks for contributor user', () => {
    const mockUser = {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.CONTRIBUTOR,
      department: 'IT',
    };

    mockUseSession.mockReturnValue({
      data: { user: mockUser, expires: '2024-12-31' },
      status: 'authenticated',
      update: jest.fn(),
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isModerator).toBe(false);
    expect(result.current.isContributor).toBe(true);
    expect(result.current.isViewer).toBe(true);
  });

  it('should return correct role checks for viewer user', () => {
    const mockUser = {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.VIEWER,
      department: 'IT',
    };

    mockUseSession.mockReturnValue({
      data: { user: mockUser, expires: '2024-12-31' },
      status: 'authenticated',
      update: jest.fn(),
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isModerator).toBe(false);
    expect(result.current.isContributor).toBe(false);
    expect(result.current.isViewer).toBe(true);
  });

  it('should return false for all role checks when not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isModerator).toBe(false);
    expect(result.current.isContributor).toBe(false);
    expect(result.current.isViewer).toBe(false);
  });

  it('should use hasRole method correctly', () => {
    const mockUser = {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.ADMIN,
      department: 'IT',
    };

    mockUseSession.mockReturnValue({
      data: { user: mockUser, expires: '2024-12-31' },
      status: 'authenticated',
      update: jest.fn(),
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.hasRole(UserRole.ADMIN)).toBe(true);
    expect(result.current.hasRole(UserRole.MODERATOR)).toBe(false);
    expect(result.current.hasRole(UserRole.CONTRIBUTOR)).toBe(false);
    expect(result.current.hasRole(UserRole.VIEWER)).toBe(false);
  });

  it('should use hasAnyRole method correctly', () => {
    const mockUser = {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.MODERATOR,
      department: 'IT',
    };

    mockUseSession.mockReturnValue({
      data: { user: mockUser, expires: '2024-12-31' },
      status: 'authenticated',
      update: jest.fn(),
    });

    const { result } = renderHook(() => useAuth());

    expect(
      result.current.hasAnyRole([UserRole.ADMIN, UserRole.MODERATOR])
    ).toBe(true);
    expect(
      result.current.hasAnyRole([UserRole.CONTRIBUTOR, UserRole.VIEWER])
    ).toBe(false);
  });
});
