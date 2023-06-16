import { useConnectionStore, ConnectionStore, useConnectionUnloader, getSocket } from "@stores/ConnectionStore";
import { selectQueryParameters, useURLStore } from "@stores/URLStore";
import { useEffect, useRef, useState } from "preact/hooks";
import { useNavigate } from "react-router-dom";

const selectConnectionOptions = selectQueryParameters([
    "url", 
    "path"
    // "token"
]);

export default function VoiceChatRoute() {
    const nav = useNavigate();
    // useConnectionUnloader();
    const options = useURLStore(selectConnectionOptions);
    const state = useConnectionStore();
    const ref = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        ConnectionStore.actions.connect(options);
    }, []);

    useEffect(() => {
        if(state.status === "Connected") {
            // getSocket()?.emit("Hello from client");
            navigator.mediaDevices.getUserMedia({ 
                video: false,
                audio: true
             }).then((stream) => {
                // ref.current!.srcObject = stream;
                // console.log(ref.current!.volume);
                // ref.current!.volume = 0.1;
             })
        }
    }, [state.status]);
    
    return <div class="min-h-screen w-full flex flex-col justify-center">
        <h1 class="text-2xl text-center">Voice Chat: {state.status}</h1>
        <div class="flex flex-col">
            {
                state.members.map(id => <span class="text-center text-xl" key={id}>{id}</span>)
            }
        </div>
        {/* <video ref={ref} autoPlay playsInline/> */}
    </div>
}