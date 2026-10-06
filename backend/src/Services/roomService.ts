import type { Message } from "@projeto/shared";
import type { Socket } from "socket.io";
import type { IoServer } from "../socket/io.js";

export interface Player {
    id: string;
    name: string;
    points: number;
}

const roomPlayers = new Map<string, Player[]>();
let isPlayerAnswering = false;
let answeringPlayer: string = '';

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
    socket
    socket.emit('room-id', roomId);
}

export function joinRoom(socket: Socket, roomId: string, playerName: string) {
    const players = roomPlayers.get(roomId) ?? [];
    if(!roomPlayers.has(roomId) || players.length >= 4) return;
    socket.join(roomId);

    players.push({
        id: socket.id,
        name: playerName,
        points: 0,
    })

    roomPlayers.set(roomId, players);
    socket.emit('room-id', roomId);
}

export function showQuestion(io: IoServer, columnNumber: number, rowNumber: number, roomId: string) {
    if(!roomPlayers.has(roomId)) return;
    io.to(roomId).emit('show-question', {column: columnNumber, row: rowNumber});
}

export function buzz(io: IoServer, socket: Socket, roomId: string) {
    if(isPlayerAnswering) return;

    io.to(roomId).emit('block-buzzer');

    isPlayerAnswering = true;
    answeringPlayer = socket.id;

    socket.emit('expecting-answer');
}

export function handleAnswer(io: IoServer, playerId: string, roomId: string, isCorrect: boolean, questionValue: number) {
    const players = roomPlayers.get(roomId) ?? [];
    if(answeringPlayer !== playerId || players.length === 0) return;

    const player = players.find(player => player.id === playerId)

    if(!player) return;

    player.points += isCorrect ? questionValue : -questionValue
    io.to(roomId).emit('update-scores', players);
}

export function sendMessage(io: IoServer, message: Message) {
    io.to(message.roomId).emit('message-response', {message: message.message});
}