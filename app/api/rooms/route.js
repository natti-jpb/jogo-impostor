import { NextResponse } from 'next/server';
import { getRoom, saveRoom } from '@/lib/redis';
import { genCode } from '@/lib/room';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const name = (body.name || '').trim().slice(0, 20) || 'Host';
  const playerId = (body.playerId || '').trim();
  if (!playerId) return NextResponse.json({ error: 'playerId required' }, { status: 400 });

  let code;
  for (let i = 0; i < 8; i++) {
    code = genCode();
    const existing = await getRoom(code);
    if (!existing) break;
    code = null;
  }
  if (!code) return NextResponse.json({ error: 'could not allocate room' }, { status: 500 });

  const room = {
    code,
    hostId: playerId,
    status: 'lobby',
    players: [{ id: playerId, name }],
    impostorCount: 1,
    category: 'Aleatório',
    word: null,
    impostorIds: [],
    createdAt: Date.now(),
  };
  await saveRoom(room);
  return NextResponse.json({ code });
}
