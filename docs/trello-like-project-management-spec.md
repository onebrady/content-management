# Trello-like Project Management System Specification

## Overview

Transform the current `/projects` feature into a comprehensive Trello-inspired project management system with enhanced boards, lists, cards, and collaboration features while maintaining the existing content management integration.

## 1. Project Requirements

### 1.1 Core Functionality

- **Visual Kanban Boards**: Full-screen board view with customizable lists and cards
- **Drag & Drop Interface**: Smooth card movement between lists with visual feedback
- **Real-time Collaboration**: Live updates when multiple users work on the same board
- **Advanced Card Management**: Rich card details with attachments, checklists, and comments
- **Board Templates**: Pre-configured board layouts for common workflows
- **Team Management**: Board-level permissions and member assignments

### 1.2 User Stories

- As a project manager, I want to create boards with custom lists to organize work visually
- As a team member, I want to drag cards between lists to update task status
- As a collaborator, I want to see real-time updates when others make changes
- As a content creator, I want to link content items to project cards for workflow tracking
- As an admin, I want to manage board permissions and member access

## 2. Technical Implementation Plan

### 2.1 Database Schema Updates

#### 2.1.1 Enhanced Project/Board Model

```prisma
model Project {
  id          String   @id @default(cuid())
  title       String
  description String?
  color       String   @default("blue")
  background  String?  // Board background (color/image)
  visibility  ProjectVisibility @default(PRIVATE)
  archived    Boolean  @default(false)
  starred     Boolean  @default(false) // For favoriting boards
  template    Boolean  @default(false) // Mark as template

  // Owner and team management
  ownerId     String
  owner       User     @relation("ProjectOwner", fields: [ownerId], references: [id])

  // Board structure
  lists       ProjectList[]
  members     ProjectMember[]
  invitations ProjectInvitation[]

  // Activity and metadata
  activities  ProjectActivity[]
  labels      ProjectLabel[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("projects")
}

model ProjectList {
  id        String   @id @default(cuid())
  title     String
  position  Int
  archived  Boolean  @default(false)

  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  cards     ProjectCard[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("project_lists")
}

model ProjectCard {
  id          String   @id @default(cuid())
  title       String
  description String?
  position    Int
  archived    Boolean  @default(false)

  // Visual and metadata
  cover       String?  // Cover image/color
  dueDate     DateTime?
  completed   Boolean  @default(false)

  // Relationships
  listId      String
  list        ProjectList @relation(fields: [listId], references: [id], onDelete: Cascade)

  assignees   ProjectCardAssignee[]
  labels      ProjectCardLabel[]
  checklists  ProjectChecklist[]
  attachments ProjectAttachment[]
  comments    ProjectComment[]
  activities  ProjectActivity[]

  // Content management integration
  contentId   String?
  content     Content? @relation(fields: [contentId], references: [id])

  createdById String
  createdBy   User     @relation("CardCreator", fields: [createdById], references: [id])

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("project_cards")
}

model ProjectChecklist {
  id      String @id @default(cuid())
  title   String
  position Int

  cardId  String
  card    ProjectCard @relation(fields: [cardId], references: [id], onDelete: Cascade)

  items   ProjectChecklistItem[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("project_checklists")
}

model ProjectChecklistItem {
  id        String  @id @default(cuid())
  text      String
  completed Boolean @default(false)
  position  Int

  checklistId String
  checklist   ProjectChecklist @relation(fields: [checklistId], references: [id], onDelete: Cascade)

  assigneeId String?
  assignee   User?   @relation("ChecklistItemAssignee", fields: [assigneeId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("project_checklist_items")
}

model ProjectLabel {
  id      String @id @default(cuid())
  name    String
  color   String

  projectId String
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  cardLabels ProjectCardLabel[]

  @@map("project_labels")
}

model ProjectCardLabel {
  cardId  String
  card    ProjectCard @relation(fields: [cardId], references: [id], onDelete: Cascade)

  labelId String
  label   ProjectLabel @relation(fields: [labelId], references: [id], onDelete: Cascade)

  @@id([cardId, labelId])
  @@map("project_card_labels")
}

model ProjectAttachment {
  id       String @id @default(cuid())
  name     String
  url      String
  size     Int
  mimeType String

  cardId   String
  card     ProjectCard @relation(fields: [cardId], references: [id], onDelete: Cascade)

  uploadedById String
  uploadedBy   User   @relation("AttachmentUploader", fields: [uploadedById], references: [id])

  createdAt DateTime @default(now())

  @@map("project_attachments")
}

model ProjectActivity {
  id      String @id @default(cuid())
  action  ProjectActivityAction
  data    Json   // Flexible data storage for activity details

  projectId String?
  project   Project? @relation(fields: [projectId], references: [id], onDelete: Cascade)

  cardId  String?
  card    ProjectCard? @relation(fields: [cardId], references: [id], onDelete: Cascade)

  userId  String
  user    User   @relation("ActivityUser", fields: [userId], references: [id])

  createdAt DateTime @default(now())

  @@map("project_activities")
}

enum ProjectVisibility {
  PRIVATE
  TEAM
  PUBLIC
}

enum ProjectActivityAction {
  BOARD_CREATED
  BOARD_UPDATED
  LIST_CREATED
  LIST_UPDATED
  LIST_ARCHIVED
  CARD_CREATED
  CARD_UPDATED
  CARD_MOVED
  CARD_ARCHIVED
  MEMBER_ADDED
  MEMBER_REMOVED
  COMMENT_ADDED
  ATTACHMENT_ADDED
  CHECKLIST_CREATED
  CHECKLIST_ITEM_COMPLETED
}
```

### 2.2 API Endpoints

#### 2.2.1 Board Management

```typescript
// /api/boards
GET / api / boards; // List user's boards
POST / api / boards; // Create new board
GET / api / boards / templates; // Get board templates

// /api/boards/[boardId]
GET / api / boards / [boardId]; // Get board details
PATCH / api / boards / [boardId]; // Update board
DELETE / api / boards / [boardId]; // Delete board
POST / api / boards / [boardId] / star; // Star/unstar board
POST / api / boards / [boardId] / archive; // Archive board

// /api/boards/[boardId]/members
GET / api / boards / [boardId] / members; // Get board members
POST / api / boards / [boardId] / members; // Add member
DELETE / api / boards / [boardId] / members / [userId]; // Remove member

// /api/boards/[boardId]/activities
GET / api / boards / [boardId] / activities; // Get board activity feed
```

#### 2.2.2 List Management

```typescript
// /api/boards/[boardId]/lists
GET / api / boards / [boardId] / lists; // Get board lists
POST / api / boards / [boardId] / lists; // Create new list
PATCH / api / boards / [boardId] / lists / reorder; // Reorder lists

// /api/lists/[listId]
PATCH / api / lists / [listId]; // Update list
DELETE / api / lists / [listId]; // Delete list
POST / api / lists / [listId] / archive; // Archive list
```

#### 2.2.3 Card Management

```typescript
// /api/lists/[listId]/cards
GET / api / lists / [listId] / cards; // Get list cards
POST / api / lists / [listId] / cards; // Create new card

// /api/cards/[cardId]
GET / api / cards / [cardId]; // Get card details
PATCH / api / cards / [cardId]; // Update card
DELETE / api / cards / [cardId]; // Delete card
POST / api / cards / [cardId] / move; // Move card between lists
POST / api / cards / [cardId] / archive; // Archive card

// /api/cards/[cardId]/checklists
GET / api / cards / [cardId] / checklists; // Get card checklists
POST / api / cards / [cardId] / checklists; // Create checklist

// /api/cards/[cardId]/attachments
GET / api / cards / [cardId] / attachments; // Get attachments
POST / api / cards / [cardId] / attachments; // Upload attachment

// /api/cards/[cardId]/comments
GET / api / cards / [cardId] / comments; // Get comments
POST / api / cards / [cardId] / comments; // Add comment
```

### 2.3 Component Architecture

#### 2.3.1 New Components Structure

```
src/features/boards/
├── components/
│   ├── board/
│   │   ├── BoardHeader.tsx           // Board title, members, menu
│   │   ├── BoardBackground.tsx       // Background selector
│   │   ├── BoardMemberList.tsx       // Member avatars and management
│   │   └── BoardVisibilitySelector.tsx
│   ├── lists/
│   │   ├── BoardList.tsx             // Individual list component
│   │   ├── ListHeader.tsx            // List title and actions
│   │   ├── ListCards.tsx             // Cards container with drag/drop
│   │   ├── AddListForm.tsx           // Add new list form
│   │   └── ListActionsMenu.tsx       // List context menu
│   ├── cards/
│   │   ├── BoardCard.tsx             // Card preview in list
│   │   ├── CardModal.tsx             // Full card details modal
│   │   ├── CardCover.tsx             // Card cover image/color
│   │   ├── CardLabels.tsx            // Card labels display
│   │   ├── CardMembers.tsx           // Assigned members
│   │   ├── CardDueDate.tsx           // Due date display
│   │   ├── CardChecklist.tsx         // Checklist component
│   │   ├── CardAttachments.tsx       // Attachments list
│   │   ├── CardComments.tsx          // Comments section
│   │   ├── CardActivity.tsx          // Activity feed
│   │   └── QuickCardAdd.tsx          // Quick add card form
│   ├── labels/
│   │   ├── LabelManager.tsx          // Board label management
│   │   ├── LabelSelector.tsx         // Label picker
│   │   └── LabelEditor.tsx           // Create/edit labels
│   └── templates/
│       ├── BoardTemplates.tsx        // Template gallery
│       ├── TemplatePreview.tsx       // Template preview
│       └── TemplateSelector.tsx      // Template picker
├── hooks/
│   ├── useBoardData.ts              // Board data management
│   ├── useListOperations.ts         // List CRUD operations
│   ├── useCardOperations.ts         // Card CRUD operations
│   ├── useBoardMembers.ts           // Member management
│   ├── useBoardActivity.ts          // Activity feed
│   ├── useRealTimeUpdates.ts        // WebSocket/SSE integration
│   └── useDragAndDrop.ts            // Enhanced drag/drop logic
├── stores/
│   ├── boardStore.ts                // Zustand store for board state
│   ├── cardStore.ts                 // Card state management
│   └── activityStore.ts             // Activity state
└── utils/
    ├── boardHelpers.ts              // Board utility functions
    ├── cardHelpers.ts               // Card utility functions
    └── activityHelpers.ts           // Activity formatting
```

#### 2.3.2 Enhanced UI Components

```typescript
// BoardCard.tsx - Enhanced card with Trello-like features
interface BoardCardProps {
  card: ProjectCard;
  isDragging: boolean;
  onQuickEdit: () => void;
  onOpenDetails: () => void;
}

// CardModal.tsx - Full card details with all Trello features
interface CardModalProps {
  card: ProjectCard;
  board: Project;
  opened: boolean;
  onClose: () => void;
}

// BoardList.tsx - Enhanced list with better UX
interface BoardListProps {
  list: ProjectList;
  board: Project;
  isAddingCard: boolean;
  onAddCard: () => void;
}
```

### 2.4 Enhanced Features

#### 2.4.1 Real-time Collaboration

- **WebSocket Integration**: Live updates for card movements, edits
- **Optimistic Updates**: Immediate UI feedback with rollback on error
- **Conflict Resolution**: Handle simultaneous edits gracefully
- **User Presence**: Show who's currently viewing/editing

#### 2.4.2 Advanced Search and Filtering

- **Global Search**: Search across all boards, lists, and cards
- **Filter by Members**: Show only cards assigned to specific users
- **Filter by Labels**: Multi-label filtering
- **Filter by Due Date**: Overdue, due soon, no due date
- **Saved Filters**: Save and reuse common filter combinations

#### 2.4.3 Board Templates

- **Kanban Template**: Standard To Do, Doing, Done
- **Bug Tracking**: Reported, In Progress, Testing, Closed
- **Content Pipeline**: Ideation, Writing, Review, Published
- **Sprint Planning**: Backlog, Sprint, In Progress, Done
- **Custom Templates**: Allow users to save boards as templates

#### 2.4.4 Power-ups and Integrations

- **Calendar View**: Show cards with due dates in calendar format
- **Time Tracking**: Built-in time tracking for cards
- **Content Integration**: Link cards to content items for workflow
- **Email Integration**: Create cards from emails
- **Automation**: Simple rules for moving cards based on conditions

## 3. User Experience Design

### 3.1 Board View Layout

```
┌─────────────────────────────────────────────────────────────┐
│ [Board Title]               [Members] [Filter] [Menu] [★]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ [+ Add]    │
│ │ To Do   │ │ Doing   │ │ Review  │ │ Done    │             │
│ │ ──────  │ │ ──────  │ │ ──────  │ │ ──────  │             │
│ │ [Card]  │ │ [Card]  │ │ [Card]  │ │ [Card]  │             │
│ │ [Card]  │ │ [Card]  │ │ [Card]  │ │ [Card]  │             │
│ │ [Card]  │ │         │ │         │ │ [Card]  │             │
│ │ + Add   │ │ + Add   │ │ + Add   │ │ + Add   │             │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Card Design

- **Compact View**: Title, labels, members, due date
- **Cover Images**: Optional cover image or color
- **Progress Indicators**: Checklist completion, comment count
- **Quick Actions**: Archive, move, copy on hover
- **Drag Handle**: Clear visual indication for dragging

### 3.3 Navigation Improvements

- **Sidebar Navigation**: Starred boards, recent boards, all boards
- **Board Switcher**: Quick keyboard shortcut (Ctrl+K) to switch boards
- **Breadcrumb Navigation**: Clear path back to board list
- **Mobile Responsive**: Touch-friendly interface for mobile devices

## 4. File Cleanup Strategy

### 4.1 Current File Audit

Analyze existing `/features/projects/` structure and identify:

- **Unused Components**: Components that are no longer referenced
- **Duplicate Logic**: Similar functionality that can be consolidated
- **Legacy Code**: Old implementations that can be removed
- **Dead Imports**: Unused import statements

### 4.2 Cleanup Actions

#### 4.2.1 Files to Remove

```bash
# Identify potentially unused files
src/features/projects/
├── components/
│   ├── ProjectBoardWrapper.tsx      # Replace with new BoardView
│   └── TaskCard.tsx                 # Replace with BoardCard
├── api/
│   └── projectApi.ts                # Consolidate into new API structure
└── legacy/                          # Move old files here temporarily
```

#### 4.2.2 Files to Refactor

```bash
# Files to update for new structure
src/features/projects/
├── hooks/
│   ├── useProjectData.ts            # Update for new board structure
│   └── queryKeys.ts                 # Add new query keys for boards
└── components/
    └── ProjectBoard.tsx             # Major refactor to BoardView
```

#### 4.2.3 Cleanup Script

```typescript
// scripts/cleanup-projects.js
const fs = require('fs');
const path = require('path');

// 1. Scan for unused imports
// 2. Remove commented code
// 3. Consolidate similar components
// 4. Update import paths
// 5. Generate cleanup report
```

### 4.3 Migration Strategy

1. **Phase 1**: Create new board components alongside existing ones
2. **Phase 2**: Update routing to use new components
3. **Phase 3**: Remove old components after testing
4. **Phase 4**: Clean up unused dependencies and imports

## 5. Testing Strategy

### 5.1 Component Testing

- **Board Interactions**: Test drag/drop, card creation, list management
- **Real-time Updates**: Test WebSocket connections and optimistic updates
- **Permission Handling**: Test board access controls
- **Mobile Responsiveness**: Test touch interactions

### 5.2 Integration Testing

- **API Endpoints**: Test all new board, list, and card endpoints
- **Database Operations**: Test complex queries and transactions
- **Performance**: Test with large boards (1000+ cards)
- **Concurrent Users**: Test multiple users on same board

### 5.3 E2E Testing

```typescript
// e2e/boards.spec.ts
test('Complete board workflow', async ({ page }) => {
  // Create board
  // Add lists
  // Create cards
  // Move cards between lists
  // Invite team members
  // Test real-time updates
});
```

## 6. Performance Optimizations

### 6.1 Frontend Optimizations

- **Virtual Scrolling**: For boards with many cards
- **Lazy Loading**: Load card details on demand
- **Memoization**: React.memo for card and list components
- **Debounced Updates**: Batch rapid card movements
- **Image Optimization**: Compress and resize card cover images

### 6.2 Backend Optimizations

- **Database Indexing**: Optimize queries for board data
- **Caching Strategy**: Redis cache for frequently accessed boards
- **Pagination**: Implement cursor-based pagination for large datasets
- **WebSocket Management**: Efficient room management for real-time updates

## 7. Security Considerations

### 7.1 Access Control

- **Board Permissions**: Owner, admin, member, viewer roles
- **Invitation System**: Secure board invitations with expiring tokens
- **Public Board Security**: Safe sharing for public boards
- **API Rate Limiting**: Prevent abuse of board operations

### 7.2 Data Validation

- **Input Sanitization**: Clean all user inputs
- **File Upload Security**: Validate attachments and prevent malicious files
- **SQL Injection Prevention**: Use parameterized queries
- **XSS Protection**: Sanitize rich text content in cards

## 8. Deployment Plan

### 8.1 Database Migration

```sql
-- Migration steps for new schema
-- 1. Create new tables
-- 2. Migrate existing project data
-- 3. Update foreign key relationships
-- 4. Clean up old columns
```

### 8.2 Feature Flags

- **Gradual Rollout**: Use feature flags to enable new board UI
- **A/B Testing**: Compare old vs new board experience
- **Emergency Rollback**: Quick disable of new features if needed

### 8.3 Monitoring

- **Performance Metrics**: Track board load times and interactions
- **Error Tracking**: Monitor drag/drop failures and API errors
- **User Analytics**: Track feature adoption and usage patterns

## 9. Success Metrics

### 9.1 User Engagement

- **Board Creation Rate**: Number of new boards created per week
- **Daily Active Users**: Users actively using board features
- **Card Interactions**: Moves, edits, comments per user session
- **Collaboration Metrics**: Multi-user board sessions

### 9.2 Performance Metrics

- **Page Load Time**: Board view loading under 2 seconds
- **Drag/Drop Responsiveness**: Under 100ms interaction feedback
- **Real-time Update Latency**: Under 500ms for live updates
- **Mobile Performance**: Smooth touch interactions on mobile devices

## 10. Future Enhancements

### 10.1 Advanced Features

- **Board Analytics**: Usage insights and productivity metrics
- **Advanced Automation**: Zapier-like workflow automation
- **Custom Fields**: User-defined fields for cards
- **Board Gantt View**: Timeline view for project planning
- **Resource Management**: Team capacity and workload planning

### 10.2 Third-party Integrations

- **GitHub Integration**: Link cards to issues and PRs
- **Slack Integration**: Board notifications in Slack
- **Google Calendar**: Sync due dates with calendar
- **Time Tracking Tools**: Integration with time tracking services

This specification provides a comprehensive roadmap for transforming the current project management system into a full-featured Trello-like experience while maintaining clean code organization and removing technical debt.
