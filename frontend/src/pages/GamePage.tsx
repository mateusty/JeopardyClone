import { useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { PlayerRoster } from '../components/PlayerRoster';
import { useGameSocket } from '../hooks/useGameSocket';
import type { GameRouteState, Question, RoundNumber } from '../types/game';
import styles from './GamePage.module.css';

interface SelectedQuestion {
  question: Question;
  value: number;
}

export function GamePage() {
  const { roomId: roomIdParam } = useParams();
  const location = useLocation();
  const routeState = location.state as GameRouteState | null;
  const { players, question: remoteQuestion, showQuestion, connected } = useGameSocket();
  const [round, setRound] = useState<RoundNumber>(1);
  const [selectedQuestion, setSelectedQuestion] = useState<SelectedQuestion | null>(null);
  const [dismissedSequence, setDismissedSequence] = useState<number | null>(null);
  const setup = routeState?.setup;
  const roomId = routeState?.roomId;
  const playerName = routeState?.playerName;
  const isHost = routeState?.role === 'host';

  const roundColumns = useMemo(
    () => setup?.columns.slice(round === 1 ? 0 : 6, round === 1 ? 6 : 12) ?? [],
    [round, setup],
  );

  const remoteSelectedQuestion = setup && remoteQuestion
    ? roundColumns[remoteQuestion.column - 1]?.questions[remoteQuestion.row]
    : undefined;
  const visibleQuestion = selectedQuestion ?? (
    remoteSelectedQuestion && remoteQuestion?.sequence !== dismissedSequence
      ? { question: remoteSelectedQuestion, value: remoteSelectedQuestion.points * round }
      : null
  );

  if (!roomId || !playerName || roomId !== roomIdParam) return <Navigate to="/" replace />;

  const openQuestion = (columnIndex: number, rowIndex: number, item: Question) => {
    setSelectedQuestion({ question: item, value: item.points * round });
    showQuestion(columnIndex + 1, rowIndex, roomId);
  };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link className={styles.brand} to="/">J<span>eopardy</span></Link>
        <div className={styles.roomCode}><span>CÓDIGO DA SALA</span><strong>{roomId}</strong></div>
        <div className={connected ? styles.connection : styles.disconnected}>
          <span />{connected ? 'Ao vivo' : 'Reconectando'}
        </div>
      </header>

      <section className={styles.gameHeader}>
        <div>
          <span className={styles.kicker}>{isHost ? 'VOCÊ ESTÁ ORGANIZANDO' : 'VOCÊ ESTÁ JOGANDO'}</span>
          <h1>Boa sorte, {playerName}.</h1>
          <p>Escolha uma categoria e uma pontuação para revelar a pergunta.</p>
        </div>
        <div className={styles.roundSwitch} aria-label="Fases da partida">
          <button
            aria-pressed={round === 1}
            className={round === 1 ? styles.activeRound : ''}
            onClick={() => { setRound(1); setSelectedQuestion(null); setDismissedSequence(remoteQuestion?.sequence ?? null); }}
            type="button"
          >
            Fase 1 <small>Normal</small>
          </button>
          <button
            aria-pressed={round === 2}
            className={round === 2 ? styles.activeRound : ''}
            onClick={() => { setRound(2); setSelectedQuestion(null); setDismissedSequence(remoteQuestion?.sequence ?? null); }}
            type="button"
          >
            Fase 2 <small>Dobro</small>
          </button>
        </div>
      </section>

      <div className={styles.layout}>
        <section className={styles.boardSection} aria-label={`Tabuleiro da fase ${round}`}>
          <div className={styles.boardTitle}>
            <h2>Fase {round}</h2>
            <span>{round === 1 ? 'PONTUAÇÃO NORMAL' : 'PONTUAÇÃO EM DOBRO'}</span>
          </div>
          {setup ? (
            <div className={styles.board}>
              {roundColumns.map((column, columnIndex) => (
                <div className={styles.column} key={`${round}-${column.theme}`}>
                  <h3>{column.theme}</h3>
                  {column.questions.map((item, rowIndex) => (
                    <button
                      className={styles.questionCard}
                      key={item.id}
                      onClick={() => openQuestion(columnIndex, rowIndex, item)}
                      type="button"
                    >
                      {item.points * round}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyBoard}>
              <span aria-hidden="true">✳</span>
              <h3>O tabuleiro ainda não foi compartilhado</h3>
              <p>O servidor atual não envia a configuração do organizador para os outros jogadores. Peça para o organizador abrir o tabuleiro neste dispositivo ou sincronize a partida pelo backend.</p>
            </div>
          )}
        </section>

        <aside className={styles.sidebar}>
          <PlayerRoster players={players} currentPlayer={playerName} isHost={isHost} />
          <div className={styles.gameInfo}>
            <span className={styles.infoIcon} aria-hidden="true">i</span>
            <p>São 6 temas por fase e 5 perguntas por tema. Na fase 2, cada pergunta vale o dobro.</p>
          </div>
        </aside>
      </div>

      {visibleQuestion && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onClick={() => {
            setSelectedQuestion(null);
            setDismissedSequence(remoteQuestion?.sequence ?? null);
          }}
        >
          <section
            aria-labelledby="question-title"
            aria-modal="true"
            className={styles.questionModal}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button
              aria-label="Fechar pergunta"
              className={styles.closeButton}
              onClick={() => {
                setSelectedQuestion(null);
                setDismissedSequence(remoteQuestion?.sequence ?? null);
              }}
              type="button"
            >×</button>
            <span className={styles.questionCategory}>{visibleQuestion.question.theme} · {visibleQuestion.value} PONTOS</span>
            <h2 id="question-title">{visibleQuestion.question.body}</h2>
            {visibleQuestion.question.mediaUrl && visibleQuestion.question.mediaType === 'image' && (
              <img className={styles.media} alt="" src={visibleQuestion.question.mediaUrl} />
            )}
            {visibleQuestion.question.mediaUrl && visibleQuestion.question.mediaType === 'video' && (
              <video className={styles.media} controls src={visibleQuestion.question.mediaUrl} />
            )}
            <details className={styles.answer}>
              <summary>Revelar resposta</summary>
              <p>{visibleQuestion.question.answer}</p>
            </details>
          </section>
        </div>
      )}
    </main>
  );
}
