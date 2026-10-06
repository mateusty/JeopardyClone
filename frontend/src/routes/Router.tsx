import { Navigate, Route, Routes } from 'react-router-dom';
import { GamePage } from '../pages/GamePage';
import { HostSetupPage } from '../pages/HostSetupPage';
import { LobbyPage } from '../pages/LobbyPage';

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<LobbyPage />} />
      <Route path="/host/setup" element={<HostSetupPage />} />
      <Route path="/game/:roomId" element={<GamePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
