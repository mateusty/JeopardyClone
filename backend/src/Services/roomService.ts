import type { Message } from "@projeto/shared";
import type { Socket } from "socket.io";
import type { IoServer } from "../socket/io.js";

const roomIds = new Set<string>();

function makeid(length: number) {
    var result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

export function makeRoomCode() {
    return makeid(4);
}

export function createRoom(socket: Socket) {
    const roomId = makeRoomCode();
    console.log(`Criando sala com id: ${roomId}`)
    socket.join(roomId);
    socket.emit('room-id', roomId);
    roomIds.add(roomId);
}

export function joinRoom(socket: Socket, roomId: string) {
    if(roomIds.has(roomId)) {
        socket.join(roomId);
        socket.emit('room-id', roomId);
    }
}

export function sendMessage(io: IoServer, message: Message) {
    io.to(message.roomId).emit('message-response', {message: message.message});
}