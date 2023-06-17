import { cloneDeep } from "lodash";
import { ConnectionStatus, ServerInitOptions, ServerMessageType } from "./types";
import { StoreSet, createStore, createUseStore } from "@tangerie/better-global-store";
import { isDebugMode } from "../../Config";
import { DebugLog } from "@modules/Debug";

interface State {
    status: ConnectionStatus;
    users: Set<string>;
    opts: ServerInitOptions;
}

const initial  = () : State => ({
    status: ConnectionStatus.Ready,
    users: new Set(),
    opts: {
        playerId: "",
        url: ""
    }
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
            if(state.status === "Disconnected" || state.status === "Failed" || state.status === "Ready") {
                console.error("Socket already disconnected");
                return;
            }
            // Dont clear options in case of reconnect
            state.status = ConnectionStatus.Ready;
            state.users.clear();
            ws?.close();
            ws = undefined;
        }
    }
})

const { get, set } = ServerStore;

const setupSocket = () => {
    const statusSetter = (status : ConnectionStatus) => () => set(state => {
        if(status !== ConnectionStatus.Connecting && status !== ConnectionStatus.Connected) {
            state.users.clear();
        }
        if(get().status === ConnectionStatus.Failed) return;
        state.status = status;
    })
    if(isDebugMode) {
        const socketLog = console.log.bind(console, "[SERVER]")
        ws!.addEventListener("open", () => socketLog("OPEN"));
        ws!.addEventListener("error", socketLog.bind(null, "ERR"))
        ws!.addEventListener("close", () => socketLog("CLOSE"))
    }
    ws!.addEventListener("open", statusSetter(ConnectionStatus.Connected));
    ws!.addEventListener("error", statusSetter(ConnectionStatus.Failed));
    ws!.addEventListener("close", statusSetter(ConnectionStatus.Disconnected));

    ws!.addEventListener("message", async (ev) => {
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
        const players = toStringArray(data);
        set(state => {
            // state.users = players;
            state.users = new Set(players);
        })
    },
    [ServerMessageType.PlayerJoin]: data => {
        const username = decoder.decode(data);
        if(username == get().opts.playerId) return;
        set(state => {
            state.users.add(username)
        })
    },
    [ServerMessageType.PlayerLeave]: data => {
        const username = decoder.decode(data);
        set(state => {
            state.users.delete(username)
        })
    }
}

const byteToCmdName = (cmd : number) => Object.keys(ServerMessageType).find(key => (ServerMessageType as any)[key as any] === cmd) ?? "Unknown"

const handleMessage = (data : Uint8Array) => {
    messageFns[data[0] as ServerMessageType]?.(data.slice(1));
    DebugLog(`[CMD] (${byteToCmdName(data[0])})`);
}

export const useServerStore = createUseStore(ServerStore);