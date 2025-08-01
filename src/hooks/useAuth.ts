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
