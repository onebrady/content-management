# CI/CD Pipeline Setup

This document provides an overview of the CI/CD pipeline setup for the Content Development Flow project.

## GitHub Actions Configuration

### CI Workflow

The CI workflow is configured in `.github/workflows/ci.yml` and includes the following jobs:

1. **Unit Tests**:
   - Runs Jest tests with coverage reporting
   - Sets up a PostgreSQL database for testing
   - Configures test environment variables

2. **E2E Tests**:
   - Runs Playwright tests
   - Sets up a development server
   - Captures test reports as artifacts

3. **Lint and Format Check**:
   - Runs ESLint
   - Checks Prettier formatting

4. **TypeScript Type Check**:
   - Verifies TypeScript types

5. **Build**:
   - Builds the application
   - Uploads build artifacts

### Deployment Workflow

The deployment workflow is configured in `.github/workflows/deploy.yml` and handles:

- Automated deployment to Vercel
- Environment variable configuration
- Production build verification

## Vercel Configuration

The Vercel deployment is configured with:

1. **Custom Build Settings**:
   - Build command: `npm install --legacy-peer-deps && prisma generate && next build`
   - Install command: `npm install --legacy-peer-deps`
   - Framework preset: Next.js
   - Output directory: `.next`

2. **Environment Variables**:
   - Database connection
   - Authentication settings
   - API keys
   - Feature flags

## Repository Secrets

The following secrets are configured in the GitHub repository:

- `VERCEL_TOKEN`: Vercel deployment token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID

## Dependency Management

Dependencies are managed with:

- `--legacy-peer-deps` flag to handle dependency conflicts
- Prisma generation during build process
- Tailwind CSS for styling

## Known Issues

1. **Dependency Conflicts**:
   - MUI version conflicts between v6 and v7
   - Resolved with `--legacy-peer-deps`

2. **Build Warnings**:
   - Some import errors are present but don't affect functionality
   - TypeScript and ESLint checks are temporarily disabled for production build

## Future Improvements

1. **Resolve Dependency Conflicts**:
   - Align all MUI packages to the same major version

2. **Enable Stricter Checks**:
   - Re-enable TypeScript and ESLint checks once issues are resolved

3. **Optimize Build Performance**:
   - Implement build caching
   - Optimize dependency installation

4. **Monitoring**:
   - Add error tracking
   - Set up performance monitoring
