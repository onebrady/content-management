import { NextAuthOptions } from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
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
      // Improved profile callback to handle Azure AD profile data correctly
      profile(profile) {
        return {
          id: profile.sub,
          name:
            profile.name || profile.display_name || profile.preferred_username,
          email: profile.email || profile.preferred_username,
          image: null,
        };
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (
          user &&
          user.password &&
          (await bcrypt.compare(credentials.password, user.password))
        ) {
          // Omit password from returned user
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        }
        return null;
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
        // Handle OAuth account linking and user creation
        if (user.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (existingUser) {
            // Update existing user with latest info from OAuth
            await prisma.user.update({
              where: { email: user.email },
              data: {
                name: user.name || existingUser.name,
                // Preserve existing role and other important data
                role: existingUser.role,
                department: existingUser.department,
              },
            });
            
            // If this is an OAuth sign-in, ensure the account is linked
            if (account && account.provider === 'azure-ad') {
              // Check if account is already linked
              const existingAccount = await prisma.account.findFirst({
                where: {
                  userId: existingUser.id,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                },
              });

              if (!existingAccount) {
                // Link the OAuth account to the existing user
                await prisma.account.create({
                  data: {
                    userId: existingUser.id,
                    type: account.type,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    refresh_token: account.refresh_token,
                    access_token: account.access_token,
                    expires_at: account.expires_at,
                    token_type: account.token_type,
                    scope: account.scope,
                    id_token: account.id_token,
                    session_state: account.session_state,
                  },
                });
              }
            }
            
            return true; // Allow sign in for existing users
          } else {
            // Create new user with OAuth account
            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || user.email,
                role: UserRole.CONTRIBUTOR,
              },
            });

            // Link the OAuth account to the new user
            if (account && account.provider === 'azure-ad') {
              await prisma.account.create({
                data: {
                  userId: newUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                },
              });
            }

            return true;
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
              session.user.name = dbUser.name; // Ensure name is updated from database
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
    // Improved redirect callback to handle OAuth callback issues
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
  debug: process.env.NODE_ENV === 'development', // Only debug in development
};
