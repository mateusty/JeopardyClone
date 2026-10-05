import { createServer } from 'http';
import { app } from './app.js';
import { createIo } from './socket/io.js';
import { registerSocketHandlers } from './socket/handlers.js';
import questionRoute from "./routes/questionRoutes.js";

const PORT = 3000;

const httpServer = createServer(app);
const io = createIo(httpServer);

registerSocketHandlers(io);

app.use("/questions", questionRoute)

httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`API rodando na porta: ${PORT}`);
});

// Validação de requisição com ZOD;