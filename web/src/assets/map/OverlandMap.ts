import type { ISceneLoaderProgressEvent, Scene } from "@babylonjs/core";
import { SceneLoader } from "@babylonjs/core";
import { BASE_URL } from "../../Config";
import _OverlandMap from "url:./OverlandMap.glb";
export const OverlandMap : string = _OverlandMap;

export const ImportOverlandMap = async (scene : Scene, onProgress? : (p : ISceneLoaderProgressEvent) => void) => {
    const blob = await fetch(OverlandMap).then(r => r.blob());
    return await SceneLoader.ImportMeshAsync(undefined, "", URL.createObjectURL(blob), scene, onProgress, ".glb");
}