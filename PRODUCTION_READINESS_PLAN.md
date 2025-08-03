# Production Readiness Plan

## 🚨 Critical Issues to Fix

### 1. Test Failures (11 failing tests)

#### **A. Mantine Provider Missing in Tests**
**Issue**: Tests failing due to missing Mantine provider context
**Files Affected**: 
- `src/components/ui/__tests__/LoadingSpinner.test.tsx`
- `src/components/analytics/__tests__/StatCard.test.tsx`

**Solution**:
```typescript
// Update src/utils/test-utils.tsx to include MantineProvider
import { MantineProvider } from '@mantine/core';

const customRender = (ui: React.ReactElement, options = {}) => {
  return render(
    <MantineProvider>
      {ui}
    </MantineProvider>,
    options
  );
};
```

#### **B. Navigation Hooks Not Mocked**
**Issue**: `usePathname` not properly mocked in tests
**Files Affected**:
- `src/app/content/__tests__/page.test.tsx`

**Solution**:
```typescript
// Update jest.setup.js to include proper navigation mocks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams(),
}));
```

#### **C. Database Connection Issues in API Tests**
**Issue**: API tests failing due to database connection problems
**Files Affected**:
- `src/app/api/__tests__/content.test.ts`

**Solution**:
```typescript
// Mock Prisma client properly in tests
jest.mock('@/lib/prisma', () => ({
  prisma: {
    content: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));
```

#### **D. Component Test Selectors**
**Issue**: Text selectors not matching due to Mantine component structure
**Files Affected**:
- `src/components/analytics/__tests__/StatCard.test.tsx`

**Solution**:
```typescript
// Update test selectors to match Mantine component structure
expect(screen.getByText(/\+ 10%/)).toBeInTheDocument(); // Use regex for flexible matching
```

### 2. Database Production Readiness

#### **A. Migration Status Check**
✅ **Current Status**: All 6 migrations are applied and up-to-date
- `20250801142739_init` - Initial schema
- `20250801201015_add_password_to_user` - User password field
- `20250801235326_add_ondelete_actions` - Cascade delete actions
- `20250802030101_add_slug_to_content` - Content slug field
- `20250802055610_add_hero_image_to_content` - Hero image support
- `20250802060000_fix_content_status_enum` - Status enum fixes

#### **B. Production Migration Strategy**
**Reference**: According to Prisma documentation, use `prisma migrate deploy` for production

**Vercel Configuration Update**:
```json
// Update vercel.json buildCommand
{
  "buildCommand": "npx pnpm install && npx prisma generate && npx prisma migrate deploy && npx next build"
}
```

#### **C. Database Schema Changes Summary**
**Recent Changes Made**:
- ✅ Added `heroImage` field to Content model
- ✅ Added `slug` field to Content model  
- ✅ Updated ContentStatus enum values
- ✅ Added proper cascade delete actions
- ✅ Added password field to User model

**Production Impact**: All changes are backward compatible and safe for production

### 3. Environment Variables Configuration

#### **Required Production Environment Variables**:
```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Authentication
NEXTAUTH_URL="https://your-production-domain.com"
NEXTAUTH_SECRET="your-secure-random-secret"
AZURE_AD_CLIENT_ID="your-azure-client-id"
AZURE_AD_CLIENT_SECRET="your-azure-client-secret"
AZURE_AD_TENANT_ID="your-azure-tenant-id"

# File Upload
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# Email
RESEND_API_KEY="your-resend-api-key"

# App
NEXT_PUBLIC_APP_URL="https://your-production-domain.com"
```

### 4. Build Configuration Issues

#### **A. Prisma Engine Permission Errors**
**Issue**: Windows permission errors during build
**Solution**: 
- Run as administrator or fix file permissions
- Consider using Docker for consistent builds

#### **B. Migration Retry Logic**
**Issue**: Build shows migration retry attempts
**Solution**: Update migration logic in `src/lib/db-migration.ts`

## 🔧 Implementation Plan

### Phase 1: Fix Test Issues (Priority 1)
1. **Update test utilities** with Mantine provider
2. **Fix navigation mocks** in jest.setup.js
3. **Update component test selectors** for Mantine components
4. **Mock Prisma client** properly in API tests

### Phase 2: Database Production Setup (Priority 1)
1. **Verify production database connection**
2. **Test migration deployment** to production
3. **Update Vercel build configuration**
4. **Set up environment variables** in Vercel dashboard

### Phase 3: Build Optimization (Priority 2)
1. **Fix Prisma engine permission issues**
2. **Optimize migration retry logic**
3. **Update package.json scripts** for production

### Phase 4: Final Validation (Priority 1)
1. **Run complete test suite** after fixes
2. **Test production build** locally
3. **Deploy to staging** environment
4. **Validate all functionality** in staging

## 📋 Action Items

### Immediate Actions (Today)
- [ ] Fix Mantine provider in test utilities
- [ ] Update navigation mocks
- [ ] Configure production environment variables
- [ ] Test database migration deployment

### Short-term Actions (This Week)
- [ ] Complete test fixes
- [ ] Optimize build configuration
- [ ] Deploy to staging environment
- [ ] Validate all features in staging

### Pre-Production Checklist
- [ ] All tests passing
- [ ] Production database configured
- [ ] Environment variables set
- [ ] Build successful in staging
- [ ] All features working in staging
- [ ] Performance metrics acceptable

## 🎯 Success Criteria

### Test Coverage
- [ ] All unit tests passing
- [ ] All component tests passing
- [ ] All API tests passing
- [ ] E2E tests passing

### Database Readiness
- [ ] All migrations applied to production
- [ ] Database schema matches development
- [ ] No pending migrations
- [ ] Connection pooling configured

### Build & Deployment
- [ ] Production build successful
- [ ] All environment variables configured
- [ ] Vercel deployment working
- [ ] No permission errors

## 🚀 Production Deployment Checklist

### Before Deployment
- [ ] All critical issues resolved
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Build successful in staging

### During Deployment
- [ ] Monitor migration deployment
- [ ] Verify database connectivity
- [ ] Check application startup
- [ ] Validate core functionality

### After Deployment
- [ ] Monitor error logs
- [ ] Verify all features working
- [ ] Check performance metrics
- [ ] Validate user authentication

## 📊 Risk Assessment

### High Risk
- **Database migration failures** - Mitigation: Test migrations in staging first
- **Environment variable misconfiguration** - Mitigation: Use Vercel's environment variable validation

### Medium Risk
- **Test failures in production** - Mitigation: Comprehensive testing in staging
- **Build permission issues** - Mitigation: Use Docker or fix local permissions

### Low Risk
- **UI component issues** - Mitigation: Mantine components are stable
- **Performance issues** - Mitigation: Monitor and optimize as needed

## 🔍 Monitoring & Rollback Plan

### Monitoring
- Set up Vercel Analytics
- Monitor database connection errors
- Track application performance
- Watch for authentication issues

### Rollback Strategy
- Keep previous deployment as backup
- Database rollback procedures documented
- Environment variable backup strategy
- Quick rollback triggers identified

---

**Estimated Timeline**: 2-3 days for critical fixes, 1 week for full production readiness
**Confidence Level**: 85% ready for production after fixes 