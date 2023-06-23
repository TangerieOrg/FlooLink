import { ConnectionStatus } from "@MyTypes/SocketTypes";
import { calcVolumeMult } from "@modules/Sound";
import { ServerInitOptions, ServerStore, selectMe, useServerStore } from "@stores/ServerStore";
import { URLStore, useURLStore } from "@stores/URLStore";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";

var Peer = require('simple-peer')

const selectConnectionOptions = (state : ReturnType<typeof URLStore["get"]>) : ServerInitOptions => ({
    playerId: state.query["playerId"] ?? "vonbismarck",
    url: state.query["url"] ?? "ws://localhost:8081"
})


export default function VoipRoute() {
    const { status, users } = useServerStore();
    const options = useURLStore(selectConnectionOptions);
    const me = useServerStore(selectMe);
    const ref = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        ServerStore.actions.connect(options);
        return () => ServerStore.actions.disconnect();
    }, []);


    useEffect(() => {
        if(status === "Connected") {
            navigator.mediaDevices.getUserMedia({ 
                video: false,
                audio: true
             }).then((stream) => {
                ref.current!.srcObject = stream; // TODO: Pass stream to current user Peer mapping Peer via Id same from server should match
                console.log(ref.current!.volume);
                ref.current!.volume = 0.1;
             })
        }
    }, [status,me]); // funny add ( me ) here fixes a issue with volume but, creates a error :shrug:


    return <div class="min-h-screen w-full flex flex-col justify-center">
        <h1 class="text-2xl text-center mb-8">Voip Test: {status}</h1>
        {
             Array.from(users.values()).filter(u => u.username !== "").map(({username, position}) => <span class="text-xl text-center">{username} [{position.map(x => Math.round(x/900)).toString()}] Volume = {Math.round(calcVolumeMult(new Float32Array([357904,-448904,-82809]), position) * 100)}%</span>)
        }
        {
            <video ref={ref} autoPlay playsInline/>
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
    </div>;
}