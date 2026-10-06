import { useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useQuestionCatalog } from '../hooks/useQuestionCatalog';
import type { GameColumn, GameSetup } from '../types/game';
import styles from './HostSetupPage.module.css';

interface HostRouteState {
  roomId?: string;
  playerName?: string;
}

export function HostSetupPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as HostRouteState | null;
  const roomId = routeState?.roomId;
  const hostName = routeState?.playerName?.trim();
  const { questions, isLoading, error } = useQuestionCatalog();
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
      if (current.length >= 12) return current;
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

    if (columns.length !== 12 || columns.some((column) => column.questions.length !== 5)) return;

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
        <span className={styles.kicker}>CONFIGURAÇÃO DA PARTIDA</span>
        <h1>Monte seu tabuleiro</h1>
        <p>Escolha 12 temas. Cada tema precisa ter cinco perguntas para preencher as duas fases.</p>
      </section>

      <section className={styles.rules} aria-label="Regras do tabuleiro">
        <div><span>01</span><strong>12 temas</strong><small>6 em cada fase</small></div>
        <div><span>02</span><strong>5 perguntas</strong><small>por tema</small></div>
        <div><span>03</span><strong>Pontos em dobro</strong><small>na segunda fase</small></div>
      </section>

      <div className={styles.sectionHeading}>
        <div>
          <h2>Temas disponíveis</h2>
          <p>Os temas sem cinco perguntas completas não podem ser selecionados.</p>
        </div>
        <span className={selectedThemes.length === 12 ? styles.complete : styles.counter}>
          {selectedThemes.length}<span>/12</span>
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
            const atLimit = selectedThemes.length === 12 && !selected;
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

      {selectedThemes.length === 12 && (
        <div className={styles.phasePreview}>
          <div><span>FASE 1</span><strong>6 temas · pontos normais</strong></div>
          <div><span>FASE 2</span><strong>6 temas · pontos dobrados</strong></div>
        </div>
      )}

      <footer className={styles.footer}>
        <button className={styles.backButton} onClick={() => navigate('/')} type="button">Voltar</button>
        <button
          className={styles.startButton}
          disabled={selectedThemes.length !== 12}
          onClick={startGame}
          type="button"
        >
          Ir para o tabuleiro <span aria-hidden="true">↗</span>
        </button>
      </footer>
      <p className={styles.notice}>
        A configuração é aplicada neste navegador. Para compartilhá-la com os demais jogadores, o servidor precisa
        receber e transmitir o tabuleiro.
      </p>
    </main>
  );
}
