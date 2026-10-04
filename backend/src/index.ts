import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { makeRoomCode } from './Services/roomService.js';

const PORT = 3000;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: 'http://localhost:5173'}
});

const roomIds = <string[]>[];

io.on("connection", (socket: Socket) => {
    console.log(`Ocorreu algo!`)

    socket.on("join-room", (roomId: string) => {
        console.log(roomIds);
        console.log(roomId);
        console.log(roomIds.includes(roomId));
        if(roomIds.includes(roomId)) {
            socket.join(roomId);
            socket.emit('room-id', roomId);
        }
    })

    socket.on("create-room", () => {
        const roomId = makeRoomCode();
        console.log(`Criando sala com id: ${roomId}`);
        socket.join(roomId);
        socket.emit('room-id', roomId);
        roomIds.push(roomId);
    })


    socket.on("message", ({message, roomId}: {message: string, roomId: string}) => {
        io.to(roomId).emit('message-response', message);
    })
});


httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`API rodando na porta: ${PORT}`);
});