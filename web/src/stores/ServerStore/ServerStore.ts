import { ClientMessageType, ConnectionStatus, ServerInitOptions, ServerMessageType } from "./types";
import { createStore, createUseStore } from "@tangerie/better-global-store";
import { isDebugMode } from "../../Config";
import { DebugLog } from "@modules/Debug";
import SimplePeer from "simple-peer";

interface UserData {
    username : string;
    position: Float32Array;
}

interface State {
    status: ConnectionStatus;
    users: Map<number, UserData>;
    opts: ServerInitOptions;
    peers: Map<string, SimplePeer.SimplePeer>;
}

const initial  = () : State => ({
    status: ConnectionStatus.Ready,
    users: new Map(),
    opts: {
        playerId: "",
        url: ""
    },
    peers: new Map()
})

let ws : WebSocket | undefined = undefined;

export const ServerStore = createStore({
    state: initial,
    actions: {
        connect(state, opts : ServerInitOptions) {
            if(state.status === "Connected" || state.status === "Connecting") {
                console.error("Socket already connecting");
                return;
            }
            state.opts = opts;
            state.status = ConnectionStatus.Connecting;
            ws = new WebSocket(`${opts.url}?playerId=${opts.playerId}`);

            setupSocket();
        },
        reconnect(state) {
            if(state.status === "Connected" || state.status === "Connecting") {
                console.error("Socket already connecting");
                return;
            }

            state.status = ConnectionStatus.Connecting;
            ws = new WebSocket(`${state.opts.url}?playerId=${state.opts.playerId}`);

            setupSocket();
        },
        disconnect(state) {
            // Dont clear options in case of reconnect
            state.status = ConnectionStatus.Ready;
            state.users.clear();
            ws?.close();
            ws = undefined;
        }
    }
})


const { get, set, actions } = ServerStore;


// For setting the status from the socket events
// Keep it as not an action because we want it to be private
const updateStatus = (status : ConnectionStatus) => set(state => {
    // If it failed, the disconnect event will also fire
    if(!(state.status === ConnectionStatus.Failed && status === ConnectionStatus.Disconnected)) {
        state.status = status;
    }
    // If we are connecting, dont clear data
    if(status === ConnectionStatus.Connecting || status === ConnectionStatus.Connected) return;
    
    state.users.clear();
    state.peers.clear();
});


const setupSocket = () => {
    const socket = ws!;
    if(isDebugMode) {
        const socketLog = console.log.bind(console, "[SERVER]")
        socket.addEventListener("open", () => socketLog("OPEN"));
        socket.addEventListener("error", socketLog.bind(null, "ERR"))
        socket.addEventListener("close", () => socketLog("CLOSE"))
    }
    socket.addEventListener("open", () => updateStatus(ConnectionStatus.Connected));
    socket.addEventListener("error", () => updateStatus(ConnectionStatus.Failed));
    socket.addEventListener("close", () => updateStatus(ConnectionStatus.Disconnected));

    socket.addEventListener("message", async (ev) => {
        handleMessage(
            new Uint8Array(await (ev.data as Blob).arrayBuffer())
        )
    });
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const LIST_SEP_CHAR = String.fromCharCode(0x1F);

const toStringArray = (data : Uint8Array) => decoder.decode(data).split(LIST_SEP_CHAR);

const messageFns : Record<ServerMessageType, (data : Uint8Array) => void> = {
    [ServerMessageType.Test]: data => {
        // console.log("TEST");
        console.log(decoder.decode(data));
    },
    [ServerMessageType.PlayerList]: data => {
        // createInitiatorPeer for each player
        const players = toStringArray(data);
        set(state => {
            state.users.clear();
            for(const p of players) {
                state.users.set(p.charCodeAt(0), {
                    username: p.slice(1),
                    position: new Float32Array([0, 0, 0])
                });
            }
            // state.users = players;
            // state.users = new Set(players.map(x => x.slice(1)));
        });
        ws!.send(decoder.decode(new Uint8Array([ClientMessageType.SendSignal, 0])) + JSON.stringify({key: "value"}))
    },
    [ServerMessageType.PlayerJoin]: data => {
        // createRecieverPeer for new peer

        // const username = decoder.decode(data);
        // if(username == get().opts.playerId) return;
        set(state => {
            // state.users.delete(data[0])
            state.users.set(data[0], {
                username: decoder.decode(data.slice(1)),
                position: new Float32Array([0, 0, 0])
            })
        })
    },
    [ServerMessageType.PlayerLeave]: data => {
        // Remove peer
        set(state => {
            state.users.delete(data[0])
        })
    },
    [ServerMessageType.Position]: data => {
        // 357728 -448836 -82809
        // new Float32Array(data.slice(1).buffer)
        // Per player = 13 bytes
        // data[0] = ID
        // data[1:12] = X, Y, Z (3 Float32s)
        const numPlayers = data.length / 13;
        for(let i = 0; i < numPlayers; i++) {
            const id = data[i * 13];
            const pos = new Float32Array(data.buffer.slice(i * 13 + 1), 0, 3);
            // console.log(id, pos);
            set(state => {
                state.users.get(id)!.position = pos;
            })
        }
    },
    // Handle receiving returned
    [ServerMessageType.ReturnSignal]: data => {
        const payload = decoder.decode(data);
        console.log("[RETURN SIGNAL]", payload);
    }
}

const byteToCmdName = (cmd : number) => Object.keys(ServerMessageType).find(key => (ServerMessageType as any)[key as any] === cmd) ?? "Unknown"

const handleMessage = (data : Uint8Array) => {
    messageFns[data[0] as ServerMessageType]?.(data.slice(1));
    DebugLog(`[CMD] (${byteToCmdName(data[0])})`);
}

export const useServerStore = createUseStore(ServerStore);