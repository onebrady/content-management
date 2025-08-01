# Deployment Guide

## Overview

This document provides information about the deployment setup for the Content Development Flow project.

## Deployment Platform

The application is deployed on Vercel, a cloud platform for static sites and serverless functions that pairs perfectly with Next.js applications.

## Deployment URL

- Production: [https://content-development-q1olyobf9-onebradys-projects.vercel.app](https://content-development-q1olyobf9-onebradys-projects.vercel.app)

## CI/CD Pipeline

The CI/CD pipeline is configured using GitHub Actions and Vercel integration:

1. **GitHub Actions** (`/.github/workflows/ci.yml`):
   - Runs on pushes to main/develop branches and PRs to main
   - Executes unit tests, E2E tests, linting, and type checking
   - Builds the application
   - Uploads build artifacts

2. **Vercel Deployment** (`/.github/workflows/deploy.yml`):
   - Triggers on pushes to the main branch
   - Deploys the application to Vercel

## Configuration

### Vercel Configuration

The deployment is configured in `vercel.json`:

```json
{
  "version": 2,
  "buildCommand": "npx pnpm install && npx pnpm add tailwindcss postcss autoprefixer --save-dev && npx prisma generate && npx next build",
  "installCommand": "npx pnpm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_VERCEL_ENV": "production"
  }
}
```

### Environment Variables

The following environment variables need to be set in the Vercel project settings:

#### Database

- `DATABASE_URL`: PostgreSQL connection string

#### Authentication

- `NEXTAUTH_URL`: The URL of your deployed application
- `NEXTAUTH_SECRET`: A secure random string for NextAuth.js
- `AZURE_AD_CLIENT_ID`: Azure AD client ID
- `AZURE_AD_CLIENT_SECRET`: Azure AD client secret
- `AZURE_AD_TENANT_ID`: Azure AD tenant ID

#### File Upload

- `UPLOADTHING_SECRET`: UploadThing secret key
- `UPLOADTHING_APP_ID`: UploadThing app ID

#### Email

- `RESEND_API_KEY`: Resend API key

## Database Setup

The application requires a PostgreSQL database. For production, you can use:

1. **Vercel Postgres**
2. **Supabase**
3. **Neon**
4. **Railway**

After setting up the database, run migrations:

```bash
DATABASE_URL=your_production_db_url npx prisma migrate deploy
```

## Known Issues

1. **MUI Version Conflicts**:
   - There's a conflict between @mui/icons-material v7 and @mui/material v6
   - Currently using `--legacy-peer-deps` to bypass this issue

2. **Build Warnings**:
   - Some import errors in the editor component
   - TypeScript and ESLint checks are temporarily disabled for production build

## Monitoring

Monitoring is set up through Vercel's built-in monitoring tools:

1. **Vercel Analytics**: Provides insights on page performance and user experience
2. **Vercel Logs**: Real-time logs for debugging issues
3. **Vercel Status**: Monitors the health of the deployment

## Scaling

The application is built on a serverless architecture, which automatically scales based on demand. No manual scaling configuration is required.

## Rollback Procedure

If a deployment causes issues:

1. Go to the Vercel dashboard
2. Navigate to the project
3. Go to "Deployments" tab
4. Find a previous working deployment
5. Click the three dots menu and select "Promote to Production"

## Future Improvements

1. **Resolve Dependency Conflicts**:
   - Align all MUI packages to the same major version

2. **Enable Stricter Checks**:
   - Re-enable TypeScript and ESLint checks once issues are resolved

3. **Implement Custom Error Tracking**:
   - Add Sentry or similar error tracking service

4. **Set Up Performance Monitoring**:
   - Add New Relic or similar performance monitoring
