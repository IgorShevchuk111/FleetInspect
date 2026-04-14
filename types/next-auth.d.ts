import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { SupabaseUser } from '@supabase/auth-js';  // If using Supabase

declare module 'next-auth' {
    interface User {
        id: string;
        role: string;
        full_name: string;
        email: string;
        accessToken?: string;
        refreshToken?: string;
    }

    interface Session {
        user: User & {
            userId: string;
        };
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        userId: string;
        role: string;
        accessToken?: string;
        refreshToken?: string;
    }
}