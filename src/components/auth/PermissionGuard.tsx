'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '@/lib/permissions';
import { UserRole } from '@/types/database';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
}: PermissionGuardProps) {
  const { user } = useAuth();

  if (!user) {
    console.log('PermissionGuard: No user found');
    return fallback;
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(user.role as UserRole, permission);
  } else if (permissions) {
    if (requireAll) {
      hasAccess = hasAllPermissions(user.role as UserRole, permissions);
    } else {
      hasAccess = hasAnyPermission(user.role as UserRole, permissions);
    }
  } else {
    // If no permission specified, show content
    hasAccess = true;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

interface RoleGuardProps {
  children: ReactNode;
  roles: UserRole[];
  fallback?: ReactNode;
}

export function RoleGuard({
  children,
  roles,
  fallback = null,
}: RoleGuardProps) {
  const { user } = useAuth();

  if (!user) {
    return fallback;
  }

  const hasAccess = roles.includes(user.role as UserRole);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

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
