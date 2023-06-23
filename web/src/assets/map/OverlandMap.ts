import type { ISceneLoaderProgressEvent, Scene } from "@babylonjs/core";
import { SceneLoader } from "@babylonjs/core";
import { BASE_URL } from "../../Config";
import _OverlandMap from "url:./OverlandMap.glb";
export const OverlandMap : string = _OverlandMap;

export const ImportOverlandMap = (scene : Scene, onProgress? : (p : ISceneLoaderProgressEvent) => void) => {
    const url = new URL(OverlandMap);
    const modelName = url.pathname.split("/").at(-1)!;
    const modelPath = [BASE_URL, ...url.pathname.split("/").slice(0, -1).filter(x => x !== "")].join("/");
    return SceneLoader.ImportMeshAsync(undefined, modelPath, modelName, scene, onProgress);
}