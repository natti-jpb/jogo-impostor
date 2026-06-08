export function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function publicView(room, playerId) {
  const me = room.players.find(p => p.id === playerId);
  const base = {
    code: room.code,
    status: room.status,
    hostId: room.hostId,
    players: room.players.map(p => ({ id: p.id, name: p.name })),
    categoryKey: room.status === 'playing' || room.status === 'ended' ? (room.categoryKey || room.category || null) : null,
    language: room.language || 'pt',
    impostorCount: room.impostorCount || 1,
    me: me ? { id: me.id, name: me.name, isHost: me.id === room.hostId } : null,
  };

  if (room.status === 'playing' && me) {
    const isImpostor = room.impostorIds.includes(me.id);
    base.myRole = isImpostor ? 'impostor' : 'crew';
    base.myWord = isImpostor ? null : room.word;
  }

  if (room.status === 'playing') {
    const votes = room.votes || {};
    const counts = {};
    for (const tid of Object.values(votes)) counts[tid] = (counts[tid] || 0) + 1;
    base.voteCounts = counts;
    base.myVote = me ? votes[me.id] || null : null;
  }

  if (room.status === 'ended') {
    base.word = room.word;
    base.impostors = room.impostorIds
      .map(id => room.players.find(p => p.id === id))
      .filter(Boolean)
      .map(p => ({ id: p.id, name: p.name }));
  }

  return base;
}
