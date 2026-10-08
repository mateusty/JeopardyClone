import type { Player } from '@projeto/shared';
import styles from './PlayerRoster.module.css';

interface PlayerRosterProps {
  players: Player[];
  currentPlayer: string;
  isHost: boolean;
}

export function PlayerRoster({ players, currentPlayer, isHost }: PlayerRosterProps) {
  return (
    <section className={styles.panel} aria-label="Jogadores na partida">
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>SALA AO VIVO</span>
          <h2>Jogadores</h2>
        </div>
        <span className={styles.count}>{players.length}/4</span>
      </div>
      {players.length > 0 ? (
        <ul className={styles.list}>
          {players.map((player) => (
            <li className={styles.player} key={player.id}>
              <span className={styles.avatar}>{player.name.slice(0, 1).toUpperCase()}</span>
              <span className={styles.name}>
                <strong>{player.name}</strong>
                {player.name === currentPlayer && !isHost && <small>Você</small>}
              </span>
              <strong className={styles.score}>{player.points} pts</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.note}>
          {isHost ? 'Aguardando os jogadores entrarem na sala.' : 'Carregando jogadores e pontuações…'}
        </p>
      )}
    </section>
  );
}
