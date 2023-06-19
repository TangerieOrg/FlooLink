import { Unreal } from "@MyTypes/Unreal";
import { PlayerStore, usePlayerStore } from "@stores/PlayerStore"
import { valueToKey } from "@stores/PlayerStore/Util";
import { URLStore, useURLStore } from "@stores/URLStore";
import { useEffect, useRef, useState } from "preact/hooks";

import SVGPlayerMap from "@components/SVGPlayerMap";

const selectConnectionOptions = (state : ReturnType<typeof URLStore["get"]>) : string => (
    state.query["url"] ?? "ws://localhost:8081"
)

export default function MapRoute() {
    const connectionURL = useURLStore(selectConnectionOptions);
    const status = usePlayerStore(state => state.status);
    // const players = usePlayerStore(state => Array.from(state.players.values()));

    useEffect(() => {
        PlayerStore.actions.connect(connectionURL);
        return () => PlayerStore.actions.disconnect();
    }, []);

    
    return <div class="h-screen w-screen">
        {/* <h1 class="text-2xl mb-8">{status}</h1>
        {
            players.map(player => <div class="flex flex-col">
                <h2 class="text-xl">{player.username} ({player.id})</h2>
                <span>{player.position.join(", ")}</span>
                <span>{valueToKey(player.info.Gender, Unreal.EGender)}</span>
                <span>{valueToKey(player.info.House, Unreal.EHouse)}</span>
            </div>)
        } */}
        <SVGPlayerMap class="w-screen h-screen"/>
    </div>
}