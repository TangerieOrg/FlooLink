import { StoreSet } from "@tangerie/better-global-store";
import { isDebugMode } from "../../Config";
import { ConnectSocket } from "./SocketEventMap";
import { ConnectionState } from "./types";

export default function setupSocket(socket : ConnectSocket, get : () => ConnectionState, set: StoreSet<ConnectionState>) {
    socket.on("connect", () => {
        set(state => {
            state.status = "Connected";
            state.data = {
                id: socket.id
            }
        })
    });

    socket.on("connect_error", () => {
        set(state => {
            state.status = "Failed";
            delete state.data;
        })
    });

    socket.on("disconnect", () => {
        set(state => {
            state.status = "Disconnected";
            delete state.data;
        })
    });

    socket.on("update", (members) => {
        set(state => {
            state.members = members
        })
    })

    if(isDebugMode) {
        socket.onAny(console.log.bind(null, `[SOCKET IN]`));
        socket.onAnyOutgoing(console.log.bind(null, `[SOCKET OUT]`));
    }
}