import { Socket } from "socket.io-client";

export interface ServerToClientEvents {
    update(members: string[]): void;
}

export interface ClientToServerEvents {

}

export type ConnectSocket = Socket<ServerToClientEvents, ClientToServerEvents>;