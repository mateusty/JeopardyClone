import type { Message } from "@projeto/shared";
import type { Socket } from "socket.io";
import type { IoServer } from "../socket/io.js";
import type { Question } from "../models/question.js";

export interface Player {
    id: string;
    name: string;
    points: number;
}

const roomPlayers = new Map<string, Player[]>();
const roomMasters = new Map<string, Pick<Player, "name">>();
const isPlayerAnswering = new Map<string, boolean>();
const answeringPlayer = new Map<string, string>();
const questionTable = new Map<string, Question[]>();
const isFinalStage = new Map<string, boolean>();

function makeid(length: number) {
    var result = '';
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

export function createRoom(socket: Socket, roomMasterName: string) {
    const roomId = makeRoomCode();
    console.log(`Criando sala com id: ${roomId}`)
    socket.join(roomId);

    roomMasters.set(roomId, {name: roomMasterName});

    roomPlayers.set(roomId, []);
    socket.emit('room-id', roomId);

    isFinalStage.set(roomId, false);
}

export function joinRoom(io: IoServer, socket: Socket, roomId: string, playerName: string) {
    const players = roomPlayers.get(roomId) ?? [];
    if(!roomPlayers.has(roomId)) {
        socket.emit("error-joining-room", "A sala não existe");
        return;
    }
    if(players.length >= 4) {
        socket.emit("error-joining-room", "A sala está cheia");
        return;
    }

    socket.join(roomId);

    players.push({
        id: socket.id,
        name: playerName,
        points: 0,
    })

    roomPlayers.set(roomId, players);
    socket.emit('room-id', roomId);
    io.to(roomId).emit('update-scores', players)

    // Manda as questões selecionadas para o jogador
    const questions = questionTable.get(roomId) ?? [];
    socket.emit('send-questions', questions);
}

export function removePlayer(io: IoServer, roomId: string, playerName: string) {
    const players = roomPlayers.get(roomId) ?? [];
    if(players.length === 0) {
        return;
    }
    const player = players.find(player => player.name === playerName) ?? {id: '', name: '', points: 0};
    const socket = io.sockets.sockets.get(player.id);

    if (socket) {
        socket.leave(roomId);
        const index = players.findIndex(item => item.id === player.id);

        if(index !== -1) {
            players.splice(index, 1);
        }
    }
    io.to(roomId).emit('update-scores', players)
}
 
export function showQuestion(io: IoServer, index: number, roomId: string) {
    if(!roomPlayers.has(roomId)) return;
    io.to(roomId).emit('show-question', {questionIndex: index});
}

export function hideQuestion(io: IoServer, roomId: string) {
    io.to(roomId).emit('hide-question');
}

export function showAnswer(io: IoServer, roomId: string, index: number) {
    io.to(roomId).emit('show-answer')
    const questions = questionTable.get(roomId) ?? [];
    const question = questions[index]

    if(!question) return;

    question.alreadyShown = true;
}

export function buzz(io: IoServer, socket: Socket, roomId: string) {
    io.to(roomId).emit('block-buzzer');

    isPlayerAnswering.set(roomId, true);
    answeringPlayer.set(roomId, socket.id);

    const players = roomPlayers.get(roomId) ?? []
    const player = players.find(player => player.id === socket.id);
    if(!player) {
        return;
    }

    io.to(roomId).emit('player-buzzed', player.name);
    socket.emit('expecting-answer');
}


export function handleAnswer(io: IoServer, playerId: string, roomId: string, isCorrect: boolean, questionValue: number) {
    const players = roomPlayers.get(roomId) ?? [];
    if(answeringPlayer.get(roomId) !== playerId || players.length === 0) return;

    const player = players.find(player => player.id === playerId)

    if(!player) return;

    player.points += isCorrect ? questionValue : -questionValue
    io.to(roomId).emit('update-scores', players);

    isPlayerAnswering.set(roomId, false);
    answeringPlayer.set(roomId, '');
}

export function updateScores(io: IoServer, roomId: string) {
    const players = roomPlayers.get(roomId) ?? [];
    if(!roomPlayers.get(roomId)) return;
    io.to(roomId).emit('update-scores', players);
}

export function sendAllQuestions(io: IoServer, roomId: string, questions: Question[]) {
    questionTable.set(roomId, questions);
    io.to(roomId).emit('send-questions', questions);
}

export function changeGameStage(io: IoServer, roomId: string) {
    const nextStage = !isFinalStage.get(roomId);

    isFinalStage.set(roomId, nextStage);
    io.to(roomId).emit('current-stage', nextStage);
}

export function getCurrentStage(io: IoServer, roomId: string) {
    const currentStage = isFinalStage.get(roomId) ?? false;
    io.to(roomId).emit('current-stage', currentStage);
}

export function getRoomMaster(io: IoServer, roomId: string) {
    const roomMaster = roomMasters.get(roomId);
    if(!roomMaster) return; 
    io.to(roomId).emit('get-room-master', roomMaster.name);
}

export function sendMessage(io: IoServer, message: Message) {
    io.to(message.roomId).emit('message-response', {message: message.message});
}