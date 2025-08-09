# Suggested Commands for Development

## Development Commands
- `pnpm dev` - Start development server with custom server.js
- `pnpm run build` - Build for production (IMPORTANT: use with 'run')
- `pnpm start` - Start production server
- `pnpm run dev:next` - Start Next.js dev server directly

## Testing Commands
- `pnpm test` - Run Jest unit tests
- `pnpm test -- --verbose --no-coverage --silent` - Optimized test output for Cursor
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:e2e` - Run Playwright end-to-end tests
- `pnpm test:component` - Test only components
- `pnpm test:api` - Test only API routes

## Database Commands
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Run database migrations (development)
- `pnpm db:push` - Push schema changes to database
- `pnpm db:seed` - Seed database with test data
- `pnpm db:studio` - Open Prisma Studio

## Local Development Setup
- `pnpm docker:up` - Start local PostgreSQL with Docker
- `pnpm docker:down` - Stop Docker containers
- `pnpm docker:reset` - Reset Docker volumes
- `pnpm local:setup` - Complete local setup (Docker + DB + seed)

## Code Quality
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking
- Code formatting handled by Prettier

## Windows System Commands
- `dir` - List directory contents
- `cd` - Change directory
- `findstr` - Search in files (Windows grep)
- `git` - Git version control