'use client';
import { useEffect, useState } from 'react';

export const LANGS = ['pt', 'en', 'de'];
export const LANG_LABELS = { pt: '🇧🇷 PT', en: '🇺🇸 EN', de: '🇩🇪 DE' };

export const STRINGS = {
  pt: {
    title_part1: 'Jogo do', title_part2: 'Impostor',
    home_sub: 'Cada jogador entra do seu celular ou computador.',
    name: 'Seu nome', name_ph: 'Como te chamam?',
    create_room: 'Criar nova sala',
    or: 'OU',
    room_code: 'Código da sala', code_ph: 'ABCD',
    join_room: 'Entrar em sala existente',
    local_mode: '📱 Modo passa-celular (1 dispositivo)',
    err_name: 'Coloque seu nome', err_code_len: 'Código tem 4 letras',
    err_create: 'Não foi possível criar a sala',
    err_not_found: 'Sala não encontrada', err_started: 'O jogo já começou',
    err_full: 'Sala cheia', err_name_taken: 'Esse nome já está em uso na sala',
    err_min_players: 'Mínimo 3 jogadores', err_too_many_imp: 'Muitos impostores',
    err_dup_names: 'Nomes duplicados', err_too_many_imp_local: 'Muitos impostores pra esse número de jogadores',
    err_generic: 'Erro',
    language: 'Idioma',
    room: 'Sala', share_code: 'Compartilhe o código',
    players: 'Jogadores', impostors: 'Impostores', category: 'Categoria',
    random: 'Aleatório',
    start_game: 'Começar jogo', waiting_players: 'Esperando jogadores (mín. 3)',
    waiting_host: 'Aguardando o host iniciar…',
    leave_room: 'Sair da sala',
    expired: 'Sala não existe ou expirou', back_home: 'Voltar ao início',
    loading: 'Carregando…',
    join_title: 'Entrar na sala', already_started: 'O jogo já começou. Aguarde a próxima rodada.',
    back: 'Voltar', join_btn: 'Entrar',
    tap_to_see: 'Toque pra ver sua palavra. Não mostre pra ninguém!',
    see_my_word: 'Ver minha palavra',
    you_impostor: 'VOCÊ É O IMPOSTOR',
    impostor_hint: 'Finja que sabe a palavra. Escute as dicas e tente passar despercebido.',
    crew_hint: 'Dê uma dica sutil. Não entregue a palavra!',
    hide: 'Esconder',
    vote_label: 'Vote em quem você acha que é o impostor',
    reveal_impostors: 'Revelar impostores',
    round_end: 'Fim da rodada', word_was: 'A palavra era:',
    impostor_was: 'Impostor era:', impostors_were: 'Impostores eram:',
    new_round: 'Nova rodada', new_round_same: 'Nova rodada (mesmos jogadores)',
    waiting_new_round: 'Aguardando o host iniciar nova rodada…',
    local_title_part1: 'Modo', local_title_part2: 'Passa-celular',
    local_sub: 'Um celular só, passando jogador por jogador.',
    add_player: '+ Adicionar jogador', player_ph: 'Jogador',
    start_match: 'Começar partida',
    pass_to: 'Passe pra', pass_warning: 'Só {name} deve olhar a tela agora.',
    hold_to_see: 'Segure pra ver sua palavra',
    next_player: 'Próximo jogador →', finalize: 'Finalizar',
    all_seen: 'Todos viram!', who_starts: 'Quem começa dando a dica:',
    hint_round: 'Cada um diz uma palavra/dica sobre a palavra secreta, sem entregar. Discutam e descubram quem é o impostor!',
    change_players: 'Mudar jogadores',
    progress_of: 'de',
    aura_hint: 'clica ou aperta ESC pra sair',
  },
  en: {
    title_part1: 'The', title_part2: 'Impostor',
    home_sub: 'Each player joins from their own phone or computer.',
    name: 'Your name', name_ph: 'What should we call you?',
    create_room: 'Create new room',
    or: 'OR',
    room_code: 'Room code', code_ph: 'ABCD',
    join_room: 'Join existing room',
    local_mode: '📱 Pass-the-phone mode (1 device)',
    err_name: 'Enter your name', err_code_len: 'Code is 4 letters',
    err_create: 'Could not create the room',
    err_not_found: 'Room not found', err_started: 'The game already started',
    err_full: 'Room is full', err_name_taken: 'That name is already in use',
    err_min_players: 'Minimum 3 players', err_too_many_imp: 'Too many impostors',
    err_dup_names: 'Duplicate names', err_too_many_imp_local: 'Too many impostors for this player count',
    err_generic: 'Error',
    language: 'Language',
    room: 'Room', share_code: 'Share the code',
    players: 'Players', impostors: 'Impostors', category: 'Category',
    random: 'Random',
    start_game: 'Start game', waiting_players: 'Waiting for players (min. 3)',
    waiting_host: 'Waiting for the host to start…',
    leave_room: 'Leave room',
    expired: 'Room does not exist or has expired', back_home: 'Back to home',
    loading: 'Loading…',
    join_title: 'Join room', already_started: 'The game already started. Wait for the next round.',
    back: 'Back', join_btn: 'Join',
    tap_to_see: 'Tap to see your word. Do not show anyone!',
    see_my_word: 'See my word',
    you_impostor: 'YOU ARE THE IMPOSTOR',
    impostor_hint: 'Pretend you know the word. Listen to the hints and blend in.',
    crew_hint: 'Give a subtle hint. Do not give the word away!',
    hide: 'Hide',
    vote_label: 'Vote for who you think is the impostor',
    reveal_impostors: 'Reveal impostors',
    round_end: 'End of round', word_was: 'The word was:',
    impostor_was: 'The impostor was:', impostors_were: 'The impostors were:',
    new_round: 'New round', new_round_same: 'New round (same players)',
    waiting_new_round: 'Waiting for the host to start a new round…',
    local_title_part1: 'Pass-the', local_title_part2: 'Phone',
    local_sub: 'One phone passed from player to player.',
    add_player: '+ Add player', player_ph: 'Player',
    start_match: 'Start match',
    pass_to: 'Pass to', pass_warning: 'Only {name} should look at the screen now.',
    hold_to_see: 'Hold to see your word',
    next_player: 'Next player →', finalize: 'Finish',
    all_seen: 'Everyone saw it!', who_starts: 'Who starts giving a hint:',
    hint_round: 'Everyone says a word/hint about the secret word, without giving it away. Discuss and find the impostor!',
    change_players: 'Change players',
    progress_of: 'of',
    aura_hint: 'tap or press ESC to exit',
  },
  de: {
    title_part1: 'Das Spiel des', title_part2: 'Impostors',
    home_sub: 'Jeder Spieler tritt vom eigenen Handy oder Computer bei.',
    name: 'Dein Name', name_ph: 'Wie heißt du?',
    create_room: 'Neuen Raum erstellen',
    or: 'ODER',
    room_code: 'Raumcode', code_ph: 'ABCD',
    join_room: 'Bestehendem Raum beitreten',
    local_mode: '📱 Handy-weitergeben-Modus (1 Gerät)',
    err_name: 'Gib deinen Namen ein', err_code_len: 'Code hat 4 Buchstaben',
    err_create: 'Raum konnte nicht erstellt werden',
    err_not_found: 'Raum nicht gefunden', err_started: 'Das Spiel hat schon begonnen',
    err_full: 'Raum ist voll', err_name_taken: 'Dieser Name ist bereits vergeben',
    err_min_players: 'Mindestens 3 Spieler', err_too_many_imp: 'Zu viele Impostors',
    err_dup_names: 'Doppelte Namen', err_too_many_imp_local: 'Zu viele Impostors für diese Spieleranzahl',
    err_generic: 'Fehler',
    language: 'Sprache',
    room: 'Raum', share_code: 'Code teilen',
    players: 'Spieler', impostors: 'Impostors', category: 'Kategorie',
    random: 'Zufällig',
    start_game: 'Spiel starten', waiting_players: 'Warte auf Spieler (mind. 3)',
    waiting_host: 'Warte, bis der Host startet…',
    leave_room: 'Raum verlassen',
    expired: 'Raum existiert nicht oder ist abgelaufen', back_home: 'Zur Startseite',
    loading: 'Lädt…',
    join_title: 'Raum beitreten', already_started: 'Das Spiel hat schon begonnen. Warte auf die nächste Runde.',
    back: 'Zurück', join_btn: 'Beitreten',
    tap_to_see: 'Tippe, um dein Wort zu sehen. Zeige es niemandem!',
    see_my_word: 'Mein Wort sehen',
    you_impostor: 'DU BIST DER IMPOSTOR',
    impostor_hint: 'Tu so, als ob du das Wort kennst. Höre den Hinweisen zu und falle nicht auf.',
    crew_hint: 'Gib einen subtilen Hinweis. Verrate das Wort nicht!',
    hide: 'Verstecken',
    vote_label: 'Stimme für die Person, die du für den Impostor hältst',
    reveal_impostors: 'Impostors aufdecken',
    round_end: 'Runde beendet', word_was: 'Das Wort war:',
    impostor_was: 'Der Impostor war:', impostors_were: 'Die Impostors waren:',
    new_round: 'Neue Runde', new_round_same: 'Neue Runde (gleiche Spieler)',
    waiting_new_round: 'Warte, bis der Host eine neue Runde startet…',
    local_title_part1: 'Handy', local_title_part2: 'Weitergeben',
    local_sub: 'Ein Handy, von Spieler zu Spieler weitergegeben.',
    add_player: '+ Spieler hinzufügen', player_ph: 'Spieler',
    start_match: 'Partie starten',
    pass_to: 'Gib weiter an', pass_warning: 'Nur {name} sollte jetzt auf den Bildschirm schauen.',
    hold_to_see: 'Gedrückt halten, um dein Wort zu sehen',
    next_player: 'Nächster Spieler →', finalize: 'Beenden',
    all_seen: 'Alle haben es gesehen!', who_starts: 'Wer beginnt mit dem Hinweis:',
    hint_round: 'Jeder nennt ein Wort/einen Hinweis zum geheimen Wort, ohne es zu verraten. Diskutiert und findet den Impostor!',
    change_players: 'Spieler ändern',
    progress_of: 'von',
    aura_hint: 'tippen oder ESC drücken zum Beenden',
  },
};

export function getLang() {
  if (typeof window === 'undefined') return 'pt';
  return localStorage.getItem('impostor:lang') || 'pt';
}
export function setLang(l) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('impostor:lang', l);
    window.dispatchEvent(new Event('impostor:lang-change'));
  }
}
export function t(lang, key, vars) {
  let s = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.pt[key] || key;
  if (vars) {
    for (const k of Object.keys(vars)) s = s.replaceAll('{' + k + '}', vars[k]);
  }
  return s;
}

export function useLang() {
  const [lang, setL] = useState('pt');
  useEffect(() => {
    setL(getLang());
    const h = () => setL(getLang());
    window.addEventListener('impostor:lang-change', h);
    return () => window.removeEventListener('impostor:lang-change', h);
  }, []);
  return [lang, (l) => { setLang(l); setL(l); }];
}
