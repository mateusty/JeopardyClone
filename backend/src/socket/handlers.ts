import { createRoom, joinRoom, sendMessage, showQuestion } from "../services/roomService.js";
import type { IoServer } from "./io.js";

export function registerSocketHandlers(io: IoServer) {
    io.on('connection', (socket) => {
        console.log(`Conexão detectada! ID: ${socket.id}`)

    socket.on("join-room", (roomId: string, playerName: string) => {joinRoom(socket, roomId, playerName);});
    socket.on("create-room", () => {createRoom(socket)})
    socket.on("message", ({message, roomId}: {message: string, roomId: string}) => {sendMessage(io, {message: message, roomId: roomId})})
    socket.on("show-question", ({column, row, roomId}: {column: number, row: number, roomId: string}) => {showQuestion(io, column, row, roomId)})
    })
}