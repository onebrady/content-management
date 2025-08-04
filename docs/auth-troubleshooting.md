# Authentication Troubleshooting Guide

This guide helps diagnose and fix authentication issues, particularly redirect loops and Azure AD OAuth callback problems.

## Common Issues & Solutions

### 1. OAuthCallback Error (Azure AD)

**Symptoms:**
- Browser shows "OAuthCallback" error in URL
- Authentication never completes
- User gets redirected back to signin page with error

**Causes & Solutions:**

#### A. Azure AD App Registration Configuration
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Find your app registration
4. Go to **Authentication** > **Redirect URIs**
5. **Remove ALL existing redirect URIs**
6. **Add ONLY these redirect URIs:**
   - `https://content.westerntruck.com/api/auth/callback/azure-ad` (Production)
   - `http://localhost:3000/api/auth/callback/azure-ad` (Local Development)
7. Under **Implicit grant and hybrid flows**, check:
   - ✅ Access tokens
   - ✅ ID tokens
8. Under **Supported account types**, ensure it's set to "Accounts in this organizational directory only"
9. Save the changes

#### B. Environment Variable Issues
```bash
# Check your environment variables
echo $NEXTAUTH_URL
echo $NEXTAUTH_SECRET
echo $AZURE_AD_CLIENT_ID
echo $AZURE_AD_CLIENT_SECRET
echo $AZURE_AD_TENANT_ID
```

**Fix:**
- Ensure `NEXTAUTH_URL` matches your deployed domain exactly
- For production: `NEXTAUTH_URL=https://content.westerntruck.com`
- For local development: `NEXTAUTH_URL=http://localhost:3000`

#### C. Cookie Domain Issues
**For Production:**
- Cookies are set with domain `.westerntruck.com`
- Only applies in production environment

**For Local Development:**
- Cookies are set without domain restriction
- Works with localhost

### 2. Redirect Loop Issues

**Symptoms:**
- Browser shows "Too many redirects" error
- Infinite loading on signin page
- Authentication never completes

**Causes & Solutions:**

#### A. Environment Variable Issues
```bash
# Check your environment variables
echo $NEXTAUTH_URL
echo $NEXTAUTH_SECRET
```

**Fix:**
- Ensure `NEXTAUTH_URL` matches your deployed domain exactly
- For production: `NEXTAUTH_URL=https://content.westerntruck.com`
- For local development: `NEXTAUTH_URL=http://localhost:3000`

#### B. Azure AD Configuration Issues
**Check Azure AD App Registration:**
1. Go to Azure Portal > App Registrations > Your App
2. Verify Redirect URIs include: `https://content.westerntruck.com/api/auth/callback/azure-ad`
3. Remove any old/incorrect redirect URIs

#### C. Cookie Domain Issues
**For Production:**
- Cookies are set with domain `.westerntruck.com`
- Only applies in production environment

**For Local Development:**
- Cookies are set without domain restriction
- Works with localhost

### 3. Session Issues

**Symptoms:**
- User appears logged out after page refresh
- Session not persisting
- Authentication state inconsistent

**Solutions:**
- Check browser cookies (F12 > Application > Cookies)
- Verify `NEXTAUTH_SECRET` is set and consistent
- Clear browser cache and cookies

### 4. Middleware Issues

**Symptoms:**
- Authentication works but certain pages redirect incorrectly
- Permission errors on valid routes

**Debug Steps:**
1. Check browser console for errors
2. Verify user role in database
3. Test with different user roles

## Environment Configuration Checklist

### Production Environment Variables
```bash
# Required for production
NEXTAUTH_URL=https://content.westerntruck.com
NEXTAUTH_SECRET=your-secure-random-string
AZURE_AD_CLIENT_ID=your-azure-client-id
AZURE_AD_CLIENT_SECRET=your-azure-client-secret
AZURE_AD_TENANT_ID=your-azure-tenant-id

# Database
DATABASE_URL=your-production-database-url

# Other required variables
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id
RESEND_API_KEY=your-resend-api-key
```

### Local Development Environment Variables
```bash
# Required for local development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-local-secret-key
AZURE_AD_CLIENT_ID=your-azure-client-id
AZURE_AD_CLIENT_SECRET=your-azure-client-secret
AZURE_AD_TENANT_ID=your-azure-tenant-id

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/content_management

# Other required variables
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id
RESEND_API_KEY=your-resend-api-key
```

## Debugging Steps

### 1. Check Environment Variables
```bash
# Generate a secure secret
openssl rand -base64 32

# Verify all required variables are set
node -e "
const required = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'AZURE_AD_CLIENT_ID',
  'AZURE_AD_CLIENT_SECRET',
  'AZURE_AD_TENANT_ID',
  'DATABASE_URL'
];
required.forEach(key => {
  if (!process.env[key]) {
    console.error('Missing:', key);
  } else {
    console.log('✓', key, '=', process.env[key].substring(0, 10) + '...');
  }
});
"
```

### 2. Test Authentication Flow
1. Clear browser cache and cookies
2. Visit `/auth/signin`
3. Check browser console for errors
4. Monitor network requests in browser dev tools
5. Verify redirect URLs in Azure AD match exactly

### 3. Database Connection
```bash
# Test database connection
npx prisma db push
npx prisma generate
```

### 4. Check Logs
- Monitor Vercel function logs
- Check browser console for client-side errors
- Review server-side logs in development

## Quick Fixes

### If OAuthCallback Error Persists:
1. **Clear all browser data** (cookies, cache, local storage)
2. **Verify Azure AD redirect URI** matches exactly: `https://content.westerntruck.com/api/auth/callback/azure-ad`
3. **Check environment variables** are correct
4. **Restart the application** completely
5. **Test in incognito mode**

### If Redirect Loop Persists:
1. **Clear all browser data** (cookies, cache, local storage)
2. **Verify Azure AD redirect URI** matches exactly
3. **Check environment variables** are correct
4. **Restart the application** completely
5. **Test in incognito mode**

### If Session Not Persisting:
1. **Verify NEXTAUTH_SECRET** is set and consistent
2. **Check cookie settings** in browser dev tools
3. **Ensure HTTPS** is used in production
4. **Verify domain settings** are correct

### If Azure AD Authentication Fails:
1. **Check Azure AD app configuration**
2. **Verify client ID and secret** are correct
3. **Ensure redirect URI** is properly configured
4. **Check tenant ID** is correct

## Testing Checklist

- [ ] Environment variables are correctly set
- [ ] Azure AD app is properly configured
- [ ] Database connection works
- [ ] Local development works
- [ ] Production deployment works
- [ ] Authentication flow completes
- [ ] Session persists after refresh
- [ ] User roles are properly assigned
- [ ] Protected routes work correctly
- [ ] Error pages display properly

## Emergency Recovery

If authentication is completely broken:

1. **Rollback to previous working version**
2. **Check environment variables** in deployment platform
3. **Verify Azure AD configuration** hasn't changed
4. **Test with a fresh browser session**
5. **Monitor logs** for specific error messages

## Support

If issues persist after following this guide:
1. Check browser console for specific error messages
2. Review Vercel function logs
3. Verify all environment variables are set correctly
4. Test with different browsers/devices
5. Check Azure AD app configuration 