# Global Tech Stack Defaults

- **App Framework:** Next.js 15+ (TypeScript enabled, App Router)
- **Language:** TypeScript (strict mode)
- **Node Version:** 22 LTS
- **Package Manager:** pnpm (migrating from npm)
- **Frontend Framework:** React 18.2+
- **CSS Framework:** TailwindCSS 3.4+ (via PostCSS)
- **UI Components:** 
  - **Primary:** Mantine v8+ (@mantine/core, @mantine/hooks)
  - **Icons:** @tabler/icons-react (Mantine-compatible)
  - **Legacy (removing):** MUI components being phased out
- **Rich Text Editor:** Tiptap v2+ (@tiptap/react, @tiptap/starter-kit, extensions)
- **Code Editor:** React Ace Editor (ace-builds, react-ace)
- **State Management:** 
  - **Global State:** Zustand v4+
  - **Server State:** TanStack Query v5+ (@tanstack/react-query)
- **Forms:** React Hook Form v7+ + Zod v3+ (@hookform/resolvers)
- **Primary Database:** Neon PostgreSQL (serverless, auto-scaling)
- **ORM:** Prisma v5+ (@prisma/client, prisma)
- **Database Hosting:** Neon Tech (production), Docker PostgreSQL (local dev)
- **File Uploads:** UploadThing (@uploadthing/react, uploadthing)
- **Hosting/Deployment:** Vercel (built-in analytics/CDN)
- **Email/Notification:** 
  - **Email Service:** Resend + React Email (@react-email/components)
  - **UI Notifications:** React Hot Toast (react-hot-toast)
- **Auth:** NextAuth.js v4+ (next-auth) + Prisma Adapter (@auth/prisma-adapter)
- **Testing:** 
  - **Unit/Integration:** Jest v30+ + Testing Library (@testing-library/react)
  - **E2E:** Playwright v1.54+ (@playwright/test)
- **Linting/Formatting:** ESLint, Prettier, Husky, Lint-staged
- **CI/CD:** GitHub Actions + Vercel Git integration
- **Date library:** date-fns v4+
- **Charts/Analytics:** Recharts v3+ (React charting library)
- **Development:** Docker + docker-compose for local PostgreSQL
- **Utility Libraries:** clsx, tippy.js, bcryptjs

<conditional-block context-check="package-manager-migration">
> **pnpm Migration**: Converting from npm to pnpm. All scripts and documentation should reference pnpm commands. Update package.json scripts to use pnpm for consistency.
</conditional-block>

<conditional-block context-check="ui-library-migration">
> **UI Migration Status**: Actively migrating from MUI (@mui/material, @mui/x-data-grid) to Mantine. New components must use Mantine. Existing MUI components should be replaced during feature updates or bug fixes.
</conditional-block>

<conditional-block context-check="neon-database-setup">
> **Neon Database**: Serverless PostgreSQL with auto-scaling, connection pooling, and branch-per-preview deployment. Use local Docker PostgreSQL for development that matches Neon configuration.
</conditional-block>

<conditional-block context-check="content-management-focus">
> **Content Management Specialization**: This tool focuses on content creation/editing. Prioritize Tiptap rich text editor, React Ace code editor, UploadThing file management, and Mantine UI consistency.
</conditional-block>

<conditional-block context-check="agentos-workflow">
> **AgentOS Integration**: Use create-spec for feature planning, execute-tasks for implementation. All database changes and UI migrations should be planned through AgentOS workflow.
</conditional-block>