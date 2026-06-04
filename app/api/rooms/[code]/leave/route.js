import { NextResponse } from 'next/server';
import { getRoom, saveRoom, deleteRoom } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req, { params }) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  const body = await req.json().catch(() => ({}));
  const playerId = (body.playerId || '').trim();

  const room = await getRoom(code);
  if (!room) return NextResponse.json({ ok: true });
  room.players = room.players.filter(p => p.id !== playerId);
  if (room.players.length === 0) {
    await deleteRoom(code);
  } else {
    if (room.hostId === playerId) room.hostId = room.players[0].id;
    await saveRoom(room);
  }
  return NextResponse.json({ ok: true });
}
