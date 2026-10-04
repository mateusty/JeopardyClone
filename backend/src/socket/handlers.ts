import { createRoom, joinRoom, sendMessage } from "../services/roomService.js";
import type { IoServer } from "./io.js";

export function registerSocketHandlers(io: IoServer) {
    io.on('connection', (socket) => {
        console.log(`Conexão detectada! ID: ${socket.id}`)

    socket.on("join-room", (roomId: string) => {joinRoom(socket, roomId);});
    socket.on("create-room", () => {createRoom(socket)})
    socket.on("message", ({message, roomId}: {message: string, roomId: string}) => {sendMessage(io, {message: message, roomId: roomId})})
    })
}