# Content Management Tool - Project Overview

## Purpose
A secure, role-based content management tool with Microsoft Azure AD authentication, approval workflows, and modern UI. The project includes Trello-like project management functionality with drag-and-drop columns and cards.

## Tech Stack
- **Frontend**: Next.js 15, TypeScript, Mantine UI (migrating from Material-UI), TailwindCSS
- **Backend**: NextAuth.js v4, Prisma ORM, Neon PostgreSQL
- **File Storage**: UploadThing
- **Email**: Resend with React Email templates
- **Drag & Drop**: @hello-pangea/dnd for Trello-like functionality
- **State Management**: Zustand, TanStack Query
- **Rich Text**: Tiptap
- **Package Manager**: pnpm

## Key Features
- Role-based access control (VIEWER, CONTRIBUTOR, MODERATOR, ADMIN)
- Rich text content editing with Tiptap
- File upload and management
- Approval workflows with email notifications
- Project management with Kanban-style boards
- Drag and drop functionality for project cards

## Current Status
- Migrating from Material-UI to Mantine components
- Project management system needs refinement for smooth card dragging
- Using pnpm for package management