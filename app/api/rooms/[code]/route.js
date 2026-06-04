import { NextResponse } from 'next/server';
import { getRoom } from '@/lib/redis';
import { publicView } from '@/lib/room';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const { code } = await params;
  const url = new URL(req.url);
  const playerId = url.searchParams.get('playerId') || '';
  const room = await getRoom(code.toUpperCase());
  if (!room) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json(publicView(room, playerId));
}
