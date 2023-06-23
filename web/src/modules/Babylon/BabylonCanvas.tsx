import { useEffect, useRef } from "preact/hooks";
import { JSX } from "preact";
import { Engine, Scene } from "@babylonjs/core";
import { throttle } from "lodash";

export interface IProgramConstructor<P extends IProgram> {
    new (scene : Scene): P;
}

type AsyncOrSync<T> = Promise<T> | T;

export interface IProgram {
    onLoad(): AsyncOrSync<void>;
    onUpdate(frames : number) : AsyncOrSync<boolean | void>;
    onUnload() : AsyncOrSync<void>;
}

interface Props<P extends IProgram> {
    program : IProgramConstructor<P>;
    onConstruct?: (program: P) => void;
}

export default function BabylonCanvas<P extends IProgram = IProgram>({ program: ProgramConstructor, onConstruct, ...props } : Props<P> & JSX.HTMLAttributes<HTMLCanvasElement>) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if(!canvas) return;

        const engine = new Engine(canvas, true);
        engine.resize();
        const scene = new Scene(engine);
        let program : P;

        let frames = 0;
        const render = async () => {
            // if onUpdate returns false, dont render
            if((await program.onUpdate(frames)) ?? true)
                scene.render();
            
            frames++;
        }

        const onSceneReady = async () => {
            program = new ProgramConstructor(scene);
            onConstruct?.(program);
            await program.onLoad();
            engine.runRenderLoop(render);
        }

        if(scene.isReady()) onSceneReady();
        else scene.onReadyObservable.addOnce(onSceneReady);

        const resize = throttle(() => engine.resize(), 20);

        window.addEventListener("resize", resize);

        return async () => {
            await program.onUnload();
            engine.dispose();
            window.removeEventListener("resize", resize);
        }
    }, [ProgramConstructor]);

    return <canvas {...props} ref={canvasRef}/>
}