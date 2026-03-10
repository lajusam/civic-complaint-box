import { NextResponse } from 'next/server';

/**
 * Redirect first-time visitors from "/" to "/welcome".
 * Once they visit /welcome the splash sets a cookie so they won't be
 * redirected again on subsequent visits.
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only intercept the root path
  if (pathname !== '/') return NextResponse.next();

  // If the user has already seen the welcome page, let them through
  const seen = request.cookies.get('civic_welcomed');
  if (seen) return NextResponse.next();

  // Redirect to /welcome
  const url = request.nextUrl.clone();
  url.pathname = '/welcome';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/'],
};
