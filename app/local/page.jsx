'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, CATEGORY_NAMES, pickWord } from '@/lib/words';

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
  const [phase, setPhase] = useState('setup'); // setup | passing | revealing | done
  const [names, setNames] = useState(['', '']);
  const [impostorCount, setImpostorCount] = useState(1);
  const [category, setCategory] = useState('Aleatório');
  const [error, setError] = useState('');

  const [game, setGame] = useState(null); // { word, category, impostorIndexes:Set, players:[names], current, starter }
  const [holding, setHolding] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const holdTimer = useRef(null);

  function updateName(i, v) {
    const next = [...names];
    next[i] = v;
    setNames(next);
  }
  function addPlayer() {
    if (names.length >= 12) return;
    setNames([...names, '']);
  }
  function removePlayer(i) {
    if (names.length <= 2) return;
    setNames(names.filter((_, idx) => idx !== i));
  }

  function start() {
    const clean = names.map(n => n.trim()).filter(Boolean);
    if (clean.length < 3) return setError('Mínimo 3 jogadores');
    if (new Set(clean.map(n => n.toLowerCase())).size !== clean.length) return setError('Nomes duplicados');
    if (impostorCount >= clean.length) return setError('Muitos impostores pra esse número de jogadores');
    setError('');

    const { category: chosenCat, word } = pickWord(category);
    const indexes = shuffle([...Array(clean.length).keys()]);
    const impostorIndexes = new Set(indexes.slice(0, impostorCount));
    const starter = clean[Math.floor(Math.random() * clean.length)];

    setGame({ players: clean, word, category: chosenCat, impostorIndexes, current: 0, starter });
    setRevealed(false);
    setPhase('passing');
  }

  function startHold() {
    holdTimer.current = setTimeout(() => setHolding(true), 100);
  }
  function endHold() {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    setHolding(false);
  }

  function nextPlayer() {
    setHolding(false);
    const next = game.current + 1;
    if (next >= game.players.length) {
      setPhase('done');
    } else {
      setGame({ ...game, current: next });
    }
  }

  function newRound() {
    const { category: chosenCat, word } = pickWord(category);
    const indexes = shuffle([...Array(game.players.length).keys()]);
    const impostorIndexes = new Set(indexes.slice(0, impostorCount));
    const starter = game.players[Math.floor(Math.random() * game.players.length)];
    setGame({ ...game, word, category: chosenCat, impostorIndexes, current: 0, starter });
    setRevealed(false);
    setPhase('passing');
  }

  function backToSetup() {
    setPhase('setup');
    setGame(null);
    setHolding(false);
  }

  // SETUP
  if (phase === 'setup') {
    return (
      <div className="app">
        <h1>Modo <span className="accent">Passa-celular</span></h1>
        <p className="sub">Um celular só, passando jogador por jogador.</p>

        <label>Jogadores ({names.length})</label>
        {names.map((n, i) => (
          <div key={i} className="row" style={{ marginBottom: 8 }}>
            <input
              value={n}
              onChange={e => updateName(i, e.target.value)}
              maxLength={20}
              placeholder={`Jogador ${i + 1}`}
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
          <button className="secondary" onClick={addPlayer} style={{ marginTop: 6 }}>+ Adicionar jogador</button>
        )}

        <label>Impostores</label>
        <select value={impostorCount} onChange={e => setImpostorCount(parseInt(e.target.value))}>
          {[1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
        </select>

        <label>Categoria</label>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="Aleatório">Aleatório</option>
          {CATEGORY_NAMES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <button onClick={start}>Começar partida</button>
        {error && <div className="error">{error}</div>}

        <button className="secondary" onClick={() => router.push('/')}>← Voltar</button>
      </div>
    );
  }

  // PASSING - reveal screen for current player
  if (phase === 'passing') {
    const player = game.players[game.current];
    const isImpostor = game.impostorIndexes.has(game.current);

    return (
      <div className="app">
        <div className="instruction" style={{ marginBottom: 12 }}>
          {game.current + 1} de {game.players.length}
        </div>
        <h1 style={{ fontSize: 22 }}>Passe pra <span className="accent">{player}</span></h1>
        <p className="instruction" style={{ marginBottom: 24 }}>
          Só {player} deve olhar a tela agora.
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
              {isImpostor ? 'VOCÊ É O IMPOSTOR' : game.word}
            </div>
          ) : (
            <div className="hold-hint">
              <div style={{ fontSize: 42, marginBottom: 8 }}>👆</div>
              Segure pra ver sua palavra
            </div>
          )}
        </div>

        <button onClick={nextPlayer}>
          {game.current + 1 === game.players.length ? 'Finalizar' : 'Próximo jogador →'}
        </button>
      </div>
    );
  }

  // DONE
  if (phase === 'done') {
    const impostorNames = [...game.impostorIndexes].map(i => game.players[i]);
    return (
      <div className="app">
        <h1>Todos viram!</h1>
        <p className="instruction">Quem começa dando a dica:</p>
        <div className="word-box">{game.starter}</div>
        <p className="instruction">
          Cada um diz uma palavra/dica sobre a palavra secreta, sem entregar. Discutam e descubram quem é o impostor!
        </p>

        {revealed ? (
          <>
            <div className="instruction" style={{ marginTop: 16 }}>A palavra era:</div>
            <div className="word-box">{game.word}</div>
            <div className="instruction">Impostor{impostorNames.length > 1 ? 'es' : ''}:</div>
            <div className="word-box impostor">{impostorNames.join(' • ')}</div>
          </>
        ) : (
          <button onClick={() => setRevealed(true)}>Revelar impostor{game.impostorIndexes.size > 1 ? 'es' : ''}</button>
        )}

        <button className={revealed ? '' : 'secondary'} onClick={newRound}>Nova rodada (mesmos jogadores)</button>
        <button className="secondary" onClick={backToSetup}>Mudar jogadores</button>
      </div>
    );
  }

  return null;
}
