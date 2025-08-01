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
          scope: 'openid profile email',
        },
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
        // Add user role to session
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
        }
        return token;
      } catch (error) {
        console.error('JWT callback error:', error);
        return token;
      }
    },
    // Improved redirect callback to prevent loops
    async redirect({ url, baseUrl }) {
      // Log redirect attempts for debugging
      console.log('Redirect callback:', { url, baseUrl });
      
      // If the URL is absolute and starts with the base URL, return it directly
      if (url.startsWith(baseUrl)) {
        console.log('Returning absolute URL:', url);
        return url;
      }
      
      // If it's an absolute URL to a different domain, return the base URL
      if (url.startsWith("http")) {
        console.log('Returning base URL for external URL:', baseUrl);
        return baseUrl;
      }
      
      // For relative URLs, prepend the base URL
      const finalUrl = new URL(url, baseUrl).toString();
      console.log('Returning relative URL:', finalUrl);
      return finalUrl;
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
  debug: process.env.NODE_ENV === 'development',
};