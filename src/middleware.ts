import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Host and crawl hygiene:
 * - Force apex host (www → non-www) so GSC does not split signals
 * - noindex Cloudflare Pages preview hosts
 */
export function middleware(request: NextRequest) {
  const host = (request.headers.get('host') || '').toLowerCase();

  // pages.dev / preview hosts: never index
  if (host.endsWith('.pages.dev') || host.includes('localhost') || host.startsWith('127.0.0.1')) {
    const res = NextResponse.next();
    if (host.endsWith('.pages.dev')) {
      res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    }
    return res;
  }

  // www → apex permanent redirect
  if (host === 'www.stocksonsolana.com') {
    const url = request.nextUrl.clone();
    url.hostname = 'stocksonsolana.com';
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next internals and static assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
