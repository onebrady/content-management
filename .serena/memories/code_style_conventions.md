# Code Style and Conventions

## TypeScript Configuration
- Strict mode enabled
- Path aliases: `@/*` points to `./src/*`
- Target: ES5 with modern features
- Module resolution: bundler

## Code Style
- **ESLint**: Next.js core web vitals + Prettier integration
- **Prettier**: Automatic code formatting
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Imports**: Absolute imports using `@/` prefix

## Component Patterns
- Functional components with TypeScript
- Custom hooks in `/src/hooks/`
- Mantine UI components preferred over Material-UI
- CSS Modules for component-specific styles
- TailwindCSS for utility classes

## File Organization
```
src/
├── app/              # Next.js App Router pages and API routes
├── components/       # Reusable React components
├── features/         # Feature-specific code (hooks, types, etc.)
├── lib/              # Utilities and configurations
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
├── styles/           # Global styles and CSS modules
└── utils/            # Utility functions
```

## Database & API
- Prisma ORM with PostgreSQL (Neon)
- API routes in `/src/app/api/`
- TanStack Query for data fetching
- Form handling with React Hook Form + Zod validation

## UI Migration Notes
- Migrating from Material-UI to Mantine
- Use Context7 MCP for current Mantine documentation
- Maintain existing functionality during migration
- Prefer Mantine's theme system and hooks