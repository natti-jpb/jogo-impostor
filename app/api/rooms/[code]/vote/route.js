import { NextResponse } from 'next/server';
import { getRoom, saveRoom } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req, { params }) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  const body = await req.json().catch(() => ({}));
  const playerId = (body.playerId || '').trim();
  const targetId = body.targetId == null ? null : String(body.targetId).trim();

  const room = await getRoom(code);
  if (!room) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (room.status !== 'playing') return NextResponse.json({ error: 'not_playing' }, { status: 409 });
  if (!room.players.find(p => p.id === playerId)) return NextResponse.json({ error: 'not_in_room' }, { status: 403 });

  room.votes = room.votes || {};
  if (!targetId) {
    delete room.votes[playerId];
  } else {
    if (!room.players.find(p => p.id === targetId)) return NextResponse.json({ error: 'bad_target' }, { status: 400 });
    room.votes[playerId] = targetId;
  }
  await saveRoom(room);
  return NextResponse.json({ ok: true });
}
