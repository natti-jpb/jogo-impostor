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
  const [aura, setAura] = useState(false);

  useEffect(() => {
    setName(getStoredName());
  }, []);

  useEffect(() => {
    const target = 'BRASIL';
    let buffer = '';
    function onKey(e) {
      if (e.key === 'Escape') { setAura(false); return; }
      if (e.key.length !== 1) return;
      buffer = (buffer + e.key.toUpperCase()).slice(-target.length);
      if (buffer === target) setAura(true);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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
    <>
      {aura && <AuraOverlay onClose={() => setAura(false)} />}
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

      <div className="divider"><span>OU</span></div>

      <button className="secondary" onClick={() => router.push('/local')}>
        📱 Modo passa-celular (1 dispositivo)
      </button>
    </div>
    </>
  );
}

const NEYMAR_IMAGES = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Neymar_2018.jpg/480px-Neymar_2018.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Neymar_PSG.jpg/480px-Neymar_PSG.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Neymar_with_Al_Hilal_2024.jpg/480px-Neymar_with_Al_Hilal_2024.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Neymar_2011.jpg/480px-Neymar_2011.jpg',
];

function AuraOverlay({ onClose }) {
  const emojis = ['⚽','🇧🇷','✨','🔥','👑','⭐','💚','💛','😎','🐐'];
  return (
    <div className="aura-overlay" onClick={onClose}>
      <div className="aura-bg" />
      <div className="aura-rain">
        {Array.from({ length: 30 }).map((_, i) => (
          <span
            key={i}
            className="aura-emoji"
            style={{
              left: `${(i * 37) % 100}%`,
              animationDelay: `${(i * 0.3) % 6}s`,
              animationDuration: `${4 + (i % 5)}s`,
              fontSize: `${20 + (i % 4) * 10}px`,
            }}
          >{emojis[i % emojis.length]}</span>
        ))}
      </div>
      <div className="aura-grid">
        {NEYMAR_IMAGES.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={src} alt="Neymar" className="aura-img" style={{ animationDelay: `${i * 0.4}s` }} />
        ))}
      </div>
      <div className="aura-banner">NEYMAR FARMANDO AURA</div>
      <div className="aura-hint">clica ou aperta ESC pra sair</div>
    </div>
  );
}
