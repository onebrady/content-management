# Technical Specification

## Architecture Overview

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js 15)  │◄──►│   (API Routes)  │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│   - Material-UI │    │   - NextAuth.js │    │   - Prisma ORM  │
│   - Tiptap      │    │   - UploadThing │    │   - Migrations  │
│   - Zustand     │    │   - Resend      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   External      │    │   File Storage  │    │   Email Service │
│   Services      │    │   (UploadThing) │    │   (Resend)      │
│                 │    │                 │    │                 │
│   - Azure AD    │    │   - Images      │    │   - Documents   │
│   - Vercel      │    │   - Templates   │    │   - Notifications│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **UI Library**: Material-UI v6 with custom theme
- **Styling**: TailwindCSS for layout
- **Rich Text**: Tiptap with extensions
- **State Management**: Zustand (global) + TanStack Query (server)
- **Forms**: React Hook Form + Zod validation

#### Backend

- **Runtime**: Node.js 18+
- **Framework**: Next.js API Routes
- **Authentication**: NextAuth.js v5 with Azure AD
- **Database**: PostgreSQL with Prisma ORM
- **File Upload**: UploadThing
- **Email**: Resend with React Email templates

#### Infrastructure

- **Hosting**: Vercel with CDN
- **Database**: Vercel Postgres (dev), AWS RDS (prod)
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics + Sentry

## Database Design

### Schema Overview

```sql
-- Core tables
users (id, email, name, role, department, created_at, updated_at)
content (id, title, body, status, type, priority, due_date, author_id, assignee_id, created_at, updated_at)
approvals (id, content_id, user_id, status, comments, created_at)
comments (id, content_id, user_id, content, created_at, updated_at)
attachments (id, content_id, filename, url, size, created_at)
tags (id, name, created_at)

-- Junction tables
content_tags (content_id, tag_id)

-- NextAuth.js tables
accounts (id, user_id, type, provider, provider_account_id, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state)
sessions (id, session_token, user_id, expires)
verification_tokens (identifier, token, expires)
```

### Prisma Schema

```prisma
// Enums
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

// Models
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

model Comment {
  id          String    @id @default(cuid())
  content     String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  contentId   String
  content     Content   @relation(fields: [contentId], references: [id])
  userId      String
  user        User      @relation(fields: [userId], references: [id])
}

model Attachment {
  id          String    @id @default(cuid())
  filename    String
  url         String
  size        Int
  createdAt   DateTime  @default(now())

  contentId   String
  content     Content   @relation(fields: [contentId], references: [id])
}

model Tag {
  id          String    @id @default(cuid())
  name        String    @unique
  createdAt   DateTime  @default(now())

  contents    Content[]
}

// NextAuth.js models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

## API Design

### Authentication Endpoints

```
POST /api/auth/signin
POST /api/auth/signout
GET  /api/auth/session
GET  /api/auth/csrf
```

### Content Management Endpoints

```
GET    /api/content              # List content with filters
POST   /api/content              # Create new content
GET    /api/content/[id]         # Get single content
PUT    /api/content/[id]         # Update content
DELETE /api/content/[id]         # Delete content
POST   /api/content/[id]/submit  # Submit for approval
```

### Approval Endpoints

```
GET    /api/approvals            # List approvals
POST   /api/approvals            # Create approval
PUT    /api/approvals/[id]       # Update approval status
GET    /api/approvals/pending    # Get pending approvals
```

### File Upload Endpoints

```
POST   /api/uploadthing          # Upload files
DELETE /api/uploadthing/[id]     # Delete files
```

### User Management Endpoints

```
GET    /api/users                # List users (admin only)
PUT    /api/users/[id]/role      # Update user role (admin only)
GET    /api/users/me             # Get current user
```

## Security Implementation

### Authentication Flow

1. **User clicks "Sign In"** → Redirected to Microsoft Azure AD
2. **Azure AD authenticates** → Returns authorization code
3. **NextAuth.js exchanges code** → Gets access token and user info
4. **User info stored** → Session created with JWT
5. **User redirected** → Back to application with session

### Authorization Matrix

```typescript
const PERMISSIONS = {
  CONTENT_VIEW: ["VIEWER", "CONTRIBUTOR", "MODERATOR", "ADMIN"],
  CONTENT_CREATE: ["CONTRIBUTOR", "MODERATOR", "ADMIN"],
  CONTENT_EDIT_OWN: ["CONTRIBUTOR", "MODERATOR", "ADMIN"],
  CONTENT_EDIT_ALL: ["MODERATOR", "ADMIN"],
  CONTENT_DELETE: ["ADMIN"],
  CONTENT_APPROVE: ["MODERATOR", "ADMIN"],
  USER_MANAGE: ["ADMIN"],
  SYSTEM_SETTINGS: ["ADMIN"],
} as const;
```

### Input Validation

```typescript
// Content creation schema
const contentSchema = z.object({
  title: z.string().min(1).max(255),
  body: z.any(), // Rich text JSON
  type: z.nativeEnum(ContentType),
  priority: z.nativeEnum(Priority).default("MEDIUM"),
  dueDate: z.date().optional(),
  assigneeId: z.string().optional(),
});
```

## Performance Considerations

### Database Optimization

- **Indexes**: Create indexes on frequently queried fields
- **Pagination**: Implement cursor-based pagination for large datasets
- **Query Optimization**: Use Prisma's query optimization features

### Frontend Optimization

- **Code Splitting**: Use Next.js dynamic imports
- **Image Optimization**: Use Next.js Image component
- **Caching**: Implement React Query caching strategies
- **Bundle Size**: Monitor and optimize bundle size

### API Optimization

- **Rate Limiting**: Implement rate limiting on API endpoints
- **Caching**: Use Redis for session storage (optional)
- **Compression**: Enable gzip compression
- **CDN**: Use Vercel's edge network

## Error Handling

### API Error Responses

```typescript
interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}
```

### Error Categories

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

## Monitoring & Logging

### Application Monitoring

- **Vercel Analytics**: Performance and usage metrics
- **Sentry**: Error tracking and performance monitoring
- **Custom Logging**: Structured logging for debugging

### Database Monitoring

- **Query Performance**: Monitor slow queries
- **Connection Pool**: Track database connections
- **Migration Tracking**: Version control for schema changes

## Deployment Strategy

### Environment Configuration

```bash
# Development
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret"

# Production
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="production-secret"
```

### CI/CD Pipeline

1. **GitHub Actions**: Automated testing and deployment
2. **Vercel**: Automatic deployments from main branch
3. **Database Migrations**: Automated schema updates
4. **Environment Variables**: Secure secret management

## Testing Strategy

### Unit Tests

- **Components**: React Testing Library for UI components
- **Utilities**: Jest for utility functions
- **API Routes**: Test API endpoints with mocked data

### Integration Tests

- **Database**: Test Prisma operations
- **Authentication**: Test NextAuth.js flows
- **File Upload**: Test UploadThing integration

### E2E Tests

- **Playwright**: Full user journey testing
- **Critical Paths**: Authentication, content creation, approval workflow
- **Cross-browser**: Test in multiple browsers

## Migration Strategy

### Database Migrations

1. **Development**: Use Prisma migrations for schema changes
2. **Staging**: Test migrations on staging environment
3. **Production**: Deploy migrations with zero downtime

### Feature Flags

- **Gradual Rollout**: Use feature flags for new features
- **A/B Testing**: Test new features with subset of users
- **Rollback Plan**: Quick rollback capability for issues
