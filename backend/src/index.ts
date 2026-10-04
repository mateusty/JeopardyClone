import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { makeRoomCode } from './Services/roomService.js';

const PORT = 3000;

const roomIds = <string[]>[];
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: 'http://localhost:5173'}
});

io.on("connection", (socket: Socket) => {
    console.log(`Ocorreu algo!`)

    socket.on("create-room", () => {
        const roomId = makeRoomCode();
        console.log(`Criando sala com id: ${roomId}`);
        socket.join(roomId);
        socket.emit('room-id', roomId);
        roomIds.push(roomId);
    })

    socket.on("request-rooms", () => {
        console.log(roomIds)
        socket.emit('room-ids', roomIds);
    })
});


httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`API rodando na porta: ${PORT}`);
});