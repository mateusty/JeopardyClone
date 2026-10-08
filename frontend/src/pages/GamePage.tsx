import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { PlayerRoster } from '../components/PlayerRoster';
import { useGameSocket } from '../hooks/useGameSocket';
import type { GameRouteState, Question, RoundNumber } from '../types/game';
import styles from './GamePage.module.css';

interface YouTubeAudioProps {
  mediaUrl: string;
  title: string;
}

function getYouTubeEmbedUrl(mediaUrl: string): string | null {
  try {
    const url = new URL(mediaUrl);
    const isYouTubeHost = url.hostname === 'youtube.com'
      || url.hostname === 'www.youtube.com'
      || url.hostname === 'm.youtube.com'
      || url.hostname === 'youtube-nocookie.com'
      || url.hostname === 'www.youtube-nocookie.com'
      || url.hostname === 'youtu.be';
    if (!isYouTubeHost) return null;

    const videoId = url.hostname === 'youtu.be'
      ? url.pathname.slice(1)
      : url.searchParams.get('v') ?? url.pathname.match(/\/(?:embed|shorts)\/([^/]+)/)?.[1];
    if (!videoId || !/^[\w-]{11}$/.test(videoId)) return null;
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=0&mute=0&playsinline=1&rel=0`;
  } catch {
    return null;
  }
}

function YouTubeAudio({ mediaUrl, title }: YouTubeAudioProps) {
  const [playbackAttempt, setPlaybackAttempt] = useState(0);
  const embedUrl = getYouTubeEmbedUrl(mediaUrl);

  if (!embedUrl) {
    return <p className={styles.mediaError}>O link de áudio do YouTube não é válido.</p>;
  }

  return (
    <div className={styles.audioOnly}>
      <iframe
        key={playbackAttempt}
        className={styles.audioOnlyPlayer}
        src={embedUrl}
        title={title}
        allow="autoplay; encrypted-media"
        tabIndex={-1}
      />
      <button
        className={styles.audioFallback}
        onClick={() => setPlaybackAttempt((attempt) => attempt + 1)}
        type="button"
      >
        Se o áudio não começou, toque para reproduzir
      </button>
    </div>
  );
}

export function GamePage() {
  const { roomId: roomIdParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as GameRouteState | null;
  const {
    players,
    roomMasterName,
    questions,
    question: remoteQuestion,
    showQuestion,
    removePlayer,
    connected,
    isFinalStage,
    buzzerBlocked,
    expectingAnswer,
    answerRevealed,
    buzzedPlayerName,
    questionsError,
    buzz,
    revealAnswer,
    hideQuestion,
    handleAnswer,
    updateScores,
    nextStage,
    requestStage,
    getRoomMaster,
  } = useGameSocket();
  const round: RoundNumber = isFinalStage ? 2 : 1;
  const receivedSetup = useMemo(() => {
    if (questions.length === 0) return undefined;
    const columnsByTheme = new Map<string, Question[]>();
    for (const question of questions) {
      const column = columnsByTheme.get(question.theme) ?? [];
      column.push(question);
      columnsByTheme.set(question.theme, column);
    }
    return [...columnsByTheme].map(([theme, columnQuestions]) => ({
      theme,
      questions: columnQuestions,
    }));
  }, [questions]);
  const setup = useMemo(() => (receivedSetup ? {
    roomId: roomIdParam ?? '',
    hostName: '',
    columns: receivedSetup,
  } : routeState?.setup), [receivedSetup, roomIdParam, routeState?.setup]);
  const roomId = routeState?.roomId;
  const playerName = routeState?.playerName;
  const isHost = routeState?.role === 'host';

  useEffect(() => {
    if (!roomId) return;
    requestStage(roomId);
    updateScores(roomId);
    getRoomMaster(roomId);
  }, [getRoomMaster, requestStage, roomId, updateScores]);

  const roundColumns = useMemo(
    () => setup?.columns.slice(round === 1 ? 0 : 5, round === 1 ? 5 : 10) ?? [],
    [round, setup],
  );

  const flatQuestions = setup?.columns.flatMap((column) => column.questions) ?? [];
  const remoteSelectedQuestion = remoteQuestion
    ? flatQuestions[remoteQuestion.questionIndex]
    : undefined;
  const visibleQuestion = remoteSelectedQuestion
    ? {
        question: remoteSelectedQuestion,
        value: remoteSelectedQuestion.points * round,
        questionIndex: remoteQuestion?.questionIndex ?? -1,
      }
    : null;
  const buzzerDisabled = !roomId || !connected || !visibleQuestion || buzzerBlocked || expectingAnswer;
  const pressBuzzer = useCallback(() => {
    if (!buzzerDisabled && roomId) buzz(roomId);
  }, [buzz, buzzerDisabled, roomId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat || buzzerDisabled) return;
      const target = event.target;
      if (target instanceof HTMLElement
        && target.closest('button, a, input, textarea, select, [contenteditable="true"], [role="button"]')) {
        return;
      }
      event.preventDefault();
      pressBuzzer();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buzzerDisabled, pressBuzzer]);

  if (!roomId || !playerName || roomId !== roomIdParam) return <Navigate to="/" replace />;

  const openQuestion = (item: Question) => {
    const questionIndex = flatQuestions.findIndex((question) => question.id === item.id);
    if (questionIndex < 0) return;
    showQuestion(questionIndex, roomId);
  };

  const leaveGame = () => {
    removePlayer(playerName, roomId);
    navigate('/');
  };

  const judgeAnswer = (isCorrect: boolean) => {
    if (!buzzedPlayerName || !visibleQuestion) return;
    const answeringPlayer = players.find((player) => player.name === buzzedPlayerName);
    if (!answeringPlayer) return;
    handleAnswer(answeringPlayer.id, roomId, isCorrect, visibleQuestion.value);
  };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.gameIdentity}>
          <Link className={styles.brand} to="/">Jeopardy</Link>
          {roomMasterName && <span className={styles.masterName}>Organizador: {roomMasterName}</span>}
        </div>
        <div className={styles.sessionControls}>
          <div className={styles.roomCode}><span>CÓDIGO DA SALA</span><strong>{roomId}</strong></div>
          <div className={connected ? styles.connection : styles.disconnected}>
            <span />{connected ? 'Ao vivo' : 'Reconectando'}
          </div>
          <button className={styles.leaveButton} onClick={leaveGame} type="button">Sair</button>
        </div>
      </header>

      <section className={styles.gameHeader}>
        <div className={styles.roundSwitch} aria-label="Fases da partida">
          <button
            aria-pressed={round === 1}
            className={round === 1 ? styles.activeRound : ''}
            disabled
            type="button"
          >
            Fase 1 <small>Normal</small>
          </button>
          <button
            aria-pressed={round === 2}
            className={round === 2 ? styles.activeRound : ''}
            disabled={!isHost || round === 2 || isFinalStage === null}
            onClick={() => roomId && nextStage(roomId)}
            type="button"
          >
            Fase 2 <small>{round === 2 ? 'Ativa' : 'Dobro'}</small>
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
              {roundColumns.map((column) => (
                <div className={styles.column} key={`${round}-${column.theme}`}>
                  <h3>{column.theme}</h3>
                  {column.questions.map((item) => (
                    isHost ? (
                      <button
                        className={styles.questionCard}
                        disabled={item.alreadyShown === true}
                        key={item.id}
                        onClick={() => openQuestion(item)}
                        type="button"
                      >
                        {item.points * round}
                      </button>
                    ) : (
                      <div
                        aria-label={`${item.points * round} pontos${item.alreadyShown ? ', questão respondida' : ''}`}
                        className={`${styles.questionCard} ${item.alreadyShown ? styles.questionUsed : ''}`}
                        key={item.id}
                      >
                        {item.points * round}
                      </div>
                    )
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyBoard}>
              <span aria-hidden="true">✳</span>
              <h3>{questionsError ? 'Não foi possível carregar o tabuleiro' : 'O tabuleiro ainda não foi compartilhado'}</h3>
              <p>{questionsError ?? 'O servidor ainda não enviou as perguntas desta partida. Aguarde o organizador configurar o tabuleiro.'}</p>
            </div>
          )}
        </section>

        <aside className={styles.sidebar}>
          <PlayerRoster players={players} currentPlayer={playerName} isHost={isHost} />
          <div className={styles.gameInfo}>
            <span className={styles.infoIcon} aria-hidden="true">i</span>
            <p>São 5 temas por fase e 5 perguntas por tema. Na fase 2, cada pergunta vale o dobro.</p>
          </div>
        </aside>
      </div>

      {!isHost && (
        <div className={styles.buzzerDock}>
          <button
            aria-keyshortcuts="Space"
            className={styles.buzzButton}
            disabled={buzzerDisabled}
            onClick={pressBuzzer}
            type="button"
          >
            {!connected
              ? 'Reconectando…'
              : !visibleQuestion
                ? 'Aguardando pergunta'
                : expectingAnswer
                  ? 'Você responde agora'
                  : buzzerBlocked
                    ? 'Buzzer bloqueado'
                    : 'Apertar o buzzer · Espaço'}
          </button>
        </div>
      )}

      {visibleQuestion && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
        >
          <section
            aria-labelledby="question-title"
            aria-modal="true"
            className={`${styles.questionModal} ${!isHost ? styles.questionModalWithBuzzer : ''}`}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <span className={styles.questionCategory}>{visibleQuestion.question.theme} · {visibleQuestion.value} PONTOS</span>
            <h2 id="question-title">{visibleQuestion.question.body}</h2>
            <div className={styles.buzzerControls}>
              {isHost && (
                <>
                  <button
                    className={styles.revealButton}
                    disabled={answerRevealed}
                    onClick={() => revealAnswer(roomId, visibleQuestion.questionIndex)}
                    type="button"
                  >
                    {answerRevealed ? 'Resposta revelada' : 'Revelar resposta'}
                  </button>
                  <button
                    className={styles.hideQuestionButton}
                    onClick={() => hideQuestion(roomId)}
                    type="button"
                  >
                    Encerrar pergunta
                  </button>
                </>
              )}
            </div>
            {isHost && (
              <section className={styles.judgingPanel} aria-label="Avaliar resposta">
              <strong>
                {buzzedPlayerName
                  ? `${buzzedPlayerName} apertou o buzzer`
                  : 'Aguardando alguém apertar o buzzer'}
              </strong>
              <div>
                <button
                  className={styles.correctButton}
                  disabled={!buzzedPlayerName || !buzzerBlocked}
                    onClick={() => judgeAnswer(true)}
                    type="button"
                  >Correta</button>
                  <button
                    className={styles.incorrectButton}
                    disabled={!buzzedPlayerName || !buzzerBlocked}
                    onClick={() => judgeAnswer(false)}
                    type="button"
                  >Incorreta</button>
                </div>
                {!buzzedPlayerName && <p>A avaliação fica disponível depois que um jogador apertar o buzzer.</p>}
              </section>
            )}
            {visibleQuestion.question.mediaUrl && visibleQuestion.question.mediaType === 'IMAGE' && (
              <img className={styles.media} alt="" src={visibleQuestion.question.mediaUrl} />
            )}
            {visibleQuestion.question.mediaUrl && visibleQuestion.question.mediaType === 'AUDIO' && (
              <audio className={styles.media} controls src={visibleQuestion.question.mediaUrl} />
            )}
            {visibleQuestion.question.mediaUrl && visibleQuestion.question.mediaType === 'YOUTUBE' && (
              <YouTubeAudio
                key={`${visibleQuestion.question.id}-${remoteQuestion?.sequence ?? 0}`}
                mediaUrl={visibleQuestion.question.mediaUrl}
                title={`Áudio da questão: ${visibleQuestion.question.theme}`}
              />
            )}
            {answerRevealed && (
              <div className={styles.answer}>
                <strong>Resposta</strong>
                <p>{visibleQuestion.question.answer}</p>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
