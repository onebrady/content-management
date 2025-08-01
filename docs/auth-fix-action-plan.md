# Authentication Fix Action Plan (Updated)

## 🚨 OAuthCallback Error Fix

The `OAuthCallback` error you're seeing indicates that Azure AD is attempting to redirect back to your application after authentication, but something is failing during the callback process.

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
7. Under "Implicit grant and hybrid flows", check both:
   - Access tokens
   - ID tokens
8. Under "Supported account types", ensure it's set to "Accounts in this organizational directory only"
9. Save the changes

**Check API Permissions:**

1. Go to API permissions
2. Ensure you have these permissions:
   - Microsoft Graph > User.Read
   - Microsoft Graph > profile
   - Microsoft Graph > email
   - Microsoft Graph > openid
3. Click "Grant admin consent" button

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

1. The code changes have been made to fix the OAuthCallback error:
   - Added proper profile handling for Azure AD
   - Enhanced token and session management
   - Improved redirect logic
   - Added better error handling
   - Enabled debug mode for detailed logs
2. Commit and push the changes
3. Deploy to Vercel
4. Wait for deployment to complete
5. Check Vercel Function logs for detailed error information

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

If authentication is still broken after applying all fixes:

1. **Check Vercel Function Logs**:
   - Go to Vercel dashboard > Functions tab
   - Look for logs with "OAuthCallback" or "auth" related errors
   - Check for any missing environment variables or configuration issues

2. **Verify Client Secret**:
   - Go to Azure Portal > App registrations > Your app > Certificates & secrets
   - Check if your client secret has expired
   - If needed, create a new client secret and update `AZURE_AD_CLIENT_SECRET` in Vercel

3. **Test with a Different Browser**:
   - Try Chrome, Firefox, Edge, etc.
   - Always use incognito/private mode

4. **Check Network Requests**:
   - Open browser developer tools (F12)
   - Go to Network tab
   - Try signing in and look for failed requests
   - Check for any CORS or redirect issues

5. **Rollback if Necessary**:
   - If all else fails, rollback to a previous working version
   - Contact support with specific error messages and logs

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
2. **Run the debug script** to identify specific issues:
   ```
   node scripts/debug-auth.js
   ```
3. **Test in incognito mode** to avoid cache issues
4. **Monitor Vercel logs** for error messages
5. **Contact support** if issues persist after following all steps

## 🔧 Summary of Fixes for OAuthCallback Error

The following changes have been implemented to fix the OAuthCallback error:

1. **Azure AD Provider Configuration**:
   - Added proper profile handling for Azure AD
   - Updated scope to include `User.Read` explicitly
   - Added profile callback to handle Azure AD profile data

2. **Session & Token Management**:
   - Enhanced token handling to store account info
   - Improved session callback to use token data
   - Better error handling in all callbacks

3. **Redirect Logic**:
   - Simplified redirect callback to prevent loops
   - Better handling of relative URLs
   - Clear redirect path to dashboard

4. **Error Handling**:
   - Added specific error messages for OAuthCallback errors
   - Added error code display on error page
   - Enabled debug mode for detailed logs

5. **Debugging Tools**:
   - Created comprehensive debug script
   - Added detailed troubleshooting guide
   - Enhanced error logging throughout the auth flow

These changes address the most common causes of OAuthCallback errors:

- Incorrect redirect URI configuration
- Expired or invalid client secrets
- Missing or incorrect permissions
- Cookie domain issues
- Session management problems
