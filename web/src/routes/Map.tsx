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

    
    return <div class="h-screen w-screen bg-[#313133]">
        <SVGPlayerMap class="w-screen h-screen"/>
    </div>
}