import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, Player, Question, ServerToClientEvents } from '@projeto/shared';
import { SocketContext, type SocketContextValue } from './socketContext';

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  import.meta.env.VITE_SOCKET_URL,
  { autoConnect: false },
);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(socket.connected);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomMasterName, setRoomMasterName] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [question, setQuestion] = useState<{ questionIndex: number; sequence: number } | null>(null);
  const [isFinalStage, setIsFinalStage] = useState<boolean | null>(null);
  const [buzzerBlocked, setBuzzerBlocked] = useState(false);
  const [expectingAnswer, setExpectingAnswer] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [buzzedPlayerName, setBuzzedPlayerName] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const questionSequence = useRef(0);
  const currentQuestionIndex = useRef<number | null>(null);

  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
      setConnectionError(null);
    };
    const onDisconnect = () => setConnected(false);
    const onConnectError = (error: Error) => {
      setConnected(false);
      setConnectionError(`Não foi possível conectar ao servidor: ${error.message}`);
    };
    const onRoomId = (id: string) => setRoomId(id);
    const onRoomMaster = (name: string) => setRoomMasterName(name);
    const onJoinError = (message: string) => setJoinError(message);
    const onQuestions = (updatedQuestions: Question[]) => {
      if (!Array.isArray(updatedQuestions) || updatedQuestions.some((item) => (
        item.alreadyShown != null && typeof item.alreadyShown !== 'boolean'
      ))) {
        setQuestionsError('O servidor enviou uma configuração de tabuleiro inválida.');
        return;
      }
      setQuestionsError(null);
      setQuestions(updatedQuestions.map((item) => ({ ...item, alreadyShown: item.alreadyShown ?? false })));
    };
    const onQuestion = (selected: { questionIndex: number }) => {
      if (!Number.isInteger(selected.questionIndex) || selected.questionIndex < 0) return;
      currentQuestionIndex.current = selected.questionIndex;
      questionSequence.current += 1;
      setQuestion({ ...selected, sequence: questionSequence.current });
      setBuzzerBlocked(false);
      setExpectingAnswer(false);
      setAnswerRevealed(false);
      setBuzzedPlayerName(null);
    };
    const onHideQuestion = () => {
      currentQuestionIndex.current = null;
      setQuestion(null);
      setBuzzerBlocked(false);
      setExpectingAnswer(false);
      setAnswerRevealed(false);
      setBuzzedPlayerName(null);
    };
    const onBlockBuzzer = () => setBuzzerBlocked(true);
    const onExpectingAnswer = () => setExpectingAnswer(true);
    const onPlayerBuzzed = (playerName: string) => setBuzzedPlayerName(playerName);
    const onScores = (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
      setBuzzerBlocked(false);
      setExpectingAnswer(false);
      setBuzzedPlayerName(null);
    };
    const onShowAnswer = () => {
      setAnswerRevealed(true);
      const index = currentQuestionIndex.current;
      if (index !== null) {
        setQuestions((current) => current.map((item, itemIndex) => (
          itemIndex === index ? { ...item, alreadyShown: true } : item
        )));
      }
    };
    const onCurrentStage = (stage: boolean) => setIsFinalStage(stage);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('room-id', onRoomId);
    socket.on('get-room-master', onRoomMaster);
    socket.on('error-joining-room', onJoinError);
    socket.on('update-scores', onScores);
    socket.on('show-question', onQuestion);
    socket.on('hide-question', onHideQuestion);
    socket.on('send-questions', onQuestions);
    socket.on('block-buzzer', onBlockBuzzer);
    socket.on('expecting-answer', onExpectingAnswer);
    socket.on('player-buzzed', onPlayerBuzzed);
    socket.on('show-answer', onShowAnswer);
    socket.on('current-stage', onCurrentStage);
    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('room-id', onRoomId);
      socket.off('get-room-master', onRoomMaster);
      socket.off('error-joining-room', onJoinError);
      socket.off('update-scores', onScores);
      socket.off('show-question', onQuestion);
      socket.off('hide-question', onHideQuestion);
      socket.off('send-questions', onQuestions);
      socket.off('block-buzzer', onBlockBuzzer);
      socket.off('expecting-answer', onExpectingAnswer);
      socket.off('player-buzzed', onPlayerBuzzed);
      socket.off('show-answer', onShowAnswer);
      socket.off('current-stage', onCurrentStage);
      socket.disconnect();
    };
  }, []);

  const createRoom = useCallback((masterName: string) => {
    setRoomId(null);
    setRoomMasterName(null);
    setPlayers([]);
    setQuestions([]);
    setQuestionsError(null);
    setIsFinalStage(null);
    currentQuestionIndex.current = null;
    setQuestion(null);
    setAnswerRevealed(false);
    setBuzzedPlayerName(null);
    socket.emit('create-room', masterName);
  }, []);
  const joinRoom = useCallback((id: string, playerName: string) => {
    setRoomId(null);
    setRoomMasterName(null);
    setPlayers([]);
    setQuestions([]);
    setQuestionsError(null);
    setIsFinalStage(null);
    setJoinError(null);
    currentQuestionIndex.current = null;
    setQuestion(null);
    setAnswerRevealed(false);
    setBuzzedPlayerName(null);
    socket.emit('join-room', id, playerName);
  }, []);
  const removePlayer = useCallback((playerName: string, id: string) => {
    socket.emit('remove-player', playerName, id);
  }, []);
  const showQuestion = useCallback((questionIndex: number, id: string) => {
    currentQuestionIndex.current = questionIndex;
    socket.emit('show-question', { questionIndex, roomId: id });
  }, []);
  const sendQuestions = useCallback((updatedQuestions: Question[], id: string) => {
    socket.emit('send-questions', { questions: updatedQuestions, roomId: id });
  }, []);
  const hideQuestion = useCallback((id: string) => socket.emit('hide-question', id), []);
  const buzz = useCallback((id: string) => socket.emit('buzz', id), []);
  const revealAnswer = useCallback((id: string, questionIndex: number) => {
    socket.emit('show-answer', id, questionIndex);
  }, []);
  const handleAnswer = useCallback((
    playerId: string,
    id: string,
    isCorrect: boolean,
    questionValue: number,
  ) => {
    socket.emit('handle-answer', playerId, id, isCorrect, questionValue);
  }, []);
  const updateScores = useCallback((id: string) => socket.emit('update-scores', id), []);
  const nextStage = useCallback((id: string) => socket.emit('next-stage', id), []);
  const requestStage = useCallback((id: string) => socket.emit('current-stage', id), []);
  const getRoomMaster = useCallback((id: string) => socket.emit('get-room-master', id), []);

  const value = useMemo<SocketContextValue>(() => ({
    connected,
    roomId,
    roomMasterName,
    players,
    questions,
    question,
    isFinalStage,
    buzzerBlocked,
    expectingAnswer,
    answerRevealed,
    buzzedPlayerName,
    connectionError,
    joinError,
    questionsError,
    createRoom,
    joinRoom,
    removePlayer,
    showQuestion,
    sendQuestions,
    hideQuestion,
    buzz,
    revealAnswer,
    handleAnswer,
    updateScores,
    nextStage,
    requestStage,
    getRoomMaster,
  }), [
    connected, roomId, roomMasterName, players, questions, question, isFinalStage, buzzerBlocked,
    expectingAnswer, answerRevealed, buzzedPlayerName, connectionError, joinError, questionsError,
    createRoom, joinRoom, removePlayer, showQuestion, sendQuestions, hideQuestion, buzz,
    revealAnswer, handleAnswer, updateScores, nextStage, requestStage, getRoomMaster,
  ]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
