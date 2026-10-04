import { createServer } from 'http';
import { app } from './app.js';
import { createIo } from './socket/io.js';
import { registerSocketHandlers } from './socket/handlers.js';

const PORT = 3000;

const httpServer = createServer(app);
const io = createIo(httpServer);

registerSocketHandlers(io);

httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`API rodando na porta: ${PORT}`);
});

// Separar as responsabilidades;
// persistencia de dados;
// Perguntas e Temas;
// Perguntas: Tema, Valor, Pergunta;
// ORM prisma;
// Validação de requisição com ZOD;