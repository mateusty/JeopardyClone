import { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@projeto/shared';

export type IoServer = Server<ClientToServerEvents, ServerToClientEvents>;

export function createIo(httpServer: HttpServer): IoServer {
    return new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
        cors: { origin: 'http://localhost:5173' },
    });
};