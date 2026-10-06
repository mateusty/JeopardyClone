import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameSocket } from '../hooks/useGameSocket';
import type { GameRouteState } from '../types/game';
import styles from './LobbyPage.module.css';

export function LobbyPage() {
  const navigate = useNavigate();
  const { connected, roomId, connectionError, createRoom, joinRoom } = useGameSocket();
  const [hostName, setHostName] = useState('');
  const [joinName, setJoinName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [pending, setPending] = useState<'create' | 'join' | null>(null);
  const [feedback, setFeedback] = useState('');
  const timeoutRef = useRef<number | null>(null);
  const handledRoomId = useRef<string | null>(null);

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
    if (!pending || !connected) return;
    timeoutRef.current = window.setTimeout(() => {
      setFeedback('A sala não confirmou a solicitação. Confira o código e tente novamente.');
      setPending(null);
    }, 8000);
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, [connected, pending]);

  const createGame = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hostName.trim()) return;
    setFeedback('');
    handledRoomId.current = null;
    setPending('create');
    createRoom();
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
      <header className={styles.brand}>
        <span className={styles.mark}>J</span>
        <span>JEOPARDY<span className={styles.brandAccent}>.CLUB</span></span>
      </header>

      <section className={styles.hero}>
        <span className={styles.kicker}>CONHECIMENTO EM JOGO</span>
        <h1>Uma boa resposta<br /><em>muda tudo.</em></h1>
        <p>Reúna seus amigos para uma disputa de perguntas, estratégia e boas histórias.</p>
      </section>

      <div className={styles.content}>
        <form className={styles.card} onSubmit={createGame}>
          <span className={styles.step}>01 — NOVA PARTIDA</span>
          <h2>Crie sua sala</h2>
          <p>Você escolhe os temas e organiza o tabuleiro.</p>
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
          <button className={styles.primaryButton} disabled={!connected || pending !== null} type="submit">
            {pending === 'create' ? 'Criando sala…' : 'Criar partida'} <span aria-hidden="true">↗</span>
          </button>
        </form>

        <form className={styles.card} onSubmit={enterGame}>
          <span className={styles.step}>02 — JÁ TEM UM CONVITE?</span>
          <h2>Entre na sala</h2>
          <p>Digite o código de quatro letras enviado pelo organizador.</p>
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
            maxLength={4}
            placeholder="ABCD"
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value.replace(/[^a-z]/gi, ''))}
            required
          />
          <button className={styles.secondaryButton} disabled={!connected || pending !== null} type="submit">
            {pending === 'join' ? 'Entrando…' : 'Entrar na partida'} <span aria-hidden="true">→</span>
          </button>
        </form>
      </div>
      <footer className={styles.footer}>
        <span className={connected ? styles.online : styles.offline} />
        {connected ? 'Conectado à sala de jogos' : connectionError ?? 'Conectando à sala de jogos…'}
        {feedback && <span className={styles.feedback} role="alert">{feedback}</span>}
      </footer>
    </main>
  );
}
