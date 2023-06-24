import type { ISceneLoaderAsyncResult, Scene } from "@babylonjs/core";
import { SceneLoader } from "@babylonjs/core";

export interface FetchImportMeshStatus {
    status : "downloading" | "importing" | "done",
    progress: number;
}

const fetchGLBProgress = async (url : string, onProgress?: (progress : number) => void) => {
    const response = await fetch(url);
    const reader = response.body!.getReader();
    const totalLength = +response.headers.get("Content-Length")!;

    let recievedLength = 0;
    const chunks : Uint8Array[] = [];

    while(true) {
        const { done, value } = await reader.read();
        if(done) break;
        chunks.push(value);
        recievedLength += value.length;
        onProgress?.(recievedLength / totalLength);
    }

    return [
        new Blob(chunks, {
            type: "model/gltf-binary"
        }),
        recievedLength
    ] as [Blob, number];
}

export const fetchImportMeshAsync = async (url : string, scene : Scene, onStatus?: (status : FetchImportMeshStatus) => void) => {
    const [blob, recievedLength] = await fetchGLBProgress(url, p => onStatus?.({
        progress: p * 0.45,
        status: "downloading"
    }))

    const result = await SceneLoader.ImportMeshAsync(undefined, "", URL.createObjectURL(blob), scene, p => {
        onStatus?.({
            progress: 0.45 + (p.loaded / recievedLength) / 2,
            status: "importing"
        })
    }, ".glb");

    onStatus?.({
        progress: 1,
        status: "done"
    });

    return result
}

export const fetchImportManyAsync = async <T extends {[K in keyof T]: string}>(urls : [keyof T, T[keyof T]][], scene : Scene, onProgress?: (status : Record<keyof T, FetchImportMeshStatus>) => void) => {
    const status = {} as Record<keyof T, FetchImportMeshStatus>;
    const results : Partial<Record<keyof T, ISceneLoaderAsyncResult>> = {};

    for(const [name] of urls) {
        status[name] = {
            progress: 0,
            status: "downloading"
        }
    }

    await Promise.all(urls.map(async ([name, url]) => {
        results[name] = await fetchImportMeshAsync(url, scene, s => {
            status[name].progress = s.progress;
            status[name].status = s.status;
            onProgress?.({...status});
        })
    }))

    // for(const [name, url] of urls) {
    //     results[name] = await fetchImportMeshAsync(url, scene, s => {
    //         status[name].progress = s.progress;
    //         status[name].status = s.status;
    //         onProgress?.({...status});
    //     })
    // }

    onProgress?.({...status});

    return results as Record<keyof T, ISceneLoaderAsyncResult>;
}