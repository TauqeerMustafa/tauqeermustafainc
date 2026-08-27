import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  if (hostname.includes('portals.tauqeermustafa.tech')) {
    if (!url.pathname.startsWith('/client')) {
      url.pathname = '/client' + (url.pathname === '/' ? '' : url.pathname);
      return NextResponse.rewrite(url);
    }
  }

  if (hostname.includes('community.tauqeermustafa.tech')) {
    if (!url.pathname.startsWith('/community')) {
      url.pathname = '/community' + (url.pathname === '/' ? '' : url.pathname);
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};
