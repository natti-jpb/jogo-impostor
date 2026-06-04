export function getPlayerId() {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('impostor:playerId');
  if (!id) {
    id = 'p_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    localStorage.setItem('impostor:playerId', id);
  }
  return id;
}

export function getStoredName() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('impostor:name') || '';
}

export function setStoredName(name) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('impostor:name', name);
}
