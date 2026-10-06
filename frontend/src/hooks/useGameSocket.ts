import { useContext } from 'react';
import { SocketContext } from '../services/socketContext';

export function useGameSocket() {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useGameSocket precisa ser usado dentro de SocketProvider.');
  return context;
}
