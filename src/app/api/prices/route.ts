import { NextResponse } from 'next/server';
import { ALL_TOKENS } from '@/lib/tokens';

export const revalidate = 30;

export async function GET() {
  const mints = ALL_TOKENS.map(t => t.mint).join(',');
  try {
    const res = await fetch(`https://api.jup.ag/price/v2?ids=${mints}`, {
      next: { revalidate: 30 },
    });
    const data = await res.json();
    return NextResponse.json(data.data || {});
  } catch {
    return NextResponse.json({});
  }
}
