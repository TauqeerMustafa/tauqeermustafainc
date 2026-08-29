import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // If visiting the mail subdomain
  if (hostname === 'mail.tauqeermustafa.tech' || hostname.startsWith('mail.localhost')) {
    // We rewrite all requests to the /mail route internally
    if (!url.pathname.startsWith('/mail') && !url.pathname.startsWith('/_next') && !url.pathname.startsWith('/api')) {
      url.pathname = `/mail${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
