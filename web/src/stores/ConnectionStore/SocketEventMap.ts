import { Socket } from "socket.io-client";

export interface ServerToClientEvents {

}

export interface ClientToServerEvents {

}

export type ConnectSocket = Socket<ServerToClientEvents, ClientToServerEvents>;