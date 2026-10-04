import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = 3000;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: 'http://localhost:5173'}
});

io.on("connection", (socket) => {
    console.log(`Ocorreu algo!`)
});

httpServer.listen(PORT, () => {
    console.log(`API rodando na porta: ${PORT}`);
});