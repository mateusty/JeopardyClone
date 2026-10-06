import type { Player } from '@projeto/shared';
import styles from './PlayerRoster.module.css';

interface PlayerRosterProps {
  players: Player[];
  currentPlayer: string;
  isHost: boolean;
}

export function PlayerRoster({ players, currentPlayer, isHost }: PlayerRosterProps) {
  const roster = players.length > 0
    ? players
    : [{ id: 'current-player', name: currentPlayer, points: 0 }];

  return (
    <section className={styles.panel} aria-label="Jogadores na partida">
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>SALA AO VIVO</span>
          <h2>Jogadores</h2>
        </div>
        <span className={styles.count}>{roster.length}/4</span>
      </div>
      <ul className={styles.list}>
        {roster.map((player, index) => (
          <li className={styles.player} key={player.id}>
            <span className={styles.avatar}>{player.name.slice(0, 1).toUpperCase()}</span>
            <span className={styles.name}>
              <strong>{player.name}</strong>
              {index === 0 && isHost && <small>Organizador</small>}
              {player.name === currentPlayer && !isHost && <small>Você</small>}
            </span>
            <strong className={styles.score}>{player.points} pts</strong>
          </li>
        ))}
      </ul>
      <p className={styles.note}>A lista completa depende da sincronização de participantes do servidor.</p>
    </section>
  );
}
