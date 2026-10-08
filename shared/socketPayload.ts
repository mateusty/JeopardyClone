export interface Message {
    "message": string;
    "roomId": string;
}

export interface Player {
    id: string;
    name: string;
    points: number;
}

export interface Question {
    id: string;
    theme: string;
    points: number;
    body: string;
    answer: string;
    mediaType: "IMAGE" | "AUDIO" | "YOUTUBE" | null;
    mediaUrl: string | null;
    alreadyShown?: boolean | undefined;
}

export interface ClientToServerEvents {
    "create-room": (roomMasterName: string) => void;
    "join-room": (roomId: string, playerName: string) => void;
    "message": (message: Message) => void;
    "show-question": ({questionIndex, roomId}: {questionIndex: number, roomId: string}) => void;
    "send-questions": ({questions, roomId}: {questions: Question[], roomId: string}) => void;
    "remove-player": (playerName: string, roomId: string) => void;
    "buzz": (roomId: string) => void;
    "show-answer": (roomId: string, questionIndex: number) => void;
    "update-scores": (roomId: string) => void;
    "next-stage": (roomId: string) => void;
    "current-stage": (roomId: string) => void;
    "handle-answer": (playerId: string, roomId: string, isCorrect: boolean, questionValue: number) => void;
    "hide-question": (roomId: string) => void;
    "get-room-master": (roomId: string) => void;
}

export interface ServerToClientEvents {
    "room-id": (roomId: string) => void;
    "message-response": (message: Omit<Message, 'roomId'>) => void;
    "show-question": ({questionIndex}: {questionIndex: number}) => void;
    "block-buzzer": () => void;
    "expecting-answer": () => void;
    "update-scores": (players: Player[]) => void;
    "show-answer": () => void;
    "send-questions": (questions: Question[]) => void;
    "error-joining-room": (message: string) => void;
    "current-stage": (stage: boolean) => void;
    "player-buzzed": (playerName: string) => void;
    "hide-question": () => void;
    "get-room-master": (roomMasterName: string) => void;
}