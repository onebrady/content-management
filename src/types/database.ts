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
