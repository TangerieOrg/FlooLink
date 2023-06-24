import { GLTFFileLoader } from "@babylonjs/loaders/glTF";
GLTFFileLoader.IncrementalLoading = false;

import { ArcRotateCamera, Engine, HemisphericLight, AssetsManager, Scene, Vector3, SceneLoader, ISceneLoaderProgressEvent, ShadowGenerator, DirectionalLight, ImageProcessingConfiguration } from "@babylonjs/core";
import { IProgram } from "@modules/Babylon/BabylonCanvas";
import { DebugLog } from "@modules/Debug";
import { ImportOverlandMap, OverlandMap } from "@assets/map/OverlandMap";
import EventEmitter from "@tangerie/event-emitter";
import { KeyMouseStore, Keys } from "@stores/KeyMouseStore";
import { isDebugMode } from "../../Config";

type MapEvents = {
    progress: [progress: number],
    load: []
}

export default class MapProgram extends EventEmitter<MapEvents> implements IProgram  {
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
        this.camera = new ArcRotateCamera("Camera", 1.5, 1, 7.48, Vector3.Zero(), scene);
        this.camera.setPosition(new Vector3(-142, 84, 41));
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
        // camera.lowerRadiusLimit = 10;
        // camera.upperRadiusLimit = 100;
        
        
        requestAnimationFrame(() => {
            this.loadMap();
        });
    }

    private async loadMap() {
        const result = await ImportOverlandMap(this.scene, p => {
            if(p.total === 0) this.emit("progress", p.loaded / 1024 / 1024);
            else this.emit("progress", p.loaded/p.total)
        });   
        const d = new DirectionalLight("Test", new Vector3(0, -1, 1), this.scene);
        d.intensity = 5;
        const s = new ShadowGenerator(4096, d)
        // console.log(result);
        this.scene.meshes.forEach(m => {
            m.freezeWorldMatrix();
            m.isPickable = false;
            m.doNotSyncBoundingInfo = true;
            m.receiveShadows = true;
            s.addShadowCaster(m, true);
            if(m.name === "__root__") this.scene.removeMesh(m)
        });
        this.scene.materials.forEach(m => {
            m.needDepthPrePass = true;
        })
        // const sun = new HemisphericLight("Sun", new Vector3(0, 1, 0), this.scene);
        

        this.scene.clearCachedVertexData();
        this.camera.focusOn(result.meshes,false);
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