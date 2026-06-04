import { NextResponse } from 'next/server';
import { getRoom, saveRoom } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req, { params }) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  const body = await req.json().catch(() => ({}));
  const playerId = (body.playerId || '').trim();
  const mode = body.mode || 'lobby';

  const room = await getRoom(code);
  if (!room) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (room.hostId !== playerId) return NextResponse.json({ error: 'not_host' }, { status: 403 });

  if (mode === 'reveal') {
    room.status = 'ended';
  } else {
    room.status = 'lobby';
    room.word = null;
    room.impostorIds = [];
  }
  await saveRoom(room);
  return NextResponse.json({ ok: true });
}
