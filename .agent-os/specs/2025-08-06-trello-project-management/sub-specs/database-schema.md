# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-08-06-trello-project-management/spec.md

## Schema Changes

### New Tables

**ProjectList** - Board columns/lists

```prisma
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

  @@index([projectId, position])
  @@map("project_lists")
}
```

**ProjectCard** - Enhanced task cards

```prisma
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

  @@index([listId, position])
  @@index([dueDate])
  @@index([createdById])
  @@map("project_cards")
}
```

**ProjectChecklist** - Card checklists

```prisma
model ProjectChecklist {
  id      String @id @default(cuid())
  title   String
  position Int

  cardId  String
  card    ProjectCard @relation(fields: [cardId], references: [id], onDelete: Cascade)

  items   ProjectChecklistItem[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([cardId])
  @@map("project_checklists")
}
```

**ProjectChecklistItem** - Individual checklist items

```prisma
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

  @@index([checklistId, position])
  @@map("project_checklist_items")
}
```

### Enhanced Existing Tables

**Project** - Add new fields for enhanced board functionality

```prisma
model Project {
  // Existing fields...

  // New fields
  background  String?  // Board background (color/image)
  visibility  ProjectVisibility @default(PRIVATE)
  starred     Boolean  @default(false) // For favoriting boards
  template    Boolean  @default(false) // Mark as template

  // New relationships
  lists       ProjectList[]
  labels      ProjectLabel[]
  activities  ProjectActivity[]
  invitations ProjectInvitation[]
}
```

**New Enums**

```prisma
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

## Migration Strategy

### Phase 1: Create New Tables

```sql
-- Create new enums
CREATE TYPE "ProjectVisibility" AS ENUM ('PRIVATE', 'TEAM', 'PUBLIC');
CREATE TYPE "ProjectActivityAction" AS ENUM ('BOARD_CREATED', 'BOARD_UPDATED', 'LIST_CREATED', 'LIST_UPDATED', 'LIST_ARCHIVED', 'CARD_CREATED', 'CARD_UPDATED', 'CARD_MOVED', 'CARD_ARCHIVED', 'MEMBER_ADDED', 'MEMBER_REMOVED', 'COMMENT_ADDED', 'ATTACHMENT_ADDED', 'CHECKLIST_CREATED', 'CHECKLIST_ITEM_COMPLETED');

-- Create project_lists table
CREATE TABLE "project_lists" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "archived" BOOLEAN NOT NULL DEFAULT false,
  "projectId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "project_lists_pkey" PRIMARY KEY ("id")
);

-- Create indexes for optimal query performance
CREATE INDEX "project_lists_projectId_position_idx" ON "project_lists"("projectId", "position");
```

### Phase 2: Migrate Existing Data

```sql
-- Migrate existing Task data to new ProjectCard structure
-- Create default "To Do", "In Progress", "Done" lists for existing projects
-- Move existing tasks to ProjectCard with appropriate list assignments
```

### Phase 3: Add Foreign Key Constraints

```sql
-- Add foreign key relationships after data migration
ALTER TABLE "project_lists" ADD CONSTRAINT "project_lists_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## Performance Considerations

### Indexing Strategy

- **Composite indexes** on (projectId, position) for efficient list/card ordering
- **Single indexes** on frequently queried fields (dueDate, createdById, listId)
- **Partial indexes** for non-archived items to improve query performance

### Query Optimization

- **Eager loading** of related data (lists with cards, cards with assignees) to minimize N+1 queries
- **Pagination** for large boards using cursor-based pagination on position field
- **Caching** of board data at application level using Redis for frequently accessed boards

### Data Integrity

- **Cascade deletes** ensure orphaned records are automatically cleaned up
- **Position management** maintains consistent ordering when items are moved or deleted
- **Audit trail** through ProjectActivity table tracks all changes for debugging and user transparency
