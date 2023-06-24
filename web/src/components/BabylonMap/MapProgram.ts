import { GLTFFileLoader } from "@babylonjs/loaders/glTF";
GLTFFileLoader.IncrementalLoading = false;

import { ArcRotateCamera, Engine, HemisphericLight, AssetsManager, Scene, Vector3, SceneLoader, ISceneLoaderProgressEvent, ShadowGenerator, DirectionalLight, ImageProcessingConfiguration } from "@babylonjs/core";
import { IProgram } from "@modules/Babylon/BabylonCanvas";
import { DebugLog } from "@modules/Debug";
import EventEmitter from "@tangerie/event-emitter";
import { KeyMouseStore, Keys } from "@stores/KeyMouseStore";
import { isDebugMode } from "../../Config";
import { fetchImportManyAsync, FetchImportMeshStatus } from "@modules/Babylon/Utils";
import { Models } from "@assets/map/Split";

type ModelFileKey = "Center" | "North" | "South" | "SM_Map_Overland_E" | "SM_Map_Overland_M" | "SM_Map_Overland_MS" | "SM_Map_Overland_N" | "SM_Map_Overland_S" | "SM_Map_Overland_W" | "Water";

export type MapProgramEvents = {
    progress: [status: Record<ModelFileKey, FetchImportMeshStatus>],
    load: []
}

export default class MapProgram extends EventEmitter<MapProgramEvents> implements IProgram  {
    scene : Scene;
    engine : Engine;
    canvas : HTMLCanvasElement;
    camera : ArcRotateCamera;
    assetManager : AssetsManager;

    constructor(scene : Scene) {
        super();
        this.scene = scene;
        this.assetManager = new AssetsManager(scene);

        this.engine = scene.getEngine();
        this.canvas = this.engine.getRenderingCanvas()!;
        this.camera = new ArcRotateCamera("Camera", 1.5, 1.2, 185, new Vector3(8, 5, 0), scene);
        this.camera.setPosition(new Vector3(8, 34, 200));
        this.camera.panningSensibility = 100;
        // this.camera.minZ = 0.001;
        // this.camera.maxZ = 1000;

        scene.pointerMovePredicate = () => false;
        scene.pointerDownPredicate = () => false;
        scene.pointerUpPredicate = () => false;

        scene.imageProcessingConfiguration.toneMappingEnabled = true;
        scene.imageProcessingConfiguration.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;
    }

    onLoad() {
        const { scene, canvas, camera } = this;
        camera.attachControl(canvas, false, true);
        camera.lowerRadiusLimit = 1;
        // camera.upperRadiusLimit = 100;
        
        requestAnimationFrame(() => {
            this.loadMap();
        });

        
    }

    private async loadMap() {
        await fetchImportManyAsync([
            ["Center", Models.Props.Center],
            ["North", Models.Props.North],
            ["South", Models.Props.South],
            ["SM_Map_Overland_E", Models.Tiles.SM_Map_Overland_E],
            ["SM_Map_Overland_M", Models.Tiles.SM_Map_Overland_M],
            ["SM_Map_Overland_MS", Models.Tiles.SM_Map_Overland_MS],
            ["SM_Map_Overland_N", Models.Tiles.SM_Map_Overland_N],
            ["SM_Map_Overland_S", Models.Tiles.SM_Map_Overland_S],
            ["SM_Map_Overland_W", Models.Tiles.SM_Map_Overland_W],
            ["Water", Models.Water]
        ], this.scene, this.emit.bind(this, "progress")); 
        const d = new DirectionalLight("Directional", new Vector3(0, -1, 1), this.scene);
        d.position = new Vector3(0, 50, 0);
        d.intensity = 5;
        const s = new ShadowGenerator(4096, d)
        // s.useBlurExponentialShadowMap = true;
        s.usePoissonSampling = true;
        // console.log(result);
        this.scene.meshes.forEach(m => {
            m.freezeWorldMatrix();
            m.isPickable = false;
            m.doNotSyncBoundingInfo = true;
            m.receiveShadows = true;
            s.addShadowCaster(m, true);
            s.getShadowMap()!.renderList!.push(m);
            if(m.name === "__root__") this.scene.removeMesh(m)
        });
        this.scene.materials.forEach(m => {
            m.needDepthPrePass = true;
        })
        // const sun = new HemisphericLight("Sun", new Vector3(0, 1, 0), this.scene);
        

        this.scene.clearCachedVertexData();
        // this.camera.focusOn(result.meshes,false);
        this.emit("load");
    }

    onUpdate(frames : number) {
        if(frames % 60 === 0 && isDebugMode && KeyMouseStore.select(state => state.downKeys.has(Keys.Shift))) {
            DebugLog(this.camera.position.toString(), this.camera.alpha, this.camera.beta, this.camera.radius);
        }
    }

    onUnload() {
    
    }
}