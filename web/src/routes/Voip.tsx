//TODO
//
//  So basicly everything is hard code for user connecting to the site i.e. vonbismarck or tangerie, 
//  wondering if it would be best to hook into discord for to confirm whom accessing the site then
//  confirm username / playerId with the server 
//

import { PlayerStore, usePlayerStore } from "@stores/PlayerStore"
import { ConnectionStatus } from "@MyTypes/SocketTypes";
import { URLStore, useURLStore } from "@stores/URLStore";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";

const selectConnectionOptions = (state : ReturnType<typeof URLStore["get"]>) => ({
    url: state.query["url"] ?? process.env.NODE_ENV === "development" ? "ws://localhost:8081" : "wss://tangerie.xyz:8081",
    playerId: state.query["playerId"] ?? process.env.NODE_ENV === "development" ? "vonbismarck" : ""
})

export default function VoipRoute() {
    const connectionURL = useURLStore(selectConnectionOptions);
    const status = usePlayerStore(state => state.status);
    const ref = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        PlayerStore.actions.connectVC(connectionURL.url,connectionURL.playerId);
        return () => PlayerStore.actions.disconnect();
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
    }, [status]); 


    return <div class="min-h-screen w-full flex flex-col justify-center">
        <h1 class="text-2xl text-center mb-8">Voip Test: {status}</h1>
        {
             //Array.from(users.values()).filter(u => u.username !== "").map(({username, position}) => <span class="text-xl text-center">{username} [{position.map(x => Math.round(x/900)).toString()}] Volume = {Math.round(calcVolumeMult(new Float32Array([357904,-448904,-82809]), position) * 100)}%</span>)
        }
        {
            <video ref={ref} autoPlay playsInline/>
        }
        {
            status === ConnectionStatus.Failed && <div class="text-center">
                <button 
                    class="button-primary text-2xl font-light"
                    // This is really only for testing as a new token would be required
                    onClick={() =>  PlayerStore.actions.connectVC(connectionURL.url,connectionURL.playerId)}
                >
                    Reconnect
                </button>
            </div>
        }
    </div>;
}