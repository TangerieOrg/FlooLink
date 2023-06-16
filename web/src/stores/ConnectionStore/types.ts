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
    host : string;
    path : string;
    port? : number;
}

export interface ConnectionState {
    status : ConnectionStatus;
    opts : ConnectionInitOptions;
}