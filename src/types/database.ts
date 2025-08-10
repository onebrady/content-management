export enum UserRole {
  VIEWER = 'VIEWER',
  CONTRIBUTOR = 'CONTRIBUTOR',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export enum ContentStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PUBLISHED = 'PUBLISHED',
}

export enum ContentType {
  ARTICLE = 'ARTICLE',
  BLOG_POST = 'BLOG_POST',
  MARKETING_COPY = 'MARKETING_COPY',
  DOCUMENTATION = 'DOCUMENTATION',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  department: string | null;
  createdAt: Date;
  updatedAt: Date;
  contentVersions?: ContentVersion[];
}

export interface Content {
  id: string;
  title: string;
  body: any; // Rich text JSON
  status: ContentStatus;
  type: ContentType;
  priority: Priority;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  version: number;
  authorId: string;
  assigneeId: string | null;
  author: User;
  assignee: User | null;
  comments: Comment[];
  approvals: Approval[];
  attachments: Attachment[];
  tags: Tag[];
  versions: ContentVersion[];
}

export interface Approval {
  id: string;
  status: ApprovalStatus;
  comments: string | null;
  createdAt: Date;
  contentId: string;
  userId: string;
  content: Content;
  user: User;
}

export interface Comment {
  id: string;
  commentText: string;
  createdAt: Date;
  updatedAt: Date;
  contentId: string;
  userId: string;
  content: Content;
  user: User;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  createdAt: Date;
  contentId: string;
  content: Content;
}

export interface Tag {
  id: string;
  name: string;
  createdAt: Date;
  contents: Content[];
}

export interface ContentVersion {
  id: string;
  versionNumber: number;
  title: string;
  body: any; // Rich text JSON
  status: ContentStatus;
  type: ContentType;
  priority: Priority;
  dueDate: Date | null;
  createdAt: Date;
  changeDescription: string | null;
  contentId: string;
  createdById: string;
  content: Content;
  createdBy: User;
}

/** @deprecated Use ProjectCard instead */
export interface Task /* @deprecated */ {
  id: string;
  title: string;
  description: string | null;
  position: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: Date | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  columnId: string;
  assigneeId: string | null;

  // Project management enhancements
  estimatedHours?: number | null;
  actualHours?: number | null;
  tags?: string[];

  // Attachments
  attachments?: TaskAttachment[];
}

/** @deprecated Use ProjectCardAttachment instead */
export interface TaskAttachment /* @deprecated */ {
  id: string;
  taskId: string;
  filename: string;
  url: string;
  size: number;
  type: string;
  createdAt: Date;
}

/** @deprecated Use ProjectList instead */
export interface Column /* @deprecated */ {
  id: string;
  title: string;
  position: number;
  color: string;
  projectId: string;
}

/** @deprecated Use ProjectList with cards instead */
export interface ColumnWithTasks /* @deprecated */ extends Column {
  tasks: Task[];
}

export interface ProjectMember {
  id: string;
  role: string;
  projectId: string;
  userId: string;
  user: User;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  color: string;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  owner: User;

  // New Trello-like fields
  background?: string | null;
  visibility?: 'PRIVATE' | 'TEAM' | 'PUBLIC';
  starred?: boolean;
  template?: boolean;

  // Relations (new schema)
  lists?: ProjectList[];
  labels?: ProjectLabel[];
  members: ProjectMember[];

  // Legacy relations (deprecated)
  /** @deprecated Use lists instead */
  columns?: ColumnWithTasks[];

  // Computed fields
  _count?: {
    lists?: number;
    cards?: number;
    /** @deprecated Use lists count instead */
    columns?: number;
  };
}

/** @deprecated Use Partial<ProjectCard> instead */
export interface TaskUpdatePayload /* @deprecated */ {
  taskId: string;
  projectId?: string;
  columnId?: string;
  position?: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: Date | null;
  completed?: boolean;
  title?: string;
  description?: string | null;
  assigneeId?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  tags?: string[];
}

// ============================================================================
// NEW TRELLO-LIKE PROJECT MANAGEMENT TYPES
// ============================================================================

export interface ProjectCard {
  id: string;
  title: string;
  description: string | null;
  position: number;
  archived: boolean;
  dueDate: Date | null;
  cover: string | null;
  createdAt: Date;
  updatedAt: Date;
  listId: string;
  createdById: string;

  // Relations
  list?: ProjectList;
  assignees?: ProjectCardAssignee[];
  labels?: ProjectCardLabel[];
  checklists?: ProjectChecklist[];
  attachments?: ProjectCardAttachment[];
  activities?: ProjectCardActivity[];
  content?: Content | null;
}

export interface ProjectList {
  id: string;
  title: string;
  position: number;
  archived: boolean;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;

  // Relations
  project?: Project;
  cards?: ProjectCard[];

  // Computed fields
  _count?: {
    cards?: number;
  };
}

export interface ProjectChecklist {
  id: string;
  title: string;
  position: number;
  cardId: string;

  // Relations
  card?: ProjectCard;
  items?: ProjectChecklistItem[];
}

export interface ProjectChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  position: number;
  checklistId: string;
  assigneeId: string | null;

  // Relations
  checklist?: ProjectChecklist;
  assignee?: User | null;
}

export interface ProjectCardAssignee {
  id: string;
  cardId: string;
  userId: string;

  // Relations
  card?: ProjectCard;
  user?: User;
}

export interface ProjectCardLabel {
  id: string;
  cardId: string;
  labelId: string;

  // Relations
  card?: ProjectCard;
  label?: ProjectLabel;
}

export interface ProjectLabel {
  id: string;
  name: string;
  color: string;
  projectId: string;

  // Relations
  project?: Project;
  cards?: ProjectCardLabel[];
}

export interface ProjectCardAttachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  type: string;
  cardId: string;
  uploadedById: string;
  createdAt: Date;

  // Relations
  card?: ProjectCard;
  uploadedBy?: User;
}

export interface ProjectCardActivity {
  id: string;
  type: string;
  data: any; // JSON data
  cardId: string;
  userId: string;
  createdAt: Date;

  // Relations
  card?: ProjectCard;
  user?: User;
}
