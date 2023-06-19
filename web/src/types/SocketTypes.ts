export const ConnectionStatus = {
    Ready: "Ready",
    Disconnected: "Disconnected", // Server disconnected
    Connecting: "Connecting",
    Connected: "Connected",
    Failed: "Failed"
} as const;

export type ConnectionStatus = typeof ConnectionStatus[keyof typeof ConnectionStatus];

export const ServerMessageType = {
    Test: 0,
    PlayerList: 1,
    PlayerJoin: 2,
    PlayerLeave: 3,
    Position: 4,
    ReturnSignal: 5
} as const;
export type ServerMessageType = typeof ServerMessageType[keyof typeof ServerMessageType];

export const ClientMessageType = {
    Test: 0,
    SendSignal: 1,
    ReturnSignal: 2
} as const;
export type ClientMessageType = typeof ClientMessageType[keyof typeof ClientMessageType];