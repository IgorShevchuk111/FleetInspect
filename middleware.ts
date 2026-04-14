import { NextResponse } from 'next/server';
import { auth } from '@/app/features/auth/utils/auth';

export async function middleware(request) {
    const session = await auth();
    const isOnLogin = request.nextUrl.pathname === '/login';
    const isOnSignup = request.nextUrl.pathname === '/signup';
    const isOnHomepage = request.nextUrl.pathname === '/';

    // Allow access to public pages (homepage, login, signup) when not authenticated
    if (!session && (isOnLogin || isOnSignup || isOnHomepage)) {
        return NextResponse.next();
    }

    // Redirect to login if not authenticated and not on public pages
    if (!session && !isOnLogin && !isOnSignup && !isOnHomepage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Allow authenticated users to access all pages
    if (session) {
        return NextResponse.next();
    }

    return NextResponse.next();
}

// Specify which routes this middleware should run for
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - manifest.json (PWA manifest)
         * - icons/ (PWA icons)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)',
    ],
}; 