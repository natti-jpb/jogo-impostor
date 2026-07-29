'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPlayerId, getStoredName, setStoredName } from '@/lib/playerId';
import { LANGS, LANG_LABELS, useLang, t } from '@/lib/i18n';
import { apiPath } from '@/lib/apiPath';

export default function Home() {
  const router = useRouter();
  const [lang, setLang] = useLang();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [aura, setAura] = useState(false);
  const tapState = useRef({ count: 0, last: 0 });

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
    if (!name.trim()) return setError(t(lang, 'err_name'));
    setError(''); setBusy(true);
    setStoredName(name.trim());
    try {
      const res = await fetch(apiPath('/api/rooms'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), playerId: getPlayerId() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'erro');
      router.push(`/room/${data.code}`);
    } catch {
      setError(t(lang, 'err_create'));
      setBusy(false);
    }
  }

  async function joinRoom() {
    if (!name.trim()) return setError(t(lang, 'err_name'));
    if (code.length !== 4) return setError(t(lang, 'err_code_len'));
    setError(''); setBusy(true);
    setStoredName(name.trim());
    try {
      const res = await fetch(apiPath(`/api/rooms/${code.toUpperCase()}/join`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), playerId: getPlayerId() }),
      });
      const data = await res.json();
      if (!res.ok) {
        const map = {
          not_found: t(lang, 'err_not_found'),
          game_started: t(lang, 'err_started'),
          room_full: t(lang, 'err_full'),
          name_taken: t(lang, 'err_name_taken'),
        };
        throw new Error(map[data.error] || t(lang, 'err_generic'));
      }
      router.push(`/room/${code.toUpperCase()}`);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  return (
    <>
      {aura && <AuraOverlay lang={lang} onClose={() => setAura(false)} />}
    <div className="app">
      <div className="lang-switcher">
        {LANGS.map(l => (
          <button
            key={l}
            className={'lang-btn' + (lang === l ? ' active' : '')}
            onClick={() => setLang(l)}
          >{LANG_LABELS[l]}</button>
        ))}
      </div>

      <h1 onClick={() => {
        const now = Date.now();
        const s = tapState.current;
        if (now - s.last > 800) s.count = 0;
        s.last = now;
        s.count++;
        if (s.count >= 5) { setAura(true); s.count = 0; }
      }}>{t(lang, 'title_part1')} <span className="accent">{t(lang, 'title_part2')}</span></h1>
      <p className="sub">{t(lang, 'home_sub')}</p>

      <label>{t(lang, 'name')}</label>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={20}
        placeholder={t(lang, 'name_ph')}
      />

      <button onClick={createRoom} disabled={busy}>{t(lang, 'create_room')}</button>

      <div className="divider"><span>{t(lang, 'or')}</span></div>

      <label>{t(lang, 'room_code')}</label>
      <input
        value={code}
        onChange={e => setCode(e.target.value.toUpperCase().slice(0, 4))}
        placeholder={t(lang, 'code_ph')}
        style={{ textAlign: 'center', letterSpacing: 6, fontSize: 22 }}
      />
      <button className="secondary" onClick={joinRoom} disabled={busy}>{t(lang, 'join_room')}</button>

      {error && <div className="error">{error}</div>}

      <div className="divider"><span>{t(lang, 'or')}</span></div>

      <button className="secondary" onClick={() => router.push('/local')}>
        {t(lang, 'local_mode')}
      </button>
    </div>
    </>
  );
}

const NEYMAR_IMAGES = [
  'https://commons.wikimedia.org/wiki/Special:FilePath/Neymar_PSG.jpg?width=600',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Neymar_2018.jpg?width=600',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Neymar_(cropped).jpg?width=600',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Neymar_Jr_Presentation.jpg?width=600',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Neymar_2012.JPG?width=600',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Neymar_Junior_the_Future_of_Brazil.jpg?width=600',
];

function AuraOverlay({ lang, onClose }) {
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
      <div className="aura-hint">{t(lang, 'aura_hint')}</div>
    </div>
  );
}
