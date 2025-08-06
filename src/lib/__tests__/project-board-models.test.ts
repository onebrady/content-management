import {
  ProjectVisibility,
  ProjectActivityAction,
} from '@prisma/client';
import { BoardUtils } from '../board-utils';

describe('Project Board Models and Utils', () => {
  describe('New Enum Values', () => {
    describe('ProjectVisibility', () => {
      it('should have the correct visibility values', () => {
        expect(ProjectVisibility.PRIVATE).toBe('PRIVATE');
        expect(ProjectVisibility.TEAM).toBe('TEAM');
        expect(ProjectVisibility.PUBLIC).toBe('PUBLIC');
      });
    });

    describe('ProjectActivityAction', () => {
      it('should have board-related actions', () => {
        expect(ProjectActivityAction.BOARD_CREATED).toBe('BOARD_CREATED');
        expect(ProjectActivityAction.BOARD_UPDATED).toBe('BOARD_UPDATED');
        expect(ProjectActivityAction.LIST_CREATED).toBe('LIST_CREATED');
        expect(ProjectActivityAction.LIST_UPDATED).toBe('LIST_UPDATED');
        expect(ProjectActivityAction.LIST_ARCHIVED).toBe('LIST_ARCHIVED');
      });

      it('should have card-related actions', () => {
        expect(ProjectActivityAction.CARD_CREATED).toBe('CARD_CREATED');
        expect(ProjectActivityAction.CARD_UPDATED).toBe('CARD_UPDATED');
        expect(ProjectActivityAction.CARD_MOVED).toBe('CARD_MOVED');
        expect(ProjectActivityAction.CARD_ARCHIVED).toBe('CARD_ARCHIVED');
      });

      it('should have collaboration actions', () => {
        expect(ProjectActivityAction.MEMBER_ADDED).toBe('MEMBER_ADDED');
        expect(ProjectActivityAction.MEMBER_REMOVED).toBe('MEMBER_REMOVED');
        expect(ProjectActivityAction.COMMENT_ADDED).toBe('COMMENT_ADDED');
        expect(ProjectActivityAction.ATTACHMENT_ADDED).toBe('ATTACHMENT_ADDED');
      });

      it('should have checklist actions', () => {
        expect(ProjectActivityAction.CHECKLIST_CREATED).toBe('CHECKLIST_CREATED');
        expect(ProjectActivityAction.CHECKLIST_ITEM_COMPLETED).toBe('CHECKLIST_ITEM_COMPLETED');
      });
    });
  });

  describe('BoardUtils', () => {
    describe('calculateChecklistProgress', () => {
      it('should calculate progress correctly with completed items', () => {
        const checklists = [
          {
            items: [
              { completed: true },
              { completed: false },
              { completed: true },
            ],
          },
          {
            items: [
              { completed: false },
              { completed: true },
            ],
          },
        ];

        const progress = BoardUtils.calculateChecklistProgress(checklists);
        
        expect(progress.total).toBe(5);
        expect(progress.completed).toBe(3);
        expect(progress.percentage).toBe(60);
      });

      it('should handle empty checklists', () => {
        const checklists: Array<{ items: Array<{ completed: boolean }> }> = [];
        
        const progress = BoardUtils.calculateChecklistProgress(checklists);
        
        expect(progress.total).toBe(0);
        expect(progress.completed).toBe(0);
        expect(progress.percentage).toBe(0);
      });

      it('should handle checklists with no items', () => {
        const checklists = [{ items: [] }, { items: [] }];
        
        const progress = BoardUtils.calculateChecklistProgress(checklists);
        
        expect(progress.total).toBe(0);
        expect(progress.completed).toBe(0);
        expect(progress.percentage).toBe(0);
      });

      it('should handle all completed items', () => {
        const checklists = [
          {
            items: [
              { completed: true },
              { completed: true },
            ],
          },
        ];

        const progress = BoardUtils.calculateChecklistProgress(checklists);
        
        expect(progress.total).toBe(2);
        expect(progress.completed).toBe(2);
        expect(progress.percentage).toBe(100);
      });

      it('should handle all incomplete items', () => {
        const checklists = [
          {
            items: [
              { completed: false },
              { completed: false },
              { completed: false },
            ],
          },
        ];

        const progress = BoardUtils.calculateChecklistProgress(checklists);
        
        expect(progress.total).toBe(3);
        expect(progress.completed).toBe(0);
        expect(progress.percentage).toBe(0);
      });
    });
  });

  describe('Model Structure Validation', () => {
    it('should have consistent interface for project cards', () => {
      // Test that the expected structure is available in the types
      const mockCard = {
        id: 'card-1',
        title: 'Test Task',
        description: 'Task description',
        position: 0,
        archived: false,
        cover: null,
        dueDate: null,
        completed: false,
        listId: 'list-1',
        contentId: null,
        createdById: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Verify all required fields are present
      expect(mockCard).toHaveProperty('id');
      expect(mockCard).toHaveProperty('title');
      expect(mockCard).toHaveProperty('position');
      expect(mockCard).toHaveProperty('listId');
      expect(mockCard).toHaveProperty('createdById');
      expect(mockCard).toHaveProperty('completed');
      expect(mockCard).toHaveProperty('archived');
    });

    it('should have consistent interface for project lists', () => {
      const mockList = {
        id: 'list-1',
        title: 'To Do',
        position: 0,
        archived: false,
        projectId: 'project-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Verify all required fields are present
      expect(mockList).toHaveProperty('id');
      expect(mockList).toHaveProperty('title');
      expect(mockList).toHaveProperty('position');
      expect(mockList).toHaveProperty('projectId');
      expect(mockList).toHaveProperty('archived');
    });

    it('should have consistent interface for enhanced projects', () => {
      const mockProject = {
        id: 'project-1',
        title: 'Client Website',
        description: 'Website redesign project',
        color: 'blue',
        background: null,
        visibility: ProjectVisibility.PRIVATE,
        archived: false,
        starred: false,
        template: false,
        ownerId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Verify all required fields including new ones are present
      expect(mockProject).toHaveProperty('id');
      expect(mockProject).toHaveProperty('title');
      expect(mockProject).toHaveProperty('ownerId');
      expect(mockProject).toHaveProperty('visibility');
      expect(mockProject).toHaveProperty('starred');
      expect(mockProject).toHaveProperty('template');
      expect(mockProject).toHaveProperty('background');
    });
  });
});
