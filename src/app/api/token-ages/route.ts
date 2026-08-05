import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const revalidate = 86400;

/**
 * Token ages are optional UI sugar. Never block the screener on RPC history walks.
 * Returns empty map quickly — age filter degrades gracefully until a background job exists.
 */
export async function GET() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    },
  );
}
