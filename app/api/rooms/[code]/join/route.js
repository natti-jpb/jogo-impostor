import { NextResponse } from 'next/server';
import { getRoom, saveRoom } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req, { params }) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  const body = await req.json().catch(() => ({}));
  const name = (body.name || '').trim().slice(0, 20);
  const playerId = (body.playerId || '').trim();
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });
  if (!playerId) return NextResponse.json({ error: 'playerId required' }, { status: 400 });

  const room = await getRoom(code);
  if (!room) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (room.status !== 'lobby') return NextResponse.json({ error: 'game_started' }, { status: 409 });
  if (room.players.length >= 12) return NextResponse.json({ error: 'room_full' }, { status: 409 });

  const existing = room.players.find(p => p.id === playerId);
  if (existing) {
    existing.name = name;
  } else {
    if (room.players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      return NextResponse.json({ error: 'name_taken' }, { status: 409 });
    }
    room.players.push({ id: playerId, name });
  }
  await saveRoom(room);
  return NextResponse.json({ ok: true });
}
