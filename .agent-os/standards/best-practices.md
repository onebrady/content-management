# Development Best Practices

<conditional-block context-check="core-development-principles">
- Keep it simple—minimal complexity
- Prioritize clarity/readability over cleverness
- DRY: extract logic/components that are reused frequently
- Single responsibility per file/module
- Content-first: optimize for rich text editing and file handling workflows
- UI consistency: prefer Mantine components over custom solutions
</conditional-block>

<conditional-block context-check="project-structure-organization">
- Feature-based project grouping (by domain/vertical)
- Shared UI components in `/components` using Mantine patterns
- Business logic in `/lib` with proper TypeScript interfaces
- Database utilities in `/lib/db` with Prisma helpers
- Tiptap extensions in `/lib/tiptap/extensions`
- Mantine theme customizations in `/lib/theme`
- AgentOS specs in `.agent-os/specs/` with date-based folders
- Consistent naming everywhere following established conventions
</conditional-block>

<conditional-block context-check="dependency-management">
- Only add necessary, stable, actively maintained packages
- Prefer Mantine components over custom UI implementations
- Use @mantine/hooks for common functionality (useLocalStorage, useMediaQuery, etc.)
- Avoid mixing UI libraries - actively migrate away from MUI
- Remove unused dependencies during feature updates
- Use pnpm for all package management operations
</conditional-block>

<conditional-block context-check="code-quality-standards">
- All code is linted/formatted automatically (ESLint + Prettier)
- Peer reviews required on PRs with focus on Mantine migration
- All features/fixes covered by tests (Jest unit + Playwright E2E)
- Semantic commit messages (conventional commits)
- Run type checking before commits (pnpm type-check)
- Test Mantine component integrations thoroughly
- Validate all forms with Zod schemas
</conditional-block>

<conditional-block context-check="security-practices">
- Validate/sanitize all inputs (especially rich text content from Tiptap)
- Secrets/config in environment variables only
- Use NextAuth.js middleware for protected routes
- Sanitize HTML from Tiptap editor output to prevent XSS
- Validate file uploads (type, size, content) with UploadThing
- Use Neon's built-in connection security features
- Implement CSRF protection for forms
- Use bcrypt for password hashing
</conditional-block>

<conditional-block context-check="performance-optimization">
- Prefer App Router with Server Components where possible
- Use ISR (Incremental Static Regeneration) for content that doesn't change frequently
- Paginate large API/UI lists using Mantine pagination components
- Implement proper caching for rich text content and file uploads
- Optimize images with Next.js Image component
- Use TanStack Query for efficient data fetching and caching
- Leverage Neon's auto-scaling and connection pooling
- Use React.memo() for expensive component renders
</conditional-block>

<conditional-block context-check="accessibility-requirements">
- Implement responsive/mobile layouts using Mantine's responsive system
- Support skeleton/loading/error states with Mantine components (Skeleton, Alert, Notification)
- Use semantic HTML in rich text output from Tiptap
- Ensure Tiptap editor is keyboard accessible
- Test with screen readers regularly
- Leverage Mantine's built-in accessibility features
- Implement proper focus management in modals and forms
</conditional-block>

<conditional-block context-check="testing-strategy">
- Unit tests for utilities and business logic in `/lib`
- Component tests for React components (focus on Mantine integrations)
- E2E tests for critical user flows (content creation, editing, publishing)
- Test rich text editor functionality thoroughly (save, load, extensions)
- Test file upload workflows end-to-end
- Mock external services (email via Resend, file storage via UploadThing)
- Test database connections and Neon-specific features
- Test responsive behavior across different screen sizes
</conditional-block>

<conditional-block context-check="database-best-practices">
- Use Neon's connection pooling for optimal serverless performance
- Implement proper database seeding for development and testing
- Use Prisma transactions for multi-step operations
- Index frequently queried fields (userId, contentId, status, createdAt)
- Implement soft deletes for important content (deletedAt field)
- Use Neon's branching feature for preview deployments
- Monitor connection usage and query performance via Neon dashboard
- Always test migrations locally before applying to production
</conditional-block>

<conditional-block context-check="ui-migration-strategy">
- Replace MUI components with Mantine equivalents during feature updates
- Maintain design consistency during migration process
- Update component tests when migrating UI components
- Document migration decisions and component mappings in AgentOS specs
- Use Mantine's theming system for consistent styling
- Remove MUI dependencies once migration is complete
- Train team on Mantine patterns and best practices
</conditional-block>

<conditional-block context-check="agentos-workflow-integration">
- Use create-spec for all new features and major bug fixes
- Document UI component choices (Mantine vs custom) in specs
- Include database schema changes in feature specifications
- Plan file upload and rich text requirements in advance
- Execute tasks incrementally with proper testing
- Update documentation after feature completion
</conditional-block>

<conditional-block context-check="local-development-workflow">
- Always develop and test features locally first using Docker PostgreSQL
- Run all migrations locally before applying to Neon production
- Use pnpm scripts for all development tasks
- Maintain parity between local Docker setup and Neon configuration
- Test file uploads locally before deploying
- Verify rich text editor functionality across different content types
</conditional-block>

<conditional-block context-check="documentation-requirements">
- All components/APIs require JSDoc documentation
- Document Mantine component customizations and themes
- Document Tiptap extensions and custom nodes thoroughly
- README/setup docs must be current with pnpm workflow
- Document database schema relationships and constraints
- Document UI migration progress and decisions
- Maintain AgentOS spec documentation for all features
</conditional-block>