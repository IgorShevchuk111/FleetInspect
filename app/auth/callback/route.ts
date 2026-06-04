import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');

    if (!code) {
        return NextResponse.redirect(new URL('/', url));
    }

    const supabase = await createClient();

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        console.error('Auth error:', error.message);

        return NextResponse.redirect(new URL('/login?error=auth', url));
    }

    return NextResponse.redirect(new URL('/', url));
}