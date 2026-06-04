'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPlayerId, getStoredName, setStoredName } from '@/lib/playerId';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(getStoredName());
  }, []);

  async function createRoom() {
    if (!name.trim()) return setError('Coloque seu nome');
    setError(''); setBusy(true);
    setStoredName(name.trim());
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), playerId: getPlayerId() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'erro');
      router.push(`/room/${data.code}`);
    } catch (e) {
      setError('Não foi possível criar a sala');
      setBusy(false);
    }
  }

  async function joinRoom() {
    if (!name.trim()) return setError('Coloque seu nome');
    if (code.length !== 4) return setError('Código tem 4 letras');
    setError(''); setBusy(true);
    setStoredName(name.trim());
    try {
      const res = await fetch(`/api/rooms/${code.toUpperCase()}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), playerId: getPlayerId() }),
      });
      const data = await res.json();
      if (!res.ok) {
        const map = {
          not_found: 'Sala não encontrada',
          game_started: 'O jogo já começou',
          room_full: 'Sala cheia',
          name_taken: 'Esse nome já está em uso na sala',
        };
        throw new Error(map[data.error] || 'erro');
      }
      router.push(`/room/${code.toUpperCase()}`);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  return (
    <div className="app">
      <h1>Jogo do <span className="accent">Impostor</span></h1>
      <p className="sub">Cada jogador entra do seu celular ou computador.</p>

      <label>Seu nome</label>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={20}
        placeholder="Como te chamam?"
      />

      <button onClick={createRoom} disabled={busy}>Criar nova sala</button>

      <div className="divider"><span>OU</span></div>

      <label>Código da sala</label>
      <input
        value={code}
        onChange={e => setCode(e.target.value.toUpperCase().slice(0, 4))}
        placeholder="ABCD"
        style={{ textAlign: 'center', letterSpacing: 6, fontSize: 22 }}
      />
      <button className="secondary" onClick={joinRoom} disabled={busy}>Entrar em sala existente</button>

      {error && <div className="error">{error}</div>}
    </div>
  );
}
