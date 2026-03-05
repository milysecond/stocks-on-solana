import { NextResponse } from 'next/server';
import { discoverTokens } from '@/lib/discover-tokens';

export const runtime = 'edge';
export const revalidate = 3600; // re-discover every hour

export async function GET() {
  const tokens = await discoverTokens();
  return NextResponse.json(tokens);
}
