import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const ROOM_TTL_SECONDS = 60 * 60 * 6;

export function roomKey(code) {
  return `room:${code}`;
}

export async function getRoom(code) {
  const data = await redis.get(roomKey(code));
  return data || null;
}

export async function saveRoom(room) {
  await redis.set(roomKey(room.code), room, { ex: ROOM_TTL_SECONDS });
}

export async function deleteRoom(code) {
  await redis.del(roomKey(code));
}
