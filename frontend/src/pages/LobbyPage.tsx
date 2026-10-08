import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGameSocket } from '../hooks/useGameSocket';
import type { GameRouteState } from '../types/game';
import styles from './LobbyPage.module.css';

export function LobbyPage() {
  const navigate = useNavigate();
  const { connected, roomId, connectionError, joinError, createRoom, joinRoom } = useGameSocket();
  const [hostName, setHostName] = useState('');
  const [joinName, setJoinName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [pending, setPending] = useState<'create' | 'join' | null>(null);
  const [feedback, setFeedback] = useState('');
  const timeoutRef = useRef<number | null>(null);
  const handledRoomId = useRef<string | null>(null);
  const requestPending = pending !== null && !(pending === 'join' && joinError !== null);

  useEffect(() => {
    if (!roomId || !pending || handledRoomId.current === roomId) return;
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    handledRoomId.current = roomId;

    if (pending === 'create') {
      navigate('/host/setup', { state: { roomId, playerName: hostName.trim() } });
    } else {
      const state: GameRouteState = { roomId, playerName: joinName.trim(), role: 'player' };
      navigate(`/game/${roomId}`, { state });
    }
  }, [hostName, joinName, navigate, pending, roomId]);

  useEffect(() => {
    if (!pending || !connected || (pending === 'join' && joinError)) return;
    timeoutRef.current = window.setTimeout(() => {
      setFeedback('A sala não confirmou a solicitação. Confira o código e tente novamente.');
      setPending(null);
    }, 8000);
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, [connected, joinError, pending]);

  const createGame = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hostName.trim()) return;
    setFeedback('');
    handledRoomId.current = null;
    setPending('create');
    createRoom(hostName.trim());
  };

  const enterGame = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!joinName.trim() || roomCode.trim().length !== 4) return;
    setFeedback('');
    handledRoomId.current = null;
    setPending('join');
    joinRoom(roomCode.trim(), joinName.trim());
  };

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.brand}>
          <span>Jeopardy</span>
        </div>
        <Link className={styles.manageLink} to="/questions">Gerenciar perguntas</Link>
      </header>

      <section className={styles.hero}>
        <h1>Partidas</h1>
      </section>

      <div className={styles.content}>
        <form className={styles.card} onSubmit={createGame}>
          <h2>Crie sua sala</h2>
          <label htmlFor="create-name">Seu nome</label>
          <input
            id="create-name"
            autoComplete="name"
            maxLength={24}
            placeholder="Como podemos te chamar?"
            value={hostName}
            onChange={(event) => setHostName(event.target.value)}
            required
          />
          <button className={styles.primaryButton} disabled={!connected || requestPending} type="submit">
            {pending === 'create' ? 'Criando sala…' : 'Criar partida'} <span aria-hidden="true">↗</span>
          </button>
        </form>

        <form className={styles.card} onSubmit={enterGame}>
          <h2>Entre na sala</h2>
          <p>O código diferencia maiúsculas e minúsculas.</p>
          <label htmlFor="join-name">Seu nome</label>
          <input
            id="join-name"
            autoComplete="name"
            maxLength={24}
            placeholder="Como podemos te chamar?"
            value={joinName}
            onChange={(event) => setJoinName(event.target.value)}
            required
          />
          <label htmlFor="room-code">Código da sala</label>
          <input
            id="room-code"
            className={styles.codeInput}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            maxLength={4}
            placeholder="aBcD"
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value.replace(/[^a-z]/gi, ''))}
            required
          />
          <button className={styles.secondaryButton} disabled={!connected || requestPending} type="submit">
            {pending === 'join' && !joinError ? 'Entrando…' : 'Entrar na partida'} <span aria-hidden="true">→</span>
          </button>
        </form>
      </div>
      <footer className={styles.footer}>
        <span className={connected ? styles.online : styles.offline} />
        {connected ? 'Conectado' : connectionError ?? 'Conectando…'}
        {(pending === 'join' ? joinError : null) && (
          <span className={styles.feedback} role="alert">{joinError}</span>
        )}
        {feedback && <span className={styles.feedback} role="alert">{feedback}</span>}
      </footer>
    </main>
  );
}
