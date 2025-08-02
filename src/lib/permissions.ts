import { UserRole } from '@/types/database';

// Permission constants
export const PERMISSIONS = {
  // Content permissions
  CONTENT_VIEW: 'content:view',
  CONTENT_CREATE: 'content:create',
  CONTENT_EDIT: 'content:edit',
  CONTENT_DELETE: 'content:delete',
  CONTENT_PUBLISH: 'content:publish',
  CONTENT_COMMENT: 'content:comment',
  CONTENT_VERSION: 'content:version',
  CONTENT_VERSION_RESTORE: 'content:version_restore',

  // Approval permissions
  APPROVAL_VIEW: 'approval:view',
  APPROVAL_CREATE: 'approval:create',
  APPROVAL_APPROVE: 'approval:approve',
  APPROVAL_REJECT: 'approval:reject',

  // User management permissions
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  USER_ROLE_MANAGE: 'user:role_manage',

  // System permissions
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
  ANALYTICS_VIEW: 'analytics:view',
} as const;

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.VIEWER]: [PERMISSIONS.CONTENT_VIEW, PERMISSIONS.CONTENT_COMMENT],
  [UserRole.CONTRIBUTOR]: [
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_COMMENT,
    PERMISSIONS.CONTENT_VERSION,
  ],
  [UserRole.MODERATOR]: [
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.CONTENT_COMMENT,
    PERMISSIONS.CONTENT_VERSION,
    PERMISSIONS.CONTENT_VERSION_RESTORE,
    PERMISSIONS.APPROVAL_VIEW,
    PERMISSIONS.APPROVAL_CREATE,
    PERMISSIONS.APPROVAL_APPROVE,
    PERMISSIONS.APPROVAL_REJECT,
    PERMISSIONS.USER_VIEW,
  ],
  [UserRole.ADMIN]: [
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.CONTENT_COMMENT,
    PERMISSIONS.CONTENT_VERSION,
    PERMISSIONS.CONTENT_VERSION_RESTORE,
    PERMISSIONS.APPROVAL_VIEW,
    PERMISSIONS.APPROVAL_CREATE,
    PERMISSIONS.APPROVAL_APPROVE,
    PERMISSIONS.APPROVAL_REJECT,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_ROLE_MANAGE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
};

// Permission checking utilities
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

export function hasAnyPermission(
  userRole: UserRole,
  permissions: string[]
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.some((permission) => rolePermissions.includes(permission));
}

export function hasAllPermissions(
  userRole: UserRole,
  permissions: string[]
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.every((permission) =>
    rolePermissions.includes(permission)
  );
}

// Role hierarchy utilities
export function isRoleAtLeast(
  userRole: UserRole,
  minimumRole: UserRole
): boolean {
  const roleHierarchy = {
    [UserRole.VIEWER]: 0,
    [UserRole.CONTRIBUTOR]: 1,
    [UserRole.MODERATOR]: 2,
    [UserRole.ADMIN]: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[minimumRole];
}

export function getRoleLevel(userRole: UserRole): number {
  const roleHierarchy = {
    [UserRole.VIEWER]: 0,
    [UserRole.CONTRIBUTOR]: 1,
    [UserRole.MODERATOR]: 2,
    [UserRole.ADMIN]: 3,
  };

  return roleHierarchy[userRole] || 0;
}

// Content-specific permissions
export const CONTENT_PERMISSIONS = {
  canView: (userRole: UserRole) =>
    hasPermission(userRole, PERMISSIONS.CONTENT_VIEW),
  canCreate: (userRole: UserRole) =>
    hasPermission(userRole, PERMISSIONS.CONTENT_CREATE),
  canEdit: (userRole: UserRole) =>
    hasPermission(userRole, PERMISSIONS.CONTENT_EDIT),
  canDelete: (userRole: UserRole) =>
    hasPermission(userRole, PERMISSIONS.CONTENT_DELETE),
  canPublish: (userRole: UserRole) =>
    hasPermission(userRole, PERMISSIONS.CONTENT_PUBLISH),
  canComment: (userRole: UserRole) =>
    hasPermission(userRole, PERMISSIONS.CONTENT_COMMENT),
  canVersion: (userRole: UserRole) =>
    hasPermission(userRole, PERMISSIONS.CONTENT_VERSION),
  canRestoreVersion: (userRole: UserRole) =>
    hasPermission(userRole, PERMISSIONS.CONTENT_VERSION_RESTORE),
};

// Approval-specific permissions
export const APPROVAL_PERMISSIONS = {
  canView: (userRole: UserRole) =>
    hasPermission(userRole, PERMISSIONS.APPROVAL_VIEW),
  canCreate: (userRole: UserRole) =>
    hasPermission(userRole, PERMISSIONS.APPROVAL_CREATE),
  canApprove: (userRole: UserRole) =>
    hasPermission(userRole, PERMISSIONS.APPROVAL_APPROVE),
  canReject: (userRole: UserRole) =>
    hasPermission(userRole, PERMISSIONS.APPROVAL_REJECT),
};

// User management permissions
export const USER_PERMISSIONS = {
  canView: (userRole: UserRole) =>
    hasPermission(userRole, PERMISSIONS.USER_VIEW),
  canCreate: (userRole: UserRole) =>
    hasPermission(userRole, PERMISSIONS.USER_CREATE),
  canEdit: (userRole: UserRole) =>
    hasPermission(userRole, PERMISSIONS.USER_EDIT),
  canDelete: (userRole: UserRole) =>
    hasPermission(userRole, PERMISSIONS.USER_DELETE),
  canManageRoles: (userRole: UserRole) =>
    hasPermission(userRole, PERMISSIONS.USER_ROLE_MANAGE),
};
