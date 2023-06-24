import BabylonCanvas from "@modules/Babylon/BabylonCanvas";
import MapProgram, { MapProgramEvents } from "./MapProgram";
import { DebugLog } from "@modules/Debug";
import { useCallback, useState } from "preact/hooks";
import { FetchImportMeshStatus } from "@modules/Babylon/Utils";

export default function BabylonMap() {
    const [progress, setProgress] = useState<MapProgramEvents["progress"][0] | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const onConstruct = useCallback((program : MapProgram) => {
        program.on("progress", progress => setProgress(progress));
        program.on("load", () => setIsLoaded(true));
    }, []);

    return <div class="w-screen h-screen">
        <BabylonCanvas program={MapProgram} onConstruct={onConstruct} class="w-screen h-screen"/>
        {
            (!isLoaded && progress) && <div class="text-center fixed top-0 left-0 right-0 bottom-0 bg-gray-900 flex flex-col justify-center">
                {/* <h1 class="text-center text-2xl"><span class="capitalize">{progress.status}</span> Map ({Math.round(progress.progress * 100)}%)</h1> */}
                <h1 class="text-2xl">Loading Map</h1>
                {
                    Object.entries(progress).map(([name, {status, progress}]) => (
                        <h2 class="text-xl"><span class="capitalize">{status}</span> {name} ({Math.round(progress * 100)}%)</h2>
                    ))
                }
            </div>
        }
    </div>
}