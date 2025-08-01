# Authentication Fix Action Plan

## 🚨 Immediate Actions Required

### Step 1: Environment Variable Verification

**Check your Vercel environment variables:**

1. Go to your Vercel dashboard
2. Navigate to your project settings
3. Check the Environment Variables section
4. Verify these exact values:

```bash
NEXTAUTH_URL=https://content.westerntruck.com
NEXTAUTH_SECRET=your-secure-random-string
AZURE_AD_CLIENT_ID=your-azure-client-id
AZURE_AD_CLIENT_SECRET=your-azure-client-secret
AZURE_AD_TENANT_ID=your-azure-tenant-id
```

**If any are missing or incorrect, update them immediately.**

### Step 2: Azure AD Configuration

**Verify Azure AD App Registration:**

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to Azure Active Directory > App registrations
3. Find your app registration
4. Go to Authentication > Redirect URIs
5. **Remove ALL existing redirect URIs**
6. **Add ONLY this one:** `https://content.westerntruck.com/api/auth/callback/azure-ad`
7. Save the changes

### Step 3: Clear Browser Data

**Complete browser cleanup:**

1. Open browser developer tools (F12)
2. Go to Application/Storage tab
3. Clear all data:
   - Cookies
   - Local Storage
   - Session Storage
   - Cache
4. Close browser completely
5. Reopen in incognito/private mode

### Step 4: Deploy the Fixes

**Deploy the updated code:**

1. The code changes have been made to fix redirect loops
2. Commit and push the changes
3. Deploy to Vercel
4. Wait for deployment to complete

### Step 5: Test Authentication

**Test the authentication flow:**

1. Open incognito browser
2. Go to `https://content.westerntruck.com/auth/signin`
3. Click "Sign in with Microsoft"
4. Complete the Azure AD authentication
5. Verify you're redirected to `/dashboard`

## 🔧 If Issues Persist

### Run the Debug Script

```bash
# Run the authentication debug script
node scripts/debug-auth.js
```

This will check:
- Environment variables
- Database connection
- Azure AD configuration
- Common redirect loop issues

### Check Vercel Logs

1. Go to Vercel dashboard
2. Navigate to your project
3. Go to Functions tab
4. Check for any authentication-related errors
5. Look for specific error messages

### Verify Database Connection

```bash
# Test database connection
npx prisma db push
npx prisma generate
```

## 🎯 Expected Results

After completing these steps, you should:

- ✅ Be able to access `/auth/signin` without redirect loops
- ✅ Successfully authenticate with Azure AD
- ✅ Be redirected to `/dashboard` after authentication
- ✅ Have a persistent session across page refreshes
- ✅ Be able to access protected routes

## 🚨 Emergency Fallback

If authentication is still broken:

1. **Rollback to previous working version** (if available)
2. **Check all environment variables** are exactly correct
3. **Verify Azure AD configuration** hasn't changed
4. **Test with different browser/device**
5. **Contact support** with specific error messages

## 📋 Verification Checklist

- [ ] Environment variables are set correctly in Vercel
- [ ] Azure AD redirect URI is exactly `https://content.westerntruck.com/api/auth/callback/azure-ad`
- [ ] Browser cache and cookies are cleared
- [ ] Code changes are deployed to Vercel
- [ ] Authentication flow works in incognito mode
- [ ] Session persists after page refresh
- [ ] Protected routes are accessible
- [ ] No redirect loops occur

## 🔍 Troubleshooting Commands

```bash
# Generate a new secure secret
openssl rand -base64 32

# Test environment variables
node -e "console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)"

# Run debug script
node scripts/debug-auth.js

# Check database
npx prisma studio
```

## 📞 Next Steps

1. **Follow the action plan step by step**
2. **Run the debug script** to identify specific issues
3. **Test in incognito mode** to avoid cache issues
4. **Monitor Vercel logs** for error messages
5. **Contact support** if issues persist after following all steps

The fixes implemented should resolve the redirect loop issue by:
- Improving redirect callback logic
- Fixing cookie domain settings
- Simplifying middleware authentication
- Adding better error handling
- Enhancing session management 