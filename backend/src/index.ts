import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

const PORT = 3000;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: 'http://localhost:5173'}
});

io.on("connection", (socket: Socket) => {
    console.log(`Ocorreu algo!`)

    socket.join('room1')

    socket.on("message", (text: string) => {
        console.log('Mensagem recebida')
        io.to('room1').emit('response', text.toUpperCase());

    })
});


httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`API rodando na porta: ${PORT}`);
});