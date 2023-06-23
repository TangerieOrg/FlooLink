import BabylonCanvas from "@modules/Babylon/BabylonCanvas";
import MapProgram from "./MapProgram";
import { DebugLog } from "@modules/Debug";
import { useCallback, useState } from "preact/hooks";

export default function BabylonMap() {
    const [progress, setProgress] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    const onConstruct = useCallback((program : MapProgram) => {
        program.on("progress", progress => setProgress(progress));
        program.on("load", () => setIsLoaded(true));
    }, []);

    return <div class="w-screen h-screen">
        <BabylonCanvas program={MapProgram} onConstruct={onConstruct} class="w-screen h-screen"/>
        {
            !isLoaded && <div class="fixed top-0 left-0 right-0 bottom-0 bg-gray-900 flex flex-col justify-center">
                <h1 class="text-center text-2xl">Loading Map ({Math.round(progress * 100)}%)</h1>
            </div>
        }
    </div>
}