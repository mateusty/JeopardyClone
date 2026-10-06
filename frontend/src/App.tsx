import { BrowserRouter } from 'react-router-dom';
import { Router } from './routes/Router';
import { SocketProvider } from './services/socket';

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <Router />
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;
