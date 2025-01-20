import { NextResponse } from 'next/server';
import { auth } from '@/app/_lib/auth';

export async function middleware(req) {
  const session = await auth();
  const isAuthenticated = session?.user;

  if (!isAuthenticated && req.nextUrl.pathname === '/inspection') {
    return NextResponse.redirect(new URL('/', req.url));
  } else if (isAuthenticated && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/inspection', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/inspection'],
};

// import { auth } from '@/app/_lib/auth';
// export const middleware = auth;

// export const config = {
//   matcher: ['/inspection'],
// };
