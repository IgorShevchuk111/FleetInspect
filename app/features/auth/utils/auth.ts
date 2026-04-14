import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { cookies } from 'next/headers';
import { supabase } from '@/app/lib/supabase';
import { getUser, createUser } from '@/app/lib/data_servis';

interface User {
  id: string;
  email: string;
  role: string;
  full_name: string;
  name?: string;
  image?: string;
  accessToken?: string;
  refreshToken?: string;
}

interface Credentials {
  email: string;
  password: string;
}

const handler = NextAuth({
  // Ensure proper URL detection
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
        const creds = credentials as Credentials;
        if (!creds?.email || !creds?.password) return null;

        try {
          // First, check if user exists in our database
          const dbUser = await getUser(creds.email);

          // If user doesn't exist in our database, return null (will redirect to signup)
          if (!dbUser) {
            return null;
          }

          // User exists in database, now try to authenticate with Supabase
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: creds.email,
            password: creds.password,
          });

          // If there's an auth error, it means wrong password (since user exists in DB)
          if (authError || !authData.user || !authData.session) {
            // Return null to show error instead of redirecting to signup
            return null;
          }

          return {
            id: dbUser.id,
            email: authData.user.email || '',
            role: dbUser.role || 'user',
            full_name: dbUser.full_name || authData.user.user_metadata?.full_name || '',
            name: dbUser.full_name || authData.user.user_metadata?.full_name,
            image: authData.user.user_metadata?.avatar_url,
            accessToken: authData.session.access_token,
            refreshToken: authData.session.refresh_token,
          };
        } catch (error: any) {
          return null;
        }
      }
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      }
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (!user.email) {
          return false;
        }

        // Check if user exists in our database by email
        let dbUser = await getUser(user.email);

        // If user doesn't exist in database, handle based on provider
        if (!dbUser) {
          // Only auto-create for Google OAuth
          if (account?.provider === 'google' && profile) {
            try {
              await createUser({
                email: user.email,
                full_name: profile.name || user.name || user.email.split('@')[0],
                role: 'user'
              });

              dbUser = await getUser(user.email);

              if (!dbUser) {
                return false;
              }
            } catch (error) {
              return false;
            }
          } else {
            // For credentials login, if user doesn't exist in database, redirect to signup
            return '/signup?error=user_not_found&email=' + encodeURIComponent(user.email);
          }
        }

        return true;
      } catch (error) {
        return false;
      }
    },

    async jwt({ token, user, account }) {
      if (user) {
        // For Google OAuth
        if (account?.provider === 'google') {
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          token.email = user.email;
          token.name = user.name;

          // Get the database user by email to get the correct role
          const dbUser = await getUser(user.email);
          if (dbUser) {
            token.userId = dbUser.id;
            token.role = dbUser.role; // Use the role from database
          } else {
            token.userId = user.id;
            token.role = 'user';
          }
        } else {
          // For credentials
          token.accessToken = user.accessToken;
          token.refreshToken = user.refreshToken;
          token.userId = user.id;
          token.email = user.email;
          token.name = user.name;
          token.role = user.role;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        // Ensure all user data is properly set
        session.user.id = token.userId as string;
        session.user.userId = token.userId as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string || 'user';

        if (token.accessToken) {
          try {
            await supabase.auth.setSession({
              access_token: token.accessToken as string,
              refresh_token: token.refreshToken as string,
            });
          } catch (error) {
            // Silent fail
          }
        }
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
});

export const { auth, signIn, signOut, handlers } = handler;

