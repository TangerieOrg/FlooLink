import { createStore, createUseStore } from "@tangerie/better-global-store"
import { io } from "socket.io-client";
import { ConnectionInitOptions, ConnectionState, ConnectionStatus } from "./types";
import { defaults } from "lodash";
import type { ConnectSocket } from "./SocketEventMap";
import setupSocket from "./SetupSocket";
import { useEffect } from "preact/hooks";

const createSocket = ({host, path, port } : ConnectionInitOptions) : ConnectSocket => {
    return io(host, {
        path,
        autoConnect: false,
        port
    });
}

const createDefaultOpts = () : ConnectionInitOptions => ({
    host: "/",
    path: "/server/socket.io"
})

// Dont put the socket in the store
let socket : ConnectSocket | undefined = undefined;
export const getSocket = () => socket;

const initial : ConnectionState = {
    status: ConnectionStatus.Ready,
    opts: {
        host: "/",
        path: "/server/socket.io"
    }
}

export const ConnectionStore = createStore({
    state: initial,
    actions: {
        connect(state, opts : Partial<ConnectionInitOptions>) {
            if(state.status === "Connected" || state.status === "Connecting") {
                throw new Error("Socket already connected");
            }
            state.opts = defaults(createDefaultOpts(), opts);
            state.status = ConnectionStatus.Connecting;
            socket = createSocket(state.opts);

            setupSocket(socket, ConnectionStore.get, ConnectionStore.set);

            socket.connect();
        },
        disconnect(state) {
            if(state.status === "Disconnected" || state.status === "Failed" || state.status === "Ready") {
                throw new Error("Socket already disconnected");
            }
            state.status = ConnectionStatus.Ready;
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