import { NextResponse } from 'next/server';
import { getRoom, saveRoom } from '@/lib/redis';
import { shuffle } from '@/lib/room';
import { pickWord } from '@/lib/words';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req, { params }) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  const body = await req.json().catch(() => ({}));
  const playerId = (body.playerId || '').trim();
  const impostorCount = Math.max(1, Math.min(3, parseInt(body.impostorCount) || 1));
  const category = body.category || 'Aleatório';

  const room = await getRoom(code);
  if (!room) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (room.hostId !== playerId) return NextResponse.json({ error: 'not_host' }, { status: 403 });
  if (room.players.length < 3) return NextResponse.json({ error: 'min_players' }, { status: 400 });
  if (impostorCount >= room.players.length) return NextResponse.json({ error: 'too_many_impostors' }, { status: 400 });

  const { category: chosenCat, word } = pickWord(category);
  const shuffled = shuffle(room.players.map(p => p.id));
  const impostorIds = shuffled.slice(0, impostorCount);

  room.status = 'playing';
  room.category = chosenCat;
  room.word = word;
  room.impostorIds = impostorIds;
  room.impostorCount = impostorCount;
  room.votes = {};
  await saveRoom(room);
  return NextResponse.json({ ok: true });
}
