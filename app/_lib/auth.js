import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { createUser, getUser } from './data_servis';

const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      return !!auth?.user;
    },

    async signIn({ user, accoun, profile }) {
      try {
        const existingUser = await getUser(user.email);
        if (!existingUser)
          await createUser({
            email: user.email,
            full_name: user.name,
            role: 'user',
          });

        return true;
      } catch (error) {
        return false;
      }
    },
    async session({ session }) {
      const user = await getUser(session.user.email);
      session.user.userId = user.id;
      session.user.role = user.role;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);
