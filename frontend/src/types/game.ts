import type { Question } from '@projeto/shared';

export type { Question } from '@projeto/shared';

export interface GameColumn {
  theme: string;
  questions: Question[];
}

export interface GameSetup {
  roomId: string;
  hostName: string;
  columns: GameColumn[];
}

export interface GameRouteState {
  roomId: string;
  playerName: string;
  role: 'host' | 'player';
  setup?: GameSetup;
}

export type RoundNumber = 1 | 2;
