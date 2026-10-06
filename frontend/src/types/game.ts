export interface Question {
  id: string;
  theme: string;
  points: number;
  body: string;
  answer: string;
  mediaType: string | null;
  mediaUrl: string | null;
}

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
