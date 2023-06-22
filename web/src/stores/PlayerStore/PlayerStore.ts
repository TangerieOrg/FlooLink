import { createStore, createUseStore } from "@tangerie/better-global-store";
import { isDebugMode } from "../../Config";
import { DebugLog } from "@modules/Debug";
import { ClientMessageType, ConnectionStatus, ServerMessageType } from "@MyTypes/SocketTypes";
import { Unreal } from "@MyTypes/Unreal";
import { PlayerInitOptions, valueToKey } from "./Util";
import SimplePeer = require("simple-peer");

interface PlayerState {
    username: string;
    id: number;
    position: Unreal.Vector3;
    info: Unreal.CharacterInfo;
    peer: SimplePeer.Instance;
}

interface State {
    status: ConnectionStatus;
    opts: PlayerInitOptions;
    players: Map<number, PlayerState>;
}

let ws: WebSocket | undefined = undefined;

const initial = (): State => ({
    status: ConnectionStatus.Ready,
    opts: {
        playerId: "",
        url: ""
    },
    players: new Map()
})

export const PlayerStore = createStore({
    state: initial,
    actions: {
        connect(state, url: string) {
            if (state.status === "Connected" || state.status === "Connecting") {
                console.error("Socket already connecting");
                return;
            }
            state.status = ConnectionStatus.Connecting;
            ws = new WebSocket(`${url}/map`);
            ws.binaryType = "arraybuffer";

            setupSocket();
        },
        connectVC(state, opts: PlayerInitOptions) {
            if(state.status === "Connected" || state.status === "Connecting") {
                console.error("Socket already connecting");
                return;
            }
            state.opts = opts;
            state.status = ConnectionStatus.Connecting;
            ws = new WebSocket(`${opts.url}/vc?playerId=${opts.playerId}`);
            setupSocket();
        },
        disconnect(state) {
            // Dont clear options in case of reconnect
            state.status = ConnectionStatus.Ready;
            state.players.clear();
            ws?.close();
            ws = undefined;
        }
    }
});

export const usePlayerStore = createUseStore(PlayerStore);
const { get, set, actions } = PlayerStore;

const updateStatus = (status: ConnectionStatus) => set(state => {
    // If it failed, the disconnect event will also fire
    if (!(state.status === ConnectionStatus.Failed && status === ConnectionStatus.Disconnected)) {
        state.status = status;
    }
    // If we are connecting, dont clear data
    if (status === ConnectionStatus.Connecting || status === ConnectionStatus.Connected) return;

    state.players.clear();
});



const setupSocket = () => {
    const socket = ws!;
    if (isDebugMode) {
        const socketLog = console.log.bind(console, "[SERVER]")
        socket.addEventListener("open", () => socketLog("OPEN"));
        socket.addEventListener("error", socketLog.bind(null, "ERR"))
        socket.addEventListener("close", () => socketLog("CLOSE"))
    }
    socket.addEventListener("open", () => updateStatus(ConnectionStatus.Connected));
    socket.addEventListener("error", () => updateStatus(ConnectionStatus.Failed));
    socket.addEventListener("close", () => updateStatus(ConnectionStatus.Disconnected));


    socket.addEventListener("message", async (ev: MessageEvent<ArrayBuffer>) => {
        const cmd = new Uint8Array(ev.data, 0, 1)[0] as ServerMessageType;

        if(cmd !== ServerMessageType.Position) DebugLog(`[CMD] ${valueToKey(cmd, ServerMessageType)}`);
        if (!messageFns[cmd]) return;
        messageFns[cmd]?.(ev.data.slice(1));
    });
}



const bufToString = (buf: ArrayBuffer, offset?: number, length?: number) => (
    String.fromCharCode.apply(null, Array.from(new Uint8Array(buf, offset, length)))
);

/*
== Info ==
<Gender = 1>
<House = 1>
<NameLen = 1>
<Name = NameLen>

TOTAL = 3 + NameLen
*/
const parsePlayerInfo = (remainingData : ArrayBuffer, offset : number) : [char: Unreal.CharacterInfo, username: string, offset: number] => {
    const [Gender, House, nameLen] = new Uint8Array(remainingData, offset, 3) as any as [Unreal.EGender, Unreal.EHouse, number];
    const name = bufToString(remainingData, offset + 3, nameLen);

    return [{ Gender, House }, name, offset + 3 + nameLen]
}

const messageFns: Partial<Record<ServerMessageType, (data: ArrayBuffer) => void>> = {
    [ServerMessageType.Test]: data => {
        // console.log("TEST");
        console.log(bufToString(data));
    },
    /*
    == MSG ==
    <NumPlayers = 2>
    <Ids = 2 * NumPlayers>
    <Infos = addPlayerInfo>
    */
    [ServerMessageType.PlayerList]: data => {
        const numPlayers = new Uint16Array(data, 0, 1)[0];
        const playerIds = new Uint16Array(data, 2, numPlayers);
        // <NumPlayers = 2> <PlayerIds = 2*COUNT> <Usernames joined by LIST_SEP_BYTE>
        // const strBytes = Array.from(new Uint8Array(data, 2 + 2 * numPlayers));
        // const names = String.fromCharCode.apply(null, strBytes).split(LIST_SEP_CHAR);

        let remainingData = data.slice(2 + 2 * numPlayers);

        set(state => {
            state.players.clear();
            let offset = 0;
            for (let i = 0; i < playerIds.length; i++) {
                const id = playerIds[i];
                const [info, username, nextOffset] = parsePlayerInfo(remainingData, offset);
                offset = nextOffset;

                state.players.set(id, {
                    id,
                    username,
                    position: [0, 0, 0],
                    info,
                    peer: new SimplePeer({ initiator: true })
                })
            }
        })
    },
    /*
    == MSG ==
    <Id = 2>
    <Info = addPlayerInfo>
    */
    [ServerMessageType.PlayerJoin]: data => {
        const id = new Uint16Array(data, 0, 1)[0];
        const [info, username] = parsePlayerInfo(data, 1);
        set(state => {
            state.players.set(id, {
                id,
                username,
                position: [0, 0, 0],
                info,
                peer: new SimplePeer({ initiator: true })
            })
        });
    },
    /*
    == MSG ==
    <Id = 2>
    */
    [ServerMessageType.PlayerLeave]: data => {
        const id = new Uint16Array(data, 0, 1)[0];
        set(state => {
            state.players.delete(id);
        })
    },
    [ServerMessageType.Position]: data => {
        /*
        Better for JS to keep ids first then positions
        MSG STRUCTURE = <PlayerIds (Uint16) = 2*COUNT> <PlayerPositions (Float32) = 12*COUNT>
        LENGTH = 14 * COUNT
        COUNT = Length / 14
        */
        const count = data.byteLength / 14;
        const ids = new Uint16Array(data, 0, count);
        // id = 2 bytes
        const positions = new Float32Array(data.slice(count * 2));
        set(state => {
            for(let i = 0; i < count; i++) {
                const p = state.players.get(ids[i])!;
                p.position[0] = positions[i*3];
                p.position[1] = positions[i*3 + 1];
                p.position[2] = positions[i*3 + 2];
            }
        })
    }
}