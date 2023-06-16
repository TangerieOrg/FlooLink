import { createStore, createUseStore } from "@tangerie/better-global-store"
import { io } from "socket.io-client";
import { ConnectionInitOptions, ConnectionState, ConnectionStatus } from "./types";
import type { ConnectSocket } from "./SocketEventMap";
import setupSocket from "./SetupSocket";
import { useEffect } from "preact/hooks";
import { isDebugMode } from "../../Config";

const createSocket = ({url, path } : ConnectionInitOptions) : ConnectSocket => {
    return io(url, {
        path,
        autoConnect: false
    });
}

const createDefaultOpts = () : ConnectionInitOptions => ({
    url: "/",
    path: "/server/socket.io"
})

// Dont put the socket in the store
let socket : ConnectSocket | undefined = undefined;
export const getSocket = () => socket;

const initial : ConnectionState = {
    status: ConnectionStatus.Ready,
    opts: createDefaultOpts(),
    members: []
}

export const ConnectionStore = createStore({
    state: initial,
    actions: {
        connect(state, opts : Partial<ConnectionInitOptions>) {
            if(state.status === "Connected" || state.status === "Connecting") {
                console.error("Socket already connected");
                return;
            }
            state.opts = Object.assign(createDefaultOpts(), opts);
            if(isDebugMode) console.log("Connecting to", state.opts);
            state.status = ConnectionStatus.Connecting;
            socket = createSocket(state.opts);

            setupSocket(socket, ConnectionStore.get, ConnectionStore.set);

            socket.connect();
        },
        disconnect(state) {
            if(state.status === "Disconnected" || state.status === "Failed" || state.status === "Ready") {
                console.error("Socket already disconnected");
                return;
            }
            state.status = ConnectionStatus.Ready;
            state.members = [];
            getSocket()?.disconnect();
            socket = undefined;
        }
    }
});



export const useConnectionStore = createUseStore(ConnectionStore);
// Close socket on disconnect
export const useConnectionUnloader = () => {
    useEffect(() => {
        const disconnect = () => {
            const status = ConnectionStore.get().status;
            if(status === "Connected" || status === "Connecting") {
                ConnectionStore.actions.disconnect();
            } 
        }
        window.addEventListener("beforeunload", disconnect)
        return disconnect; 
    }, []);
}