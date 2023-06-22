import { ConnectionStatus } from "@MyTypes/SocketTypes";
import { calcVolumeMult } from "@modules/Sound";
import { ServerInitOptions, ServerStore, selectMe, useServerStore } from "@stores/ServerStore";
import { URLStore, useURLStore } from "@stores/URLStore";
import { map } from "lodash";
import { useEffect, useMemo } from "preact/hooks"

const selectConnectionOptions = (state : ReturnType<typeof URLStore["get"]>) : ServerInitOptions => ({
    playerId: state.query["playerId"] ?? "vonbismarck",
    url: state.query["url"] ?? "ws://localhost:8081"
})

export default function TestPeerRoute() {
    const { status, users } = useServerStore();
    const options = useURLStore(selectConnectionOptions);
    const me = useServerStore(selectMe);

    useEffect(() => {
        ServerStore.actions.connect(options);
        return () => ServerStore.actions.disconnect();
    }, []);

    useEffect(() => {
        console.log(status);
        if(status === 'Connected')
        {
            Array.from(users.values()).map(({username, position}) => {
                console.log(username)
            })
        }
    }, [status,users])

    return <div class="min-h-screen w-full flex flex-col justify-center">
        <h1 class="text-2xl text-center mb-8">Peer Test: {status}</h1>
        {
            Array.from(users.values()).filter(u => u.username !== me.username).map(({username, position}) => <span class="text-xl text-center">{username} [{position.map(x => Math.round(x/900)).toString()}] Volume = {Math.round(calcVolumeMult(new Float32Array([357904,-448904,-82809]), position) * 100)}%</span>)
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