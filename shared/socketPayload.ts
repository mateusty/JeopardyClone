export interface Message {
    "message": string;
    "roomId": string;
}

export interface ClientToServerEvents {
    "create-room": () => void;
    "join-room": (roomId: string) => void;
    "message": (message: Message) => void;
}

export interface ServerToClientEvents {
    "room-id": (roomId: string) => void;
    "message-response": (message: Omit<Message, 'roomId'>) => void;
}