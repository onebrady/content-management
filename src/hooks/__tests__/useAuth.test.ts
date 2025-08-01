import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { useSession, signIn, signOut } from 'next-auth/react';

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
    // Mock session data
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-user',
          name: 'Test User',
          email: 'test@example.com',
          role: 'ADMIN',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      status: 'authenticated',
      update: jest.fn(),
    } as any);

    const { result } = renderHook(() => useAuth());

    expect(result.current.status).toBe('authenticated');
    expect(result.current.user).toEqual({
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN',
    });
  });

  it('should return unauthenticated status and null user when no session', () => {
    // Mock no session
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    } as any);

    const { result } = renderHook(() => useAuth());

    expect(result.current.status).toBe('unauthenticated');
    expect(result.current.user).toBeNull();
  });

  it('should return loading status when session is loading', () => {
    // Mock loading session
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn(),
    } as any);

    const { result } = renderHook(() => useAuth());

    expect(result.current.status).toBe('loading');
    expect(result.current.user).toBeNull();
  });

  it('should call signIn when login is called', async () => {
    // Mock successful sign in
    mockSignIn.mockResolvedValue({ ok: true, error: null } as any);

    // Mock session data
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    } as any);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(mockSignIn).toHaveBeenCalledWith('credentials', {
      redirect: false,
      email: 'test@example.com',
      password: 'password',
    });
  });

  it('should call signOut when logout is called', async () => {
    // Mock session data
    mockUseSession.mockReturnValue({
      data: {
        user: { id: 'test-user' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      status: 'authenticated',
      update: jest.fn(),
    } as any);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('should return error when login fails', async () => {
    // Mock failed sign in
    mockSignIn.mockResolvedValue({
      ok: false,
      error: 'Invalid credentials',
    } as any);

    // Mock session data
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    } as any);

    const { result } = renderHook(() => useAuth());

    let error;
    await act(async () => {
      error = await result.current.login('test@example.com', 'wrong-password');
    });

    expect(error).toBe('Invalid credentials');
    expect(mockSignIn).toHaveBeenCalledWith('credentials', {
      redirect: false,
      email: 'test@example.com',
      password: 'wrong-password',
    });
  });
});
