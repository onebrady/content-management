# NextAuth Configuration for Custom Domain

This document provides the exact settings needed to configure NextAuth.js with your custom domain `content.westerntruck.com`.

## Environment Variables

Add these environment variables to your Vercel project:

```
# Required NextAuth configuration
NEXTAUTH_URL=https://content.westerntruck.com
NEXTAUTH_SECRET=your-secure-random-string-here  # Generate this with `openssl rand -base64 32`

# Keep your existing Azure AD credentials
AZURE_AD_CLIENT_ID=your-azure-client-id
AZURE_AD_CLIENT_SECRET=your-azure-client-secret
AZURE_AD_TENANT_ID=your-azure-tenant-id
```

## Azure AD Configuration

1. Log in to the Azure Portal
2. Navigate to Azure Active Directory > App registrations > Your app
3. Update the Redirect URIs:
   - Add: `https://content.westerntruck.com/api/auth/callback/azure-ad`
   - Remove any old URLs that point to the previous domain

## CORS and Cookie Settings

For better security with your custom domain, update the NextAuth configuration in `src/lib/auth.ts`:

```typescript
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: 'openid profile email',
        },
      },
    }),
  ],
  // Add these settings for the custom domain
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: '.westerntruck.com', // Use root domain with dot prefix for subdomain support
      },
    },
  },
  callbacks: {
    // Your existing callbacks...
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
```

## Testing the Configuration

After applying these changes:

1. Deploy your application to Vercel
2. Verify that your custom domain is properly set up in Vercel
3. Test the authentication flow by visiting `https://content.westerntruck.com/auth/signin`
4. Check that cookies are being set correctly in your browser's developer tools

## Troubleshooting

If you encounter issues:

1. **Redirect errors**: Ensure the redirect URI is exactly correct in Azure AD
2. **Cookie problems**: Make sure your domain settings are correct
3. **CORS errors**: Check browser console for specific errors
4. **JWT errors**: Verify NEXTAUTH_SECRET is properly set

## Security Considerations

- Use a strong, randomly generated value for `NEXTAUTH_SECRET`
- Ensure HTTPS is enforced for your domain
- Consider setting appropriate session timeouts based on your security requirements
