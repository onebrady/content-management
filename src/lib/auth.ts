import { NextAuthOptions } from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import { UserRole } from '@/types/database';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: 'openid profile email User.Read',
        },
      },
      // Add profile callback to handle Azure AD profile data correctly
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email || profile.preferred_username,
          image: null,
        };
      },
    }),
  ],
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Only set domain in production to avoid localhost issues
        ...(process.env.NODE_ENV === 'production' && {
          domain: '.westerntruck.com',
        }),
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Ensure user exists in our database with proper role
        if (user.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // Create new user with default CONTRIBUTOR role
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || user.email,
                role: UserRole.CONTRIBUTOR,
              },
            });
          }
        }
        return true;
      } catch (error) {
        console.error('SignIn callback error:', error);
        return false;
      }
    },
    async session({ session, user, token }) {
      try {
        // Add user role to session from token first
        if (token && session.user) {
          // Use token data if available
          session.user.id = token.sub;
          if (token.role) {
            session.user.role = token.role as string;
          }
          if (token.department) {
            session.user.department = token.department as string;
          }

          // Also fetch from database as fallback
          if (session.user?.email) {
            const dbUser = await prisma.user.findUnique({
              where: { email: session.user.email },
            });

            if (dbUser) {
              session.user.id = dbUser.id;
              session.user.role = dbUser.role;
              session.user.department = dbUser.department;
            }
          }
        }
        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    },
    async jwt({ token, user, account }) {
      try {
        // Add user role to JWT token
        if (user) {
          token.role = user.role;
          token.department = user.department;

          // Store account info on first sign in
          if (account) {
            token.accessToken = account.access_token;
            token.provider = account.provider;
          }
        }
        return token;
      } catch (error) {
        console.error('JWT callback error:', error);
        return token;
      }
    },
    // Simplified redirect callback to prevent loops
    async redirect({ url, baseUrl }) {
      // Log redirect attempts for debugging
      console.log('Redirect callback:', { url, baseUrl });

      // Handle relative URLs
      if (url.startsWith('/')) {
        const finalUrl = `${baseUrl}${url}`;
        console.log('Returning relative URL:', finalUrl);
        return finalUrl;
      }

      // If the URL is absolute and starts with the base URL, return it directly
      if (url.startsWith(baseUrl)) {
        console.log('Returning absolute URL:', url);
        return url;
      }

      // For any other URL, redirect to dashboard
      console.log('Redirecting to dashboard');
      return `${baseUrl}/dashboard`;
    },
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
  debug: true, // Enable debug mode to see detailed logs
};
