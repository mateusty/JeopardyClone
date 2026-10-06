import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, Player, ServerToClientEvents } from '@projeto/shared';
import { SocketContext, type SocketContextValue } from './socketContext';

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000',
  { autoConnect: false },
);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(socket.connected);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [question, setQuestion] = useState<{ column: number; row: number; sequence: number } | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const questionSequence = useRef(0);

  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
      setConnectionError(null);
    };
    const onDisconnect = () => setConnected(false);
    const onConnectError = (error: Error) => {
      setConnected(false);
      setConnectionError(`Não foi possível conectar ao servidor: ${error.message}`);
    };
    const onRoomId = (id: string) => setRoomId(id);
    const onScores = (updatedPlayers: Player[]) => setPlayers(updatedPlayers);
    const onQuestion = (selected: { column: number; row: number }) => {
      questionSequence.current += 1;
      setQuestion({ ...selected, sequence: questionSequence.current });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('room-id', onRoomId);
    socket.on('update-scores', onScores);
    socket.on('show-question', onQuestion);
    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('room-id', onRoomId);
      socket.off('update-scores', onScores);
      socket.off('show-question', onQuestion);
      socket.disconnect();
    };
  }, []);

  const value = useMemo<SocketContextValue>(() => ({
    connected,
    roomId,
    players,
    question,
    connectionError,
    createRoom: () => {
      setRoomId(null);
      socket.emit('create-room');
    },
    joinRoom: (id, playerName) => {
      setRoomId(null);
      socket.emit('join-room', id, playerName);
    },
    showQuestion: (column, row, id) => socket.emit('show-question', { column, row, roomId: id }),
  }), [connected, roomId, players, question, connectionError]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
