import { createContext } from 'react';
import type { Player, Question } from '@projeto/shared';

export interface SocketContextValue {
  connected: boolean;
  roomId: string | null;
  roomMasterName: string | null;
  players: Player[];
  questions: Question[];
  question: { questionIndex: number; sequence: number } | null;
  isFinalStage: boolean | null;
  buzzerBlocked: boolean;
  expectingAnswer: boolean;
  answerRevealed: boolean;
  buzzedPlayerName: string | null;
  connectionError: string | null;
  joinError: string | null;
  questionsError: string | null;
  createRoom: (roomMasterName: string) => void;
  joinRoom: (roomId: string, playerName: string) => void;
  removePlayer: (playerName: string, roomId: string) => void;
  showQuestion: (questionIndex: number, roomId: string) => void;
  sendQuestions: (questions: Question[], roomId: string) => void;
  hideQuestion: (roomId: string) => void;
  buzz: (roomId: string) => void;
  revealAnswer: (roomId: string, questionIndex: number) => void;
  handleAnswer: (playerId: string, roomId: string, isCorrect: boolean, questionValue: number) => void;
  updateScores: (roomId: string) => void;
  nextStage: (roomId: string) => void;
  requestStage: (roomId: string) => void;
  getRoomMaster: (roomId: string) => void;
}

export const SocketContext = createContext<SocketContextValue | null>(null);
