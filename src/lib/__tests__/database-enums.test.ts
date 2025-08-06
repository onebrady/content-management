import {
  ContentStatus,
  ContentType,
  Priority,
  ApprovalStatus,
  UserRole,
  ProjectVisibility,
  ProjectActivityAction,
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

  describe('ProjectVisibility', () => {
    it('should have the correct values', () => {
      expect(ProjectVisibility.PRIVATE).toBe('PRIVATE');
      expect(ProjectVisibility.TEAM).toBe('TEAM');
      expect(ProjectVisibility.PUBLIC).toBe('PUBLIC');
    });
  });

  describe('ProjectActivityAction', () => {
    it('should have the correct board action values', () => {
      expect(ProjectActivityAction.BOARD_CREATED).toBe('BOARD_CREATED');
      expect(ProjectActivityAction.BOARD_UPDATED).toBe('BOARD_UPDATED');
      expect(ProjectActivityAction.LIST_CREATED).toBe('LIST_CREATED');
      expect(ProjectActivityAction.LIST_UPDATED).toBe('LIST_UPDATED');
      expect(ProjectActivityAction.LIST_ARCHIVED).toBe('LIST_ARCHIVED');
    });

    it('should have the correct card action values', () => {
      expect(ProjectActivityAction.CARD_CREATED).toBe('CARD_CREATED');
      expect(ProjectActivityAction.CARD_UPDATED).toBe('CARD_UPDATED');
      expect(ProjectActivityAction.CARD_MOVED).toBe('CARD_MOVED');
      expect(ProjectActivityAction.CARD_ARCHIVED).toBe('CARD_ARCHIVED');
    });

    it('should have the correct collaboration action values', () => {
      expect(ProjectActivityAction.MEMBER_ADDED).toBe('MEMBER_ADDED');
      expect(ProjectActivityAction.MEMBER_REMOVED).toBe('MEMBER_REMOVED');
      expect(ProjectActivityAction.COMMENT_ADDED).toBe('COMMENT_ADDED');
      expect(ProjectActivityAction.ATTACHMENT_ADDED).toBe('ATTACHMENT_ADDED');
    });

    it('should have the correct checklist action values', () => {
      expect(ProjectActivityAction.CHECKLIST_CREATED).toBe('CHECKLIST_CREATED');
      expect(ProjectActivityAction.CHECKLIST_ITEM_COMPLETED).toBe('CHECKLIST_ITEM_COMPLETED');
    });
  });
});
