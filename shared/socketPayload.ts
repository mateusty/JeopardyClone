export interface Message {
    "message": string;
    "roomId": string;
}

export interface Player {
    id: string;
    name: string;
    points: number;
}

export interface ClientToServerEvents {
    "create-room": () => void;
    "join-room": (roomId: string, playerName: string) => void;
    "message": (message: Message) => void;
    "show-question": ({column, row, roomId}: {column: number, row: number, roomId: string}) => void;
}

export interface ServerToClientEvents {
    "room-id": (roomId: string) => void;
    "message-response": (message: Omit<Message, 'roomId'>) => void;
    "show-question": ({column, row}: {column: number, row: number}) => void;
    "block-buzzer": () => void;
    "expecting-answer": () => void;
    "update-scores": (players: Player[]) => void;
}