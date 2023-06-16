// Tracks the current state of the socket
export const ConnectionStatus = {
    Ready: "Ready",
    Disconnected: "Disconnected", // Server disconnected
    Connecting: "Connecting",
    Connected: "Connected",
    Failed: "Failed"
} as const;

export type ConnectionStatus = typeof ConnectionStatus[keyof typeof ConnectionStatus];

export interface ConnectionInitOptions {
    url : string;
    path : string;
}

export interface SocketData {
    id : string; // Replace with auth token
}

export interface ConnectionState {
    status : ConnectionStatus;
    opts : ConnectionInitOptions;
    data?: SocketData;
    members: string[];
}

