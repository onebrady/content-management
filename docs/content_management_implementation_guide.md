# Content Management Tool - Implementation Guide

## Project Overview
This guide provides step-by-step instructions for building a content management tool with Microsoft authentication, approval workflows, and content editing capabilities.

## Phase 1: Project Setup & Foundation (Week 1)

### 1.1 Initialize Next.js Project
```bash
# Create Next.js project with TypeScript
npx create-next-app@latest content-management-tool --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd content-management-tool

# Install core dependencies
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install next-auth@beta @auth/prisma-adapter
npm install prisma @prisma/client
npm install react-hook-form @hookform/resolvers zod
npm install zustand @tanstack/react-query
npm install date-fns clsx react-hot-toast
```

### 1.2 Configure TypeScript
```bash
# Ensure tsconfig.json is properly configured
# Add custom type definitions in types/global.d.ts
```

### 1.3 Setup ESLint and Prettier
```bash
npm install --save-dev prettier eslint-config-prettier
npm install --save-dev husky lint-staged

# Initialize Husky
npx husky init
```

### 1.4 Configure Material-UI Theme
Create `src/theme/index.ts` with custom MUI theme configuration including:
- Company branding colors
- Typography settings
- Component overrides
- Dark/light mode support

## Phase 2: Database Setup & Authentication (Week 2)

### 2.1 Database Schema Design
```bash
# Initialize Prisma
npx prisma init

# Configure DATABASE_URL in .env.local
```

**Core Database Schema:**
```prisma
// prisma/schema.prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  role          UserRole  @default(CONTRIBUTOR)
  department    String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Auth relations
  accounts      Account[]
  sessions      Session[]

  // Content relations
  createdContent    Content[] @relation("ContentAuthor")
  assignedContent   Content[] @relation("ContentAssignee")
  comments          Comment[]
  approvals         Approval[]
}

model Content {
  id          String        @id @default(cuid())
  title       String
  body        Json          // Rich text content
  status      ContentStatus @default(DRAFT)
  type        ContentType
  priority    Priority      @default(MEDIUM)
  dueDate     DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  // Relations
  authorId    String
  author      User          @relation("ContentAuthor", fields: [authorId], references: [id])
  assigneeId  String?
  assignee    User?         @relation("ContentAssignee", fields: [assigneeId], references: [id])

  comments    Comment[]
  approvals   Approval[]
  attachments Attachment[]
  tags        Tag[]
}

model Approval {
  id          String        @id @default(cuid())
  status      ApprovalStatus
  comments    String?
  createdAt   DateTime      @default(now())

  contentId   String
  content     Content       @relation(fields: [contentId], references: [id])
  userId      String
  user        User          @relation(fields: [userId], references: [id])

  @@unique([contentId, userId])
}

enum UserRole {
  VIEWER
  CONTRIBUTOR
  MODERATOR
  ADMIN
}

enum ContentStatus {
  DRAFT
  IN_REVIEW
  APPROVED
  REJECTED
  PUBLISHED
}

enum ContentType {
  ARTICLE
  BLOG_POST
  MARKETING_COPY
  DOCUMENTATION
  SOCIAL_MEDIA
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}
```

### 2.2 Setup NextAuth.js with Microsoft
```typescript
// src/lib/auth.ts
import NextAuth from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: "openid profile email User.Read"
        }
      }
    })
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && token?.sub) {
        session.user.id = token.sub
        // Add role information from database
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, department: true }
        })
        session.user.role = user?.role
        session.user.department = user?.department
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  }
})
```

## Phase 3: Core UI Components (Week 3)

### 3.1 Layout Components
Create reusable layout components:
```typescript
// src/components/layout/AppLayout.tsx
// - Header with user menu
// - Sidebar navigation
// - Main content area
// - Footer

// src/components/layout/DashboardLayout.tsx
// - Dashboard-specific layout
// - Statistics cards
// - Quick actions
```

### 3.2 Data Tables with MUI
```typescript
// src/components/content/ContentTable.tsx
// - DataGrid with filtering
// - Sorting capabilities
// - Bulk actions
// - Export functionality
```

### 3.3 Forms with React Hook Form
```typescript
// src/components/forms/ContentForm.tsx
// - Rich text editor integration
// - File upload handling
// - Form validation with Zod
// - Auto-save functionality
```

## Phase 4: Content Management Features (Week 4-5)

### 4.1 Rich Text Editor Integration
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image
```

```typescript
// src/components/editor/RichTextEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'

// Implement toolbar with formatting options
// Handle image uploads
// Support for mentions and links
```

### 4.2 File Upload System
```bash
npm install uploadthing
```

```typescript
// src/lib/uploadthing.ts
import { createUploadthing } from "uploadthing/next"
import { auth } from "@/lib/auth"

const f = createUploadthing()

export const ourFileRouter = {
  contentAttachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    pdf: { maxFileSize: "16MB", maxFileCount: 3 }
  })
    .middleware(async ({ req }) => {
      const session = await auth()
      if (!session?.user) throw new Error("Unauthorized")
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Store file reference in database
      await prisma.attachment.create({
        data: {
          filename: file.name,
          url: file.url,
          size: file.size,
          userId: metadata.userId
        }
      })
    })
}
```

### 4.3 Content CRUD Operations
```typescript
// src/app/api/content/route.ts
import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { contentSchema } from "@/lib/validations/content"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const validatedData = contentSchema.parse(body)

  const content = await prisma.content.create({
    data: {
      ...validatedData,
      authorId: session.user.id,
      status: "DRAFT"
    }
  })

  return Response.json(content)
}
```

## Phase 5: Approval Workflow System (Week 6-7)

### 5.1 Workflow State Management
```typescript
// src/lib/workflow.ts
export class ApprovalWorkflow {
  static async submitForReview(contentId: string, userId: string) {
    // Update content status
    // Create approval records
    // Send notifications
  }

  static async approveContent(contentId: string, userId: string, comments?: string) {
    // Update approval record
    // Check if all required approvals are complete
    // Move to next stage or mark as approved
    // Send notifications
  }

  static async rejectContent(contentId: string, userId: string, reason: string) {
    // Update approval record
    // Move content back to draft
    // Notify author
  }
}
```

### 5.2 Email Notification System
```bash
npm install resend react-email
```

```typescript
// src/lib/email.ts
import { Resend } from 'resend'
import { ApprovalNotificationEmail } from '@/emails/ApprovalNotification'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendApprovalNotification(
  to: string,
  contentTitle: string,
  contentId: string
) {
  await resend.emails.send({
    from: 'Content Team <notifications@yourcompany.com>',
    to,
    subject: `Content approval required: ${contentTitle}`,
    react: ApprovalNotificationEmail({
      contentTitle,
      approvalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/content/${contentId}/review`
    })
  })
}
```

### 5.3 Role-Based Access Control
```typescript
// src/lib/permissions.ts
export const PERMISSIONS = {
  CONTENT_CREATE: ['CONTRIBUTOR', 'MODERATOR', 'ADMIN'],
  CONTENT_EDIT_OWN: ['CONTRIBUTOR', 'MODERATOR', 'ADMIN'],
  CONTENT_EDIT_ALL: ['MODERATOR', 'ADMIN'],
  CONTENT_APPROVE: ['MODERATOR', 'ADMIN'],
  CONTENT_DELETE: ['ADMIN'],
  USER_MANAGE: ['ADMIN']
} as const

export function hasPermission(userRole: string, permission: keyof typeof PERMISSIONS) {
  return PERMISSIONS[permission].includes(userRole as any)
}

// src/components/ProtectedRoute.tsx
// Implement route protection based on user roles
```

## Phase 6: Dashboard & Analytics (Week 8)

### 6.1 Dashboard Components
```typescript
// src/app/dashboard/page.tsx
// - Content statistics cards
// - Recent activity feed
// - Pending approvals widget
// - Performance metrics charts
```

### 6.2 Content Analytics
```typescript
// src/components/analytics/ContentMetrics.tsx
// - Content creation trends
// - Approval time metrics
// - User activity charts
// - Export capabilities
```

## Phase 7: Advanced Features (Week 9-10)

### 7.1 Real-time Notifications (Optional)
```bash
npm install pusher-js pusher
```

```typescript
// src/lib/pusher.ts
// Setup Pusher for real-time notifications
// Implement presence channels for collaborative editing
```

### 7.2 Comment System
```typescript
// src/components/comments/CommentThread.tsx
// - Nested comment threads
// - Real-time updates
// - Mention functionality
// - Comment moderation
```

### 7.3 Version Control
```typescript
// Add content versioning to database schema
// Implement revision history
// Diff visualization
// Restore previous versions
```

## Phase 8: Testing & Quality Assurance (Week 11)

### 8.1 Unit Testing
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

### 8.2 Integration Testing
```bash
npm install --save-dev @playwright/test
```

### 8.3 API Testing
Test all API endpoints with different user roles and permissions

## Phase 9: Deployment & DevOps (Week 12)

### 9.1 Environment Configuration
```bash
# .env.example
DATABASE_URL=""
NEXTAUTH_URL=""
NEXTAUTH_SECRET=""
AZURE_AD_CLIENT_ID=""
AZURE_AD_CLIENT_SECRET=""
AZURE_AD_TENANT_ID=""
RESEND_API_KEY=""
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""
```


### 9.2 CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
# - Automated testing
# - Database migrations
# - Deployment to staging/production
```

### 9.3 Monitoring Setup
```typescript
// src/lib/monitoring.ts
// - Error tracking with Sentry
// - Performance monitoring
# - User analytics
# - Health checks
```

## Key Implementation Considerations

### Security
- Input validation and sanitization
- SQL injection prevention (Prisma handles this)
- XSS protection in rich text editor
- CSRF protection (NextAuth.js provides this)
- Rate limiting on API endpoints
- File upload security

### Performance
- Database query optimization
- Image optimization with Next.js
- Lazy loading of components
- Caching strategies
- Bundle size optimization

### User Experience
- Loading states and skeletons
- Error boundaries and error handling
- Progressive enhancement
- Mobile responsiveness
- Accessibility compliance

### Scalability
- Database indexing
- API pagination
- File storage optimization
- Horizontal scaling considerations
- Caching strategies

## Development Best Practices

1. **Code Organization**
   - Feature-based folder structure
   - Shared components and utilities
   - Type-safe API contracts
   - Consistent naming conventions

2. **Git Workflow**
   - Feature branch development
   - Pull request reviews
   - Automated testing on PR
   - Semantic versioning

3. **Documentation**
   - API documentation
   - Component documentation
   - Setup and deployment guides
   - User manuals

4. **Monitoring**
   - Application performance monitoring
   - Error tracking and alerting
   - User behavior analytics
   - Infrastructure monitoring

## Success Metrics

- **Development Metrics**
  - Code coverage > 80%
  - Build time < 5 minutes
  - Zero critical security vulnerabilities

- **Performance Metrics**
  - Page load time < 2 seconds
  - API response time < 500ms
  - 99.9% uptime

- **User Experience Metrics**
  - Task completion rate > 95%
  - User satisfaction score > 4.5/5
  - Feature adoption rate > 70%

This implementation guide provides a comprehensive roadmap for building a robust content management tool. Each phase builds upon the previous one, ensuring a solid foundation while adding increasingly sophisticated features.
