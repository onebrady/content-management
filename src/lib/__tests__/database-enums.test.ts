import {
  ContentStatus,
  ContentType,
  Priority,
  ApprovalStatus,
  UserRole,
} from '@prisma/client';

describe('Database Enums', () => {
  describe('ContentStatus', () => {
    it('should have the correct values', () => {
      expect(ContentStatus.DRAFT).toBe('DRAFT');
      expect(ContentStatus.IN_REVIEW).toBe('IN_REVIEW');
      expect(ContentStatus.APPROVED).toBe('APPROVED');
      expect(ContentStatus.REJECTED).toBe('REJECTED');
      expect(ContentStatus.PUBLISHED).toBe('PUBLISHED');
    });

    it('should not have PENDING value', () => {
      expect(ContentStatus).not.toHaveProperty('PENDING');
    });
  });

  describe('ContentType', () => {
    it('should have the correct values', () => {
      expect(ContentType.ARTICLE).toBe('ARTICLE');
      expect(ContentType.BLOG_POST).toBe('BLOG_POST');
      expect(ContentType.MARKETING_COPY).toBe('MARKETING_COPY');
      expect(ContentType.DOCUMENTATION).toBe('DOCUMENTATION');
      expect(ContentType.SOCIAL_MEDIA).toBe('SOCIAL_MEDIA');
    });
  });

  describe('Priority', () => {
    it('should have the correct values', () => {
      expect(Priority.LOW).toBe('LOW');
      expect(Priority.MEDIUM).toBe('MEDIUM');
      expect(Priority.HIGH).toBe('HIGH');
      expect(Priority.URGENT).toBe('URGENT');
    });
  });

  describe('ApprovalStatus', () => {
    it('should have the correct values', () => {
      expect(ApprovalStatus.PENDING).toBe('PENDING');
      expect(ApprovalStatus.APPROVED).toBe('APPROVED');
      expect(ApprovalStatus.REJECTED).toBe('REJECTED');
    });
  });

  describe('UserRole', () => {
    it('should have the correct values', () => {
      expect(UserRole.VIEWER).toBe('VIEWER');
      expect(UserRole.CONTRIBUTOR).toBe('CONTRIBUTOR');
      expect(UserRole.MODERATOR).toBe('MODERATOR');
      expect(UserRole.ADMIN).toBe('ADMIN');
    });
  });
});
