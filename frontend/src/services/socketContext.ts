import { createContext } from 'react';
import type { Player } from '@projeto/shared';

export interface SocketContextValue {
  connected: boolean;
  roomId: string | null;
  players: Player[];
  question: { column: number; row: number; sequence: number } | null;
  connectionError: string | null;
  createRoom: () => void;
  joinRoom: (roomId: string, playerName: string) => void;
  showQuestion: (column: number, row: number, roomId: string) => void;
}

export const SocketContext = createContext<SocketContextValue | null>(null);
