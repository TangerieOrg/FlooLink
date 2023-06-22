import { PlayerStore, usePlayerStore } from "@stores/PlayerStore"
import { PlayerInitOptions } from "@stores/PlayerStore/Util";
import { URLStore, useURLStore } from "@stores/URLStore";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { useNavigate } from "react-router-dom";

const selectConnectionOptions = (state : ReturnType<typeof URLStore["get"]>) : PlayerInitOptions => ({
    playerId: state.query["playerId"] ?? "vonbismarck",
    url: state.query["url"] ?? "ws://localhost:8081"
})

export default function VoiceChatRoute() {
    const nav = useNavigate();
    const ref = useRef<HTMLVideoElement | null>(null);
    const connectionURL = useURLStore(selectConnectionOptions);
    const status = usePlayerStore(state => state.status);
    const players = usePlayerStore(state => Array.from(state.players.values()));


    useEffect(() => {
        PlayerStore.actions.connectVC(connectionURL);
        return () => PlayerStore.actions.disconnect();
    }, []);


    //const socket = useMemo(() => {
    //    const socket = new WebSocket("ws://localhost:8081/vc?playerId=vonbismarck");
    //
    //    socket.addEventListener("open", console.log.bind(null, "[OPEN]"));
    //    socket.addEventListener("message", console.log.bind(null, "[MSG]"));
    //    socket.addEventListener("error", console.log.bind(null, "[ERR]"))
    //    socket.addEventListener("close", console.log.bind(null, "[CLOSE]"))
    //
    //    socket.addEventListener("open", () => {
    //        socket.send("Hi");
    //    });
    //
    //    socket.addEventListener("message", ev => {
    //        (ev.data as Blob).arrayBuffer().then(b => new Int8Array(b)).then(console.log);
    //    });
    //
    //    return socket;
    //}, []);

    // useEffect(() => {
    //     ConnectionStore.actions.connect(options);
    // }, []);

    // useEffect(() => {
    //     if(state.status === "Connected") {
    //         // getSocket()?.emit("Hello from client");
    //         navigator.mediaDevices.getUserMedia({ 
    //             video: false,
    //             audio: true
    //          }).then((stream) => {
    //             // ref.current!.srcObject = stream;
    //             // console.log(ref.current!.volume);
    //             // ref.current!.volume = 0.1;
    //          })
    //     }
    // }, [state.status]);
    
    return <div class="min-h-screen w-full flex flex-col justify-center">
        <h1 class="text-2xl text-center">Voice Chat: </h1>
        <div class="flex flex-col">
            {/* {
                state.members.map(id => <span class="text-center text-xl" key={id}>{id}</span>)
            } */}
        </div>
        {/* <video ref={ref} autoPlay playsInline/> */}
    </div>
}