'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/database';

interface MinimumRoleGuardProps {
  children: ReactNode;
  minimumRole: UserRole;
  fallback?: ReactNode;
}

export function MinimumRoleGuard({
  children,
  minimumRole,
  fallback = null,
}: MinimumRoleGuardProps) {
  const { user } = useAuth();

  if (!user) {
    return fallback;
  }

  const roleHierarchy = {
    [UserRole.VIEWER]: 0,
    [UserRole.CONTRIBUTOR]: 1,
    [UserRole.MODERATOR]: 2,
    [UserRole.ADMIN]: 3,
  };

  const userLevel = roleHierarchy[user.role as UserRole] || 0;
  const requiredLevel = roleHierarchy[minimumRole] || 0;

  const hasAccess = userLevel >= requiredLevel;

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
