import { StoreSet } from "@tangerie/better-global-store";
import { isDebugMode } from "../../Config";
import { ConnectSocket } from "./SocketEventMap";
import { ConnectionState } from "./types";

export default function setupSocket(socket : ConnectSocket, get : () => ConnectionState, set: StoreSet<ConnectionState>) {
    socket.on("connect", () => {
        set(state => {
            state.status = "Connected";
        })
    });

    socket.on("connect_error", () => {
        set(state => {
            state.status = "Failed";
        })
    });

    socket.on("disconnect", () => {
        set(state => {
            state.status = "Disconnected";
        })
    });

    if(isDebugMode) {
        socket.onAny(console.log.bind(null, `[SOCKET IN]`));
        socket.onAnyOutgoing(console.log.bind(null, `[SOCKET OUT]`));
    }
}