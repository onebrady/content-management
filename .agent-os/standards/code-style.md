# Code Style Guide

<conditional-block context-check="general-formatting">
- Indent with 2 spaces (never tabs)
- Keep line length ≤100 chars
- Require semicolons
- Use trailing commas in multiline
- Braces always, even for one-liners
</conditional-block>

<conditional-block context-check="naming-conventions">
- Variables/methods: camelCase
- React components/classes: PascalCase
- Constants/enums: UPPER_SNAKE_CASE
- TypeScript types/interfaces: PascalCase (prefix interfaces with I)
- Database models: PascalCase (User, Post, Comment)
- Prisma schema: camelCase for fields, PascalCase for models
- Neon database: snake_case for table/column names
- CSS classes: kebab-case or use Mantine classes
</conditional-block>

<conditional-block context-check="string-formatting">
- Prefer single quotes for strings
- Use template literals for dynamic/multiline strings
- Use template literals for HTML/JSX with variables
</conditional-block>

<conditional-block context-check="documentation-standards">
- Document the "why" (not the "what")
- Update/delete comments with related code changes
- Use JSDoc for complex signatures/components
- Document Tiptap extensions and Mantine customizations thoroughly
- Comment any MUI-to-Mantine migration decisions
</conditional-block>

<conditional-block task-condition="react-nextjs" context-check="component-standards">
- Always use TypeScript for all files/components
- Always type component props/state with interfaces
- Prefer functional components/hooks over class components
- Organize hooks at top of component (useState, useEffect, custom hooks)
- One main export per file (single responsibility)
- Use Next.js App Router patterns (not Pages Router)
- Implement proper error boundaries for rich text editors
- Use proper React.memo() for performance-critical components
</conditional-block>

<conditional-block context-check="ui-styling-patterns">
- **TailwindCSS**: Group utilities by function (layout, color, typography, state)
- **Mantine**: Use theme system, follow Mantine conventions and naming patterns
- **Component Migration**: Replace MUI components with Mantine equivalents during updates
- **Consistency**: Prefer Mantine components over custom TailwindCSS components
- **Theme**: Use Mantine's built-in dark/light theme system
- **Responsive**: Use Mantine's responsive props and breakpoint system
</conditional-block>

<conditional-block context-check="state-management-patterns">
- **Zustand**: Keep stores small and focused, use immer for complex updates
- **TanStack Query**: Use proper query keys, implement optimistic updates
- **Forms**: Always use React Hook Form + Zod, validate on client and server
- **Mantine Forms**: Use @mantine/form when React Hook Form is overkill
</conditional-block>

<conditional-block context-check="database-api-patterns">
- **Neon**: Use connection pooling for serverless functions
- **Prisma**: Use proper relations and cascading deletes
- **API Routes**: Validate all input with Zod schemas
- **Auth**: Always check authentication in API routes using NextAuth
- **Connection**: Use DATABASE_URL for pooled connections, DATABASE_URL_UNPOOLED when needed
- **Migrations**: Always test locally before production
- Prefer async/await over Promise chains
- Never expose secrets in client code
</conditional-block>

<conditional-block context-check="content-management-patterns">
- **Tiptap**: Create reusable extensions, type all custom nodes
- **File Uploads**: Always validate file types and sizes with Zod
- **Rich Text**: Sanitize HTML output, implement proper serialization
- **Code Editor**: Properly configure syntax highlighting and themes
- **Mantine Integration**: Use Mantine components for editor toolbars and controls
</conditional-block>

<conditional-block context-check="package-manager-usage">
- **pnpm Commands**: Always use pnpm instead of npm or yarn in scripts and documentation
- **Scripts**: Reference pnpm run [script] in all documentation
- **Installation**: Use pnpm add/remove for dependency management
</conditional-block>