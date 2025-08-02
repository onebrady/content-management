# Vercel Deployment Guide

## Database Setup for Vercel

To ensure that database migrations are properly applied when deploying to Vercel, follow these steps:

### 1. Environment Variables

Set up the following environment variables in your Vercel project settings:

- `DATABASE_URL`: Your production PostgreSQL connection string
- `NEXTAUTH_URL`: Your production URL (e.g., https://content.westerntruck.com)
- `NEXTAUTH_SECRET`: A secure random string for NextAuth.js
- `NODE_ENV`: Set to `production`

### 2. Build Settings

The project is already configured with the proper build commands in `vercel.json`:

```json
{
  "buildCommand": "npx pnpm install && npx pnpm add tailwindcss postcss autoprefixer --save-dev && npx prisma generate && npx next build && npx prisma migrate deploy"
}
```

This ensures that:

1. Dependencies are installed
2. Prisma client is generated
3. Next.js builds the application
4. Prisma migrations are deployed to the production database

### 3. Database Migrations

The migrations will be automatically applied during the build process. All migrations in the `prisma/migrations` directory will be executed in order.

### 4. Troubleshooting

If you encounter database-related issues after deployment:

1. **Check migration status**:

   ```bash
   npx vercel run --prod "npx prisma migrate status"
   ```

2. **Force apply migrations**:

   ```bash
   npx vercel run --prod "npx prisma migrate deploy"
   ```

3. **Reset the database** (⚠️ WARNING: This will delete all data):

   ```bash
   npx vercel run --prod "npx prisma migrate reset --force"
   ```

4. **Check database connection**:
   ```bash
   npx vercel run --prod "npx prisma db pull"
   ```

### 5. Seeding Production Data

By default, the seed script is disabled in production to prevent accidental data insertion.

If you need to seed the production database:

1. Go to the Vercel dashboard
2. Set `DISABLE_SEED_PRODUCTION` to `false` in environment variables
3. Run the seed command:
   ```bash
   npx vercel run --prod "npx tsx prisma/seed.ts"
   ```
4. Remember to set `DISABLE_SEED_PRODUCTION` back to `true` after seeding

## Important Notes

- Always test migrations locally before deploying to production
- Use `prisma migrate dev` for development and `prisma migrate deploy` for production
- The `slug` column is required for all content items
- Ensure your database user has permissions to create/alter tables
