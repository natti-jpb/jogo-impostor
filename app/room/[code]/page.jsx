'use client';
import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { getPlayerId, getStoredName, setStoredName } from '@/lib/playerId';
import { CATEGORY_KEYS, CATEGORY_LABELS } from '@/lib/words';
import { useLang, t } from '@/lib/i18n';
import { apiPath } from '@/lib/apiPath';

export default function RoomPage({ params }) {
  const { code } = use(params);
  const router = useRouter();
  const [lang] = useLang();
  const [state, setState] = useState(null);
  const [error, setError] = useState('');
  const [joinName, setJoinName] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [impostorCount, setImpostorCount] = useState(1);
  const [categoryKey, setCategoryKey] = useState('random');

  const playerId = typeof window !== 'undefined' ? getPlayerId() : '';

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(apiPath(`/api/rooms/${code}?playerId=${playerId}`), { cache: 'no-store' });
      if (res.status === 404) { setError(t(lang, 'expired')); return; }
      const data = await res.json();
      setState(data);
    } catch {}
  }, [code, playerId, lang]);

  useEffect(() => {
    if (!playerId) return;
    fetchState();
    const ti = setInterval(fetchState, 2000);
    return () => clearInterval(ti);
  }, [playerId, fetchState]);

  useEffect(() => {
    if (state && state.status !== 'playing') setRevealed(false);
  }, [state?.status]);

  async function join() {
    if (!joinName.trim()) return;
    setStoredName(joinName.trim());
    const res = await fetch(apiPath(`/api/rooms/${code}/join`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: joinName.trim(), playerId }),
    });
    if (res.ok) fetchState();
    else {
      const d = await res.json();
      const map = { game_started: t(lang, 'err_started'), room_full: t(lang, 'err_full'), name_taken: t(lang, 'err_name_taken') };
      setError(map[d.error] || t(lang, 'err_generic'));
    }
  }

  async function startGame() {
    const res = await fetch(apiPath(`/api/rooms/${code}/start`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, impostorCount, categoryKey, language: lang }),
    });
    if (!res.ok) {
      const d = await res.json();
      const map = { min_players: t(lang, 'err_min_players'), too_many_impostors: t(lang, 'err_too_many_imp') };
      setError(map[d.error] || t(lang, 'err_generic'));
    } else fetchState();
  }

  async function reveal() {
    await fetch(apiPath(`/api/rooms/${code}/reset`), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, mode: 'reveal' }),
    });
    fetchState();
  }

  async function backToLobby() {
    await fetch(apiPath(`/api/rooms/${code}/reset`), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, mode: 'lobby' }),
    });
    fetchState();
  }

  async function vote(targetId) {
    const next = state?.myVote === targetId ? null : targetId;
    setState(s => s ? { ...s, myVote: next } : s);
    await fetch(apiPath(`/api/rooms/${code}/vote`), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, targetId: next }),
    });
    fetchState();
  }

  async function leave() {
    await fetch(apiPath(`/api/rooms/${code}/leave`), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    });
    router.push('/');
  }

  if (error) {
    return (
      <div className="app">
        <h1>Ops</h1>
        <p className="instruction">{error}</p>
        <button onClick={() => router.push('/')}>{t(lang, 'back_home')}</button>
      </div>
    );
  }

  if (!state) {
    return <div className="app"><p className="instruction">{t(lang, 'loading')}</p></div>;
  }

  if (!state.me) {
    return (
      <div className="app">
        <h1>{t(lang, 'join_title')} <span className="accent">{code}</span></h1>
        {state.status !== 'lobby' ? (
          <>
            <p className="instruction">{t(lang, 'already_started')}</p>
            <button className="secondary" onClick={() => router.push('/')}>{t(lang, 'back')}</button>
          </>
        ) : (
          <>
            <label>{t(lang, 'name')}</label>
            <input
              value={joinName || getStoredName()}
              onChange={e => setJoinName(e.target.value)}
              maxLength={20}
              placeholder={t(lang, 'name_ph')}
            />
            <button onClick={join}>{t(lang, 'join_btn')}</button>
            {error && <div className="error">{error}</div>}
          </>
        )}
      </div>
    );
  }

  const isHost = state.me.isHost;

  if (state.status === 'lobby') {
    return (
      <div className="app">
        <h1>{t(lang, 'room')} <span className="accent">{code}</span></h1>
        <div className="code-display">
          <div className="label-small">{t(lang, 'share_code')}</div>
          <div className="code">{code}</div>
          <div className="share-link">{typeof window !== 'undefined' ? window.location.origin + '/room/' + code : ''}</div>
        </div>

        <label>{t(lang, 'players')} ({state.players.length})</label>
        <div className="players">
          {state.players.map(p => (
            <div key={p.id} className={'player' + (p.id === state.hostId ? ' host' : '') + (p.id === state.me.id ? ' me' : '')}>
              {p.name}
            </div>
          ))}
        </div>

        {isHost ? (
          <>
            <label>{t(lang, 'impostors')}</label>
            <select value={impostorCount} onChange={e => setImpostorCount(parseInt(e.target.value))}>
              {[1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
            </select>

            <label>{t(lang, 'category')}</label>
            <select value={categoryKey} onChange={e => setCategoryKey(e.target.value)}>
              <option value="random">{t(lang, 'random')}</option>
              {CATEGORY_KEYS.map(c => <option key={c} value={c}>{CATEGORY_LABELS[lang][c]}</option>)}
            </select>

            <button onClick={startGame} disabled={state.players.length < 3}>
              {state.players.length < 3 ? t(lang, 'waiting_players') : t(lang, 'start_game')}
            </button>
            {error && <div className="error">{error}</div>}
          </>
        ) : (
          <p className="instruction">{t(lang, 'waiting_host')}</p>
        )}

        <button className="secondary" onClick={leave}>{t(lang, 'leave_room')}</button>
      </div>
    );
  }

  if (state.status === 'playing') {
    const isImpostor = state.myRole === 'impostor';
    return (
      <div className="app">
        <h1>{t(lang, 'room')} <span className="accent">{code}</span></h1>

        {!revealed ? (
          <div className="center">
            <p className="instruction">{t(lang, 'tap_to_see')}</p>
            <button onClick={() => setRevealed(true)}>{t(lang, 'see_my_word')}</button>
          </div>
        ) : (
          <>
            <div className={'word-box' + (isImpostor ? ' impostor' : '')}>
              {isImpostor ? t(lang, 'you_impostor') : state.myWord}
            </div>
            <p className="instruction">
              {isImpostor ? t(lang, 'impostor_hint') : t(lang, 'crew_hint')}
            </p>
            <button className="secondary" onClick={() => setRevealed(false)}>{t(lang, 'hide')}</button>
          </>
        )}

        <label>{t(lang, 'vote_label')}</label>
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
          <button onClick={reveal}>{t(lang, 'reveal_impostors')}</button>
        )}
      </div>
    );
  }

  if (state.status === 'ended') {
    const multi = state.impostors.length > 1;
    return (
      <div className="app">
        <h1>{t(lang, 'round_end')}</h1>
        <p className="instruction">{t(lang, 'word_was')}</p>
        <div className="word-box">{state.word}</div>
        <p className="instruction">{multi ? t(lang, 'impostors_were') : t(lang, 'impostor_was')}</p>
        <div className="word-box impostor">{state.impostors.map(p => p.name).join(' • ')}</div>

        {isHost ? (
          <button onClick={backToLobby}>{t(lang, 'new_round')}</button>
        ) : (
          <p className="instruction">{t(lang, 'waiting_new_round')}</p>
        )}
        <button className="secondary" onClick={leave}>{t(lang, 'leave_room')}</button>
      </div>
    );
  }

  return null;
}
