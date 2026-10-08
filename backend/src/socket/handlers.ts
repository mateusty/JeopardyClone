import type { Question } from "../models/question.js";
import { buzz, changeGameStage, createRoom, getCurrentStage, getRoomMaster, handleAnswer, hideQuestion, joinRoom, removePlayer, sendAllQuestions, sendMessage, showAnswer, showQuestion, updateScores } from "../services/roomService.js";
import type { IoServer } from "./io.js";

export function registerSocketHandlers(io: IoServer) {
    io.on('connection', (socket) => {
        console.log(`Conexão detectada! ID: ${socket.id}`)

    socket.on("join-room", (roomId: string, playerName: string) => {joinRoom(io, socket, roomId, playerName);});
    socket.on("create-room", (roomMasterName: string) => {createRoom(socket, roomMasterName)})
    socket.on("message", ({message, roomId}: {message: string, roomId: string}) => {sendMessage(io, {message: message, roomId: roomId})})
    socket.on("show-question", ({questionIndex, roomId}: {questionIndex: number, roomId: string}) => {showQuestion(io, questionIndex, roomId)})
    socket.on("send-questions", ({questions, roomId}) => {sendAllQuestions(io, roomId, questions)});
    socket.on("remove-player", (playerName: string, roomId: string) => {removePlayer(io, roomId, playerName)})
    socket.on("buzz", (roomId: string) => {buzz(io, socket, roomId)})
    socket.on("show-answer", (roomId: string, questionIndex: number) => {showAnswer(io, roomId, questionIndex)});
    socket.on("update-scores", (roomId: string) => {updateScores(io, roomId)});
    socket.on("next-stage", (roomId: string) => {changeGameStage(io, roomId)})
    socket.on("current-stage", (roomId: string) => {getCurrentStage(io, roomId)})
    socket.on("handle-answer", (playerId: string, roomId: string, isCorrect: boolean, questionValue: number) => {handleAnswer(io, playerId, roomId, isCorrect, questionValue)})
    socket.on("hide-question", (roomId: string) => {hideQuestion(io, roomId)});
    socket.on("get-room-master", (roomId: string) => {getRoomMaster(io, roomId)})
    })
}