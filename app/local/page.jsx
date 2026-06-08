'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORY_KEYS, CATEGORY_LABELS, pickWord } from '@/lib/words';
import { useLang, t } from '@/lib/i18n';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function LocalMode() {
  const router = useRouter();
  const [lang] = useLang();
  const [phase, setPhase] = useState('setup');
  const [names, setNames] = useState(['', '']);
  const [impostorCount, setImpostorCount] = useState(1);
  const [categoryKey, setCategoryKey] = useState('random');
  const [error, setError] = useState('');

  const [game, setGame] = useState(null);
  const [holding, setHolding] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const holdTimer = useRef(null);

  function updateName(i, v) {
    const next = [...names]; next[i] = v; setNames(next);
  }
  function addPlayer() { if (names.length < 12) setNames([...names, '']); }
  function removePlayer(i) { if (names.length > 2) setNames(names.filter((_, idx) => idx !== i)); }

  function start() {
    const clean = names.map(n => n.trim()).filter(Boolean);
    if (clean.length < 3) return setError(t(lang, 'err_min_players'));
    if (new Set(clean.map(n => n.toLowerCase())).size !== clean.length) return setError(t(lang, 'err_dup_names'));
    if (impostorCount >= clean.length) return setError(t(lang, 'err_too_many_imp_local'));
    setError('');

    const { categoryKey: chosenKey, word } = pickWord(lang, categoryKey);
    const indexes = shuffle([...Array(clean.length).keys()]);
    const impostorIndexes = new Set(indexes.slice(0, impostorCount));
    const starter = clean[Math.floor(Math.random() * clean.length)];

    setGame({ players: clean, word, categoryKey: chosenKey, impostorIndexes, current: 0, starter });
    setRevealed(false);
    setPhase('passing');
  }

  function startHold() { holdTimer.current = setTimeout(() => setHolding(true), 100); }
  function endHold() { if (holdTimer.current) clearTimeout(holdTimer.current); setHolding(false); }

  function nextPlayer() {
    setHolding(false);
    const next = game.current + 1;
    if (next >= game.players.length) setPhase('done');
    else setGame({ ...game, current: next });
  }

  function newRound() {
    const { categoryKey: chosenKey, word } = pickWord(lang, categoryKey);
    const indexes = shuffle([...Array(game.players.length).keys()]);
    const impostorIndexes = new Set(indexes.slice(0, impostorCount));
    const starter = game.players[Math.floor(Math.random() * game.players.length)];
    setGame({ ...game, word, categoryKey: chosenKey, impostorIndexes, current: 0, starter });
    setRevealed(false);
    setPhase('passing');
  }

  function backToSetup() { setPhase('setup'); setGame(null); setHolding(false); }

  if (phase === 'setup') {
    return (
      <div className="app">
        <h1>{t(lang, 'local_title_part1')} <span className="accent">{t(lang, 'local_title_part2')}</span></h1>
        <p className="sub">{t(lang, 'local_sub')}</p>

        <label>{t(lang, 'players')} ({names.length})</label>
        {names.map((n, i) => (
          <div key={i} className="row" style={{ marginBottom: 8 }}>
            <input
              value={n}
              onChange={e => updateName(i, e.target.value)}
              maxLength={20}
              placeholder={`${t(lang, 'player_ph')} ${i + 1}`}
            />
            {names.length > 2 && (
              <button
                className="secondary"
                style={{ flex: '0 0 60px', marginTop: 0, padding: '12px 0' }}
                onClick={() => removePlayer(i)}
              >×</button>
            )}
          </div>
        ))}
        {names.length < 12 && (
          <button className="secondary" onClick={addPlayer} style={{ marginTop: 6 }}>{t(lang, 'add_player')}</button>
        )}

        <label>{t(lang, 'impostors')}</label>
        <select value={impostorCount} onChange={e => setImpostorCount(parseInt(e.target.value))}>
          {[1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
        </select>

        <label>{t(lang, 'category')}</label>
        <select value={categoryKey} onChange={e => setCategoryKey(e.target.value)}>
          <option value="random">{t(lang, 'random')}</option>
          {CATEGORY_KEYS.map(c => <option key={c} value={c}>{CATEGORY_LABELS[lang][c]}</option>)}
        </select>

        <button onClick={start}>{t(lang, 'start_match')}</button>
        {error && <div className="error">{error}</div>}

        <button className="secondary" onClick={() => router.push('/')}>← {t(lang, 'back')}</button>
      </div>
    );
  }

  if (phase === 'passing') {
    const player = game.players[game.current];
    const isImpostor = game.impostorIndexes.has(game.current);

    return (
      <div className="app">
        <div className="instruction" style={{ marginBottom: 12 }}>
          {game.current + 1} {t(lang, 'progress_of')} {game.players.length}
        </div>
        <h1 style={{ fontSize: 22 }}>{t(lang, 'pass_to')} <span className="accent">{player}</span></h1>
        <p className="instruction" style={{ marginBottom: 24 }}>
          {t(lang, 'pass_warning', { name: player })}
        </p>

        <div
          className={'hold-area' + (holding ? ' active' : '')}
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onPointerCancel={endHold}
          onContextMenu={e => e.preventDefault()}
        >
          {holding ? (
            <div className={'word-reveal' + (isImpostor ? ' impostor' : '')}>
              {isImpostor ? t(lang, 'you_impostor') : game.word}
            </div>
          ) : (
            <div className="hold-hint">
              <div style={{ fontSize: 42, marginBottom: 8 }}>👆</div>
              {t(lang, 'hold_to_see')}
            </div>
          )}
        </div>

        <button onClick={nextPlayer}>
          {game.current + 1 === game.players.length ? t(lang, 'finalize') : t(lang, 'next_player')}
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    const impostorNames = [...game.impostorIndexes].map(i => game.players[i]);
    const multi = impostorNames.length > 1;
    return (
      <div className="app">
        <h1>{t(lang, 'all_seen')}</h1>
        <p className="instruction">{t(lang, 'who_starts')}</p>
        <div className="word-box">{game.starter}</div>
        <p className="instruction">{t(lang, 'hint_round')}</p>

        {revealed ? (
          <>
            <div className="instruction" style={{ marginTop: 16 }}>{t(lang, 'word_was')}</div>
            <div className="word-box">{game.word}</div>
            <div className="instruction">{multi ? t(lang, 'impostors_were') : t(lang, 'impostor_was')}</div>
            <div className="word-box impostor">{impostorNames.join(' • ')}</div>
          </>
        ) : (
          <button onClick={() => setRevealed(true)}>{t(lang, 'reveal_impostors')}</button>
        )}

        <button className={revealed ? '' : 'secondary'} onClick={newRound}>{t(lang, 'new_round_same')}</button>
        <button className="secondary" onClick={backToSetup}>{t(lang, 'change_players')}</button>
      </div>
    );
  }

  return null;
}
