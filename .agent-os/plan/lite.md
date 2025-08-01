# Content Management Tool - Lite Plan

## Overview

Secure, role-based content management tool with Microsoft Azure AD authentication, approval workflows, and modern UI.

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Material-UI v6, TailwindCSS, Tiptap
- **Backend**: NextAuth.js v5, Prisma ORM, PostgreSQL, UploadThing, Resend
- **Deployment**: Vercel, GitHub Actions CI/CD

## Core Features

1. **Authentication**: Microsoft Azure AD via NextAuth.js
2. **Content Management**: Rich text editing with Tiptap
3. **Approval Workflows**: Multi-stage approval with email notifications
4. **Role-Based Access**: VIEWER, CONTRIBUTOR, MODERATOR, ADMIN
5. **File Uploads**: UploadThing for secure file handling

## Database Schema

```prisma
model User {
  id, email, name, role, department, createdAt, updatedAt
  accounts, sessions, createdContent, assignedContent, comments, approvals
}

model Content {
  id, title, body, status, type, priority, dueDate, createdAt, updatedAt
  authorId, assigneeId, comments, approvals, attachments, tags
}

model Approval {
  id, status, comments, createdAt, contentId, userId
}
```

## Development Phases

1. **Week 1**: Project setup, authentication, database schema
2. **Week 2**: Content CRUD, rich text editor, file uploads
3. **Week 3**: Approval workflows, email notifications, dashboard
4. **Week 4**: Advanced features (versioning, search, analytics)
5. **Week 5**: Testing, CI/CD, production deployment

## Key Tasks

- Initialize Next.js in current directory
- Set up Prisma with PostgreSQL
- Configure Microsoft Azure AD authentication
- Implement role-based access control
- Create content management with Tiptap editor
- Build approval workflow system
- Add file uploads with UploadThing
- Set up email notifications with Resend
- Deploy to Vercel with GitHub Actions

## Success Criteria

- Secure authentication with role-based access
- Content CRUD with rich text editing
- Approval workflows with email notifications
- File upload and attachment system
- Responsive Material-UI interface
- 80% test coverage
- Automated CI/CD pipeline
- Production deployment on Vercel
