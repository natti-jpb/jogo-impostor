'use client';
import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { getPlayerId, getStoredName, setStoredName } from '@/lib/playerId';
import { CATEGORY_NAMES } from '@/lib/words';

export default function RoomPage({ params }) {
  const { code } = use(params);
  const router = useRouter();
  const [state, setState] = useState(null);
  const [error, setError] = useState('');
  const [joinName, setJoinName] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [impostorCount, setImpostorCount] = useState(1);
  const [category, setCategory] = useState('Aleatório');

  const playerId = typeof window !== 'undefined' ? getPlayerId() : '';

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${code}?playerId=${playerId}`, { cache: 'no-store' });
      if (res.status === 404) {
        setError('Sala não existe ou expirou');
        return;
      }
      const data = await res.json();
      setState(data);
    } catch {}
  }, [code, playerId]);

  useEffect(() => {
    if (!playerId) return;
    fetchState();
    const t = setInterval(fetchState, 2000);
    return () => clearInterval(t);
  }, [playerId, fetchState]);

  useEffect(() => {
    if (state && state.status !== 'playing') setRevealed(false);
  }, [state?.status]);

  async function join() {
    if (!joinName.trim()) return;
    setStoredName(joinName.trim());
    const res = await fetch(`/api/rooms/${code}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: joinName.trim(), playerId }),
    });
    if (res.ok) fetchState();
    else {
      const d = await res.json();
      const map = { game_started: 'O jogo já começou', room_full: 'Sala cheia', name_taken: 'Nome já em uso' };
      setError(map[d.error] || 'Erro ao entrar');
    }
  }

  async function startGame() {
    const res = await fetch(`/api/rooms/${code}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, impostorCount, category }),
    });
    if (!res.ok) {
      const d = await res.json();
      const map = { min_players: 'Mínimo 3 jogadores', too_many_impostors: 'Muitos impostores' };
      setError(map[d.error] || 'Erro');
    } else {
      fetchState();
    }
  }

  async function reveal() {
    await fetch(`/api/rooms/${code}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, mode: 'reveal' }),
    });
    fetchState();
  }

  async function backToLobby() {
    await fetch(`/api/rooms/${code}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, mode: 'lobby' }),
    });
    fetchState();
  }

  async function vote(targetId) {
    const next = state?.myVote === targetId ? null : targetId;
    setState(s => s ? { ...s, myVote: next } : s);
    await fetch(`/api/rooms/${code}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, targetId: next }),
    });
    fetchState();
  }

  async function leave() {
    await fetch(`/api/rooms/${code}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    });
    router.push('/');
  }

  if (error) {
    return (
      <div className="app">
        <h1>Ops</h1>
        <p className="instruction">{error}</p>
        <button onClick={() => router.push('/')}>Voltar ao início</button>
      </div>
    );
  }

  if (!state) {
    return <div className="app"><p className="instruction">Carregando…</p></div>;
  }

  // Player is not in the room yet
  if (!state.me) {
    return (
      <div className="app">
        <h1>Entrar na sala <span className="accent">{code}</span></h1>
        {state.status !== 'lobby' ? (
          <>
            <p className="instruction">O jogo já começou. Aguarde a próxima rodada.</p>
            <button className="secondary" onClick={() => router.push('/')}>Voltar</button>
          </>
        ) : (
          <>
            <label>Seu nome</label>
            <input
              value={joinName || getStoredName()}
              onChange={e => setJoinName(e.target.value)}
              maxLength={20}
              placeholder="Como te chamam?"
            />
            <button onClick={join}>Entrar</button>
            {error && <div className="error">{error}</div>}
          </>
        )}
      </div>
    );
  }

  const isHost = state.me.isHost;

  // LOBBY
  if (state.status === 'lobby') {
    return (
      <div className="app">
        <h1>Sala <span className="accent">{code}</span></h1>
        <div className="code-display">
          <div className="label-small">Compartilhe o código</div>
          <div className="code">{code}</div>
          <div className="share-link">{typeof window !== 'undefined' ? window.location.origin + '/room/' + code : ''}</div>
        </div>

        <label>Jogadores ({state.players.length})</label>
        <div className="players">
          {state.players.map(p => (
            <div key={p.id} className={'player' + (p.id === state.hostId ? ' host' : '') + (p.id === state.me.id ? ' me' : '')}>
              {p.name}
            </div>
          ))}
        </div>

        {isHost ? (
          <>
            <label>Impostores</label>
            <select value={impostorCount} onChange={e => setImpostorCount(parseInt(e.target.value))}>
              {[1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
            </select>

            <label>Categoria</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="Aleatório">Aleatório</option>
              {CATEGORY_NAMES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <button onClick={startGame} disabled={state.players.length < 3}>
              {state.players.length < 3 ? `Esperando jogadores (mín. 3)` : 'Começar jogo'}
            </button>
            {error && <div className="error">{error}</div>}
          </>
        ) : (
          <p className="instruction">Aguardando o host iniciar…</p>
        )}

        <button className="secondary" onClick={leave}>Sair da sala</button>
      </div>
    );
  }

  // PLAYING
  if (state.status === 'playing') {
    const isImpostor = state.myRole === 'impostor';
    return (
      <div className="app">
        <h1>Sala <span className="accent">{code}</span></h1>

        {!revealed ? (
          <div className="center">
            <p className="instruction">Toque pra ver sua palavra. Não mostre pra ninguém!</p>
            <button onClick={() => setRevealed(true)}>Ver minha palavra</button>
          </div>
        ) : (
          <>
            <div className={'word-box' + (isImpostor ? ' impostor' : '')}>
              {isImpostor ? 'VOCÊ É O IMPOSTOR' : state.myWord}
            </div>
            <p className="instruction">
              {isImpostor
                ? 'Finja que sabe a palavra. Escute as dicas e tente passar despercebido.'
                : 'Dê uma dica sutil. Não entregue a palavra!'}
            </p>
            <button className="secondary" onClick={() => setRevealed(false)}>Esconder</button>
          </>
        )}

        <label>Vote em quem você acha que é o impostor</label>
        <div className="players vote-grid">
          {state.players.map(p => {
            const count = state.voteCounts?.[p.id] || 0;
            const isMine = state.myVote === p.id;
            const isSelf = p.id === state.me.id;
            return (
              <button
                key={p.id}
                className={'player vote-btn' + (isMine ? ' voted' : '') + (isSelf ? ' self' : '')}
                onClick={() => !isSelf && vote(p.id)}
                disabled={isSelf}
              >
                {p.id === state.hostId ? '👑 ' : ''}{p.name}
                {count > 0 && <span className="vote-count">{count}</span>}
              </button>
            );
          })}
        </div>

        {isHost && (
          <button onClick={reveal}>Revelar impostores</button>
        )}
      </div>
    );
  }

  // ENDED
  if (state.status === 'ended') {
    return (
      <div className="app">
        <h1>Fim da rodada</h1>
        <p className="instruction">A palavra era:</p>
        <div className="word-box">{state.word}</div>
        <p className="instruction">Impostor{state.impostors.length > 1 ? 'es' : ''}:</p>
        <div className="word-box impostor">
          {state.impostors.map(p => p.name).join(' • ')}
        </div>

        {isHost ? (
          <button onClick={backToLobby}>Nova rodada</button>
        ) : (
          <p className="instruction">Aguardando o host iniciar nova rodada…</p>
        )}
        <button className="secondary" onClick={leave}>Sair da sala</button>
      </div>
    );
  }

  return null;
}
