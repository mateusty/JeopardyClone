import { useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useQuestionCatalog } from '../hooks/useQuestionCatalog';
import { useGameSocket } from '../hooks/useGameSocket';
import type { GameColumn, GameSetup } from '../types/game';
import styles from './HostSetupPage.module.css';

interface HostRouteState {
  roomId?: string;
  playerName?: string;
}

export function HostSetupPage() {
  const themesPerPhase = 5;
  const totalThemes = themesPerPhase * 2;
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as HostRouteState | null;
  const roomId = routeState?.roomId;
  const hostName = routeState?.playerName?.trim();
  const { questions, isLoading, error } = useQuestionCatalog();
  const { sendQuestions } = useGameSocket();
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

  const themes = useMemo(() => {
    const questionsByTheme = new Map<string, number>();
    for (const question of questions) {
      questionsByTheme.set(question.theme, (questionsByTheme.get(question.theme) ?? 0) + 1);
    }
    return [...questionsByTheme.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((first, second) => first.name.localeCompare(second.name, 'pt-BR'));
  }, [questions]);

  if (!roomId || !hostName) return <Navigate to="/" replace />;

  const toggleTheme = (theme: string) => {
    setSelectedThemes((current) => {
      if (current.includes(theme)) return current.filter((selected) => selected !== theme);
      if (current.length >= totalThemes) return current;
      return [...current, theme];
    });
  };

  const startGame = () => {
    const columns: GameColumn[] = selectedThemes.map((theme) => ({
      theme,
      questions: questions
        .filter((question) => question.theme === theme)
        .sort((first, second) => first.points - second.points)
        .slice(0, 5),
    }));

    if (columns.length !== totalThemes || columns.some((column) => column.questions.length !== 5)) return;

    sendQuestions(columns.flatMap((column) => column.questions), roomId);
    const setup: GameSetup = { roomId, hostName, columns };
    navigate(`/game/${roomId}`, {
      state: { roomId, playerName: hostName, role: 'host', setup },
    });
  };

  const eligibleThemes = themes.filter((theme) => theme.count >= 5);

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link className={styles.brand} to="/">J<span>eopardy</span></Link>
        <div className={styles.roomBadge}>SALA <strong>{roomId}</strong></div>
      </header>

      <section className={styles.intro}>
        <h1>Monte seu tabuleiro</h1>
        <p>Selecione 10 temas, com 5 perguntas em cada tema.</p>
      </section>

      <section className={styles.rules} aria-label="Regras do tabuleiro">
        <div><strong>Fase 1</strong><small>5 temas · pontos normais</small></div>
        <div><strong>Fase 2</strong><small>5 temas · pontos dobrados</small></div>
      </section>

      <div className={styles.sectionHeading}>
        <div>
          <h2>Temas disponíveis</h2>
          <p>Temas com menos de 5 perguntas não podem ser selecionados.</p>
        </div>
        <span className={selectedThemes.length === totalThemes ? styles.complete : styles.counter}>
          {selectedThemes.length}<span>/{totalThemes}</span>
        </span>
      </div>

      {isLoading && <p className={styles.status}>Carregando temas e perguntas…</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
      {!isLoading && !error && eligibleThemes.length === 0 && (
        <p className={styles.error}>Ainda não há temas com cinco perguntas cadastradas.</p>
      )}

      {!isLoading && !error && (
        <div className={styles.themeGrid}>
          {themes.map(({ name, count }) => {
            const selected = selectedThemes.includes(name);
            const unavailable = count < 5;
            const atLimit = selectedThemes.length === totalThemes && !selected;
            return (
              <button
                aria-pressed={selected}
                className={`${styles.theme} ${selected ? styles.selected : ''}`}
                disabled={unavailable || atLimit}
                key={name}
                onClick={() => toggleTheme(name)}
                type="button"
              >
                <span className={styles.checkbox}>{selected ? '✓' : ''}</span>
                <span className={styles.themeName}>{name}</span>
                <span className={styles.questionCount}>{count} questões</span>
              </button>
            );
          })}
        </div>
      )}

      {selectedThemes.length === totalThemes && (
        <div className={styles.phasePreview}>
          <div><span>FASE 1</span><strong>{themesPerPhase} temas · pontos normais</strong></div>
          <div><span>FASE 2</span><strong>{themesPerPhase} temas · pontos dobrados</strong></div>
        </div>
      )}

      <footer className={styles.footer}>
        <button className={styles.backButton} onClick={() => navigate('/')} type="button">Voltar</button>
        <button
          className={styles.startButton}
          disabled={selectedThemes.length !== totalThemes}
          onClick={startGame}
          type="button"
        >
          Ir para o tabuleiro <span aria-hidden="true">↗</span>
        </button>
      </footer>
    </main>
  );
}
