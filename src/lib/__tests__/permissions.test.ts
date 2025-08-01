import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  isRoleAtLeast,
  CONTENT_PERMISSIONS,
} from '../permissions';
import { UserRole } from '@prisma/client';

describe('Permissions Utilities', () => {
  describe('hasPermission', () => {
    it('should return true if the role has the permission', () => {
      expect(hasPermission(UserRole.ADMIN, PERMISSIONS.CONTENT_CREATE)).toBe(
        true
      );
      expect(hasPermission(UserRole.MODERATOR, PERMISSIONS.CONTENT_EDIT)).toBe(
        true
      );
      expect(
        hasPermission(UserRole.CONTRIBUTOR, PERMISSIONS.CONTENT_VIEW)
      ).toBe(true);
    });

    it('should return false if the role does not have the permission', () => {
      expect(hasPermission(UserRole.VIEWER, PERMISSIONS.CONTENT_CREATE)).toBe(
        false
      );
      expect(
        hasPermission(UserRole.CONTRIBUTOR, PERMISSIONS.CONTENT_DELETE)
      ).toBe(false);
      expect(
        hasPermission(UserRole.MODERATOR, PERMISSIONS.USER_ROLE_MANAGE)
      ).toBe(false);
    });
  });

  describe('isRoleAtLeast', () => {
    it('should return true if the role is at least the specified level', () => {
      expect(isRoleAtLeast(UserRole.ADMIN, UserRole.ADMIN)).toBe(true);
      expect(isRoleAtLeast(UserRole.ADMIN, UserRole.MODERATOR)).toBe(true);
      expect(isRoleAtLeast(UserRole.ADMIN, UserRole.CONTRIBUTOR)).toBe(true);
      expect(isRoleAtLeast(UserRole.ADMIN, UserRole.VIEWER)).toBe(true);

      expect(isRoleAtLeast(UserRole.MODERATOR, UserRole.MODERATOR)).toBe(true);
      expect(isRoleAtLeast(UserRole.MODERATOR, UserRole.CONTRIBUTOR)).toBe(
        true
      );
      expect(isRoleAtLeast(UserRole.MODERATOR, UserRole.VIEWER)).toBe(true);

      expect(isRoleAtLeast(UserRole.CONTRIBUTOR, UserRole.CONTRIBUTOR)).toBe(
        true
      );
      expect(isRoleAtLeast(UserRole.CONTRIBUTOR, UserRole.VIEWER)).toBe(true);

      expect(isRoleAtLeast(UserRole.VIEWER, UserRole.VIEWER)).toBe(true);
    });

    it('should return false if the role is below the specified level', () => {
      expect(isRoleAtLeast(UserRole.VIEWER, UserRole.CONTRIBUTOR)).toBe(false);
      expect(isRoleAtLeast(UserRole.VIEWER, UserRole.MODERATOR)).toBe(false);
      expect(isRoleAtLeast(UserRole.VIEWER, UserRole.ADMIN)).toBe(false);

      expect(isRoleAtLeast(UserRole.CONTRIBUTOR, UserRole.MODERATOR)).toBe(
        false
      );
      expect(isRoleAtLeast(UserRole.CONTRIBUTOR, UserRole.ADMIN)).toBe(false);

      expect(isRoleAtLeast(UserRole.MODERATOR, UserRole.ADMIN)).toBe(false);
    });
  });

  describe('CONTENT_PERMISSIONS', () => {
    it('should correctly determine if a role can view content', () => {
      expect(CONTENT_PERMISSIONS.canView(UserRole.VIEWER)).toBe(true);
      expect(CONTENT_PERMISSIONS.canView(UserRole.CONTRIBUTOR)).toBe(true);
      expect(CONTENT_PERMISSIONS.canView(UserRole.MODERATOR)).toBe(true);
      expect(CONTENT_PERMISSIONS.canView(UserRole.ADMIN)).toBe(true);
    });

    it('should correctly determine if a role can create content', () => {
      expect(CONTENT_PERMISSIONS.canCreate(UserRole.VIEWER)).toBe(false);
      expect(CONTENT_PERMISSIONS.canCreate(UserRole.CONTRIBUTOR)).toBe(true);
      expect(CONTENT_PERMISSIONS.canCreate(UserRole.MODERATOR)).toBe(true);
      expect(CONTENT_PERMISSIONS.canCreate(UserRole.ADMIN)).toBe(true);
    });

    it('should correctly determine if a role can edit content', () => {
      expect(CONTENT_PERMISSIONS.canEdit(UserRole.VIEWER)).toBe(false);
      expect(CONTENT_PERMISSIONS.canEdit(UserRole.CONTRIBUTOR)).toBe(true);
      expect(CONTENT_PERMISSIONS.canEdit(UserRole.MODERATOR)).toBe(true);
      expect(CONTENT_PERMISSIONS.canEdit(UserRole.ADMIN)).toBe(true);
    });

    it('should correctly determine if a role can delete content', () => {
      expect(CONTENT_PERMISSIONS.canDelete(UserRole.VIEWER)).toBe(false);
      expect(CONTENT_PERMISSIONS.canDelete(UserRole.CONTRIBUTOR)).toBe(false);
      expect(CONTENT_PERMISSIONS.canDelete(UserRole.MODERATOR)).toBe(true);
      expect(CONTENT_PERMISSIONS.canDelete(UserRole.ADMIN)).toBe(true);
    });

    it('should correctly determine if a role can publish content', () => {
      expect(CONTENT_PERMISSIONS.canPublish(UserRole.VIEWER)).toBe(false);
      expect(CONTENT_PERMISSIONS.canPublish(UserRole.CONTRIBUTOR)).toBe(false);
      expect(CONTENT_PERMISSIONS.canPublish(UserRole.MODERATOR)).toBe(false);
      expect(CONTENT_PERMISSIONS.canPublish(UserRole.ADMIN)).toBe(true);
    });

    it('should correctly determine if a role can comment on content', () => {
      expect(CONTENT_PERMISSIONS.canComment(UserRole.VIEWER)).toBe(true);
      expect(CONTENT_PERMISSIONS.canComment(UserRole.CONTRIBUTOR)).toBe(true);
      expect(CONTENT_PERMISSIONS.canComment(UserRole.MODERATOR)).toBe(true);
      expect(CONTENT_PERMISSIONS.canComment(UserRole.ADMIN)).toBe(true);
    });

    it('should correctly determine if a role can version content', () => {
      expect(CONTENT_PERMISSIONS.canVersion(UserRole.VIEWER)).toBe(false);
      expect(CONTENT_PERMISSIONS.canVersion(UserRole.CONTRIBUTOR)).toBe(true);
      expect(CONTENT_PERMISSIONS.canVersion(UserRole.MODERATOR)).toBe(true);
      expect(CONTENT_PERMISSIONS.canVersion(UserRole.ADMIN)).toBe(true);
    });

    it('should correctly determine if a role can restore content versions', () => {
      expect(CONTENT_PERMISSIONS.canRestoreVersion(UserRole.VIEWER)).toBe(
        false
      );
      expect(CONTENT_PERMISSIONS.canRestoreVersion(UserRole.CONTRIBUTOR)).toBe(
        false
      );
      expect(CONTENT_PERMISSIONS.canRestoreVersion(UserRole.MODERATOR)).toBe(
        true
      );
      expect(CONTENT_PERMISSIONS.canRestoreVersion(UserRole.ADMIN)).toBe(true);
    });
  });

  describe('ROLE_PERMISSIONS', () => {
    it('should define permissions for each role', () => {
      expect(ROLE_PERMISSIONS[UserRole.VIEWER].length).toBeGreaterThan(0);
      expect(ROLE_PERMISSIONS[UserRole.CONTRIBUTOR].length).toBeGreaterThan(0);
      expect(ROLE_PERMISSIONS[UserRole.MODERATOR].length).toBeGreaterThan(0);
      expect(ROLE_PERMISSIONS[UserRole.ADMIN].length).toBeGreaterThan(0);
    });

    it('should have increasing permissions with higher roles', () => {
      expect(ROLE_PERMISSIONS[UserRole.CONTRIBUTOR].length).toBeGreaterThan(
        ROLE_PERMISSIONS[UserRole.VIEWER].length
      );
      expect(ROLE_PERMISSIONS[UserRole.MODERATOR].length).toBeGreaterThan(
        ROLE_PERMISSIONS[UserRole.CONTRIBUTOR].length
      );
      expect(ROLE_PERMISSIONS[UserRole.ADMIN].length).toBeGreaterThan(
        ROLE_PERMISSIONS[UserRole.MODERATOR].length
      );
    });
  });
});
