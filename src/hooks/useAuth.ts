import { useSession, signIn, signOut } from 'next-auth/react';
import { UserRole } from '@/types/database';

export interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string | null;
}

export interface ExtendedSession {
  user: ExtendedUser;
  expires: string;
}

export function useAuth() {
  // E2E bypass for client-side auth during Playwright runs
  if (
    typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_E2E_TEST === 'true'
  ) {
    const mockedUser: ExtendedUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'ADMIN' as unknown as UserRole,
      department: null,
    };
    return {
      session: {
        user: mockedUser,
        expires: new Date(Date.now() + 86400000).toISOString(),
      } as ExtendedSession,
      user: mockedUser,
      isAuthenticated: true,
      isLoading: false,
      signIn,
      signOut,
      hasRole: (role: UserRole) => role === mockedUser.role,
      hasAnyRole: (roles: UserRole[]) => roles.includes(mockedUser.role),
      isAdmin: true,
      isModerator: true,
      isContributor: true,
      isViewer: true,
    };
  }

  const { data: session, status } = useSession();

  const user = session?.user as ExtendedUser | undefined;

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';

  const hasRole = (role: UserRole) => {
    if (!user) return false;
    return user.role === role;
  };

  const hasAnyRole = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const isAdmin = hasRole(UserRole.ADMIN);
  const isModerator = hasAnyRole([UserRole.MODERATOR, UserRole.ADMIN]);
  const isContributor = hasAnyRole([
    UserRole.CONTRIBUTOR,
    UserRole.MODERATOR,
    UserRole.ADMIN,
  ]);
  const isViewer = hasAnyRole([
    UserRole.VIEWER,
    UserRole.CONTRIBUTOR,
    UserRole.MODERATOR,
    UserRole.ADMIN,
  ]);

  return {
    session: session as ExtendedSession | null,
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
    hasRole,
    hasAnyRole,
    isAdmin,
    isModerator,
    isContributor,
    isViewer,
  };
}
