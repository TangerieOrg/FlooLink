import { ConnectionStatus, ServerInitOptions, ServerStore, useServerStore } from "@stores/ServerStore";
import { URLStore, useURLStore } from "@stores/URLStore";
import { useEffect, useMemo } from "preact/hooks"
import Peer from "simple-peer";

/*
const options = useURLStore(state => state.query);
useEffect(() => {
    if(options["init"]) {
        const peer = new Peer({
            initiator: true,
            trickle: false
        });

        peer.on("signal", console.log.bind(null, "[SIGNAL]"));
        peer.on("connect", console.log.bind(null, "[CONNECT]"));
        peer.on("error", console.log.bind(null, "[ERR]"));
    } else {
        const peer = new Peer({
            initiator: false,
            trickle: false
        });

        peer.on("signal", console.log.bind(null, "[SIGNAL]"));
        peer.on("connect", console.log.bind(null, "[CONNECT]"));
        peer.on("error", console.log.bind(null, "[ERR]"));
    }
}, []);
*/

const selectConnectionOptions = (state : ReturnType<typeof URLStore["get"]>) : ServerInitOptions => ({
    playerId: state.query["playerId"] ?? "tangerie",
    url: state.query["url"] ?? "ws://localhost:8081"
})

export default function TestPeerRoute() {
    const { status, users } = useServerStore();
    const options = useURLStore(selectConnectionOptions);

    useEffect(() => {
        ServerStore.actions.connect(options);
        return () => ServerStore.actions.disconnect();
    }, []);

    return <div class="min-h-screen w-full flex flex-col justify-center">
        <h1 class="text-2xl text-center mb-8">Peer Test: {status}</h1>
        {
            Array.from(users.values()).map(username => <span class="text-xl text-center">{username}</span>)
        }
        {
            status === ConnectionStatus.Failed && <div class="text-center">
                <button 
                    class="button-primary text-2xl font-light"
                    // This is really only for testing as a new token would be required
                    onClick={() => ServerStore.actions.reconnect()}
                >
                    Reconnect
                </button>
            </div>
        }
    </div>
}