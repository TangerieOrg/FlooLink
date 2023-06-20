import { throttle } from "lodash";
import { ComponentChildren, JSX } from "preact";
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";


export const MouseButton = {
    Left: 0,
    Middle: 1,
    Right: 2
} as const;
export type MouseButton = typeof MouseButton[keyof typeof MouseButton];

export interface PanZoomConfig {
    initialScale: number;
    initialTranslation: Vec2;
    maxTranslate: Vec2;
    minTranslate: Vec2;
    maxScale : number;
    minScale : number;
}

interface Props {
    children?: ComponentChildren;
    width : number;
    height: number;
    config: PanZoomConfig;
}

type Vec2 = [number, number];
type MouseEventHandler = JSX.MouseEventHandler<SVGSVGElement>;
type ScrollEventHandler = JSX.WheelEventHandler<SVGSVGElement>;

const zoomIntensity = 0.08;

const getSVGXY = (x : number, y : number, translate : Vec2, scale : number): Vec2 => [
    (x - translate[0]) / scale,
    (y - translate[1]) / scale
];

const getTranslateScaleToCursor = (newScale : number, x : number, y : number, translate : Vec2, scale : number) : Vec2 => ([
    translate[0] + scale * x - newScale * x,
    translate[1] + scale * y - newScale * y
])





export default function SVGPanZoom({children, width, height, config: {initialScale, initialTranslation, maxScale, minScale, maxTranslate, minTranslate}, ...props} : Props & Omit<JSX.SVGAttributes<SVGSVGElement>, keyof Props>) {
    const [scale, setScale] = useState(initialScale ?? 1);
    const [translate, setTranslate] = useState<Vec2>(initialTranslation ? initialTranslation.map(v => v*scale) as Vec2 : [0, 0]);
    const [screenMouseStart, setScreenMouseStart] = useState<Vec2>([0, 0]);
    const [translateStart, setTranslateStart] = useState<Vec2>(translate);
    const [isDragging, setIsDragging] = useState(false);

    const onMouseDown = useCallback<MouseEventHandler>(ev => {
        if(ev.button !== MouseButton.Left) return;
        ev.preventDefault();
        setIsDragging(true);
        setTranslateStart([translate[0], translate[1]]);
        setScreenMouseStart([ev.clientX, ev.clientY]);
    }, [scale, translate]);

    const onMouseUp = useCallback<MouseEventHandler>(ev => {
        if(ev.button !== MouseButton.Left) return;
        ev.preventDefault();
        setIsDragging(false);
    }, []);

    const onMouseLeave = useCallback<MouseEventHandler>(ev => {
        setIsDragging(false);
    }, []);

    const onMouseMove = useMemo<MouseEventHandler | undefined>(() => {
        if(isDragging) return throttle<MouseEventHandler>(ev => {
            ev.preventDefault();
            setTranslate([
                ev.clientX + translateStart[0] - screenMouseStart[0],
                ev.clientY + translateStart[1] - screenMouseStart[1]
            ]);
        }, 1 / 60);
    }, [isDragging, translate, scale, translateStart, screenMouseStart]);

    const onWheel = throttle<ScrollEventHandler>(ev => {
        ev.preventDefault();
        
        const scroll = ev.deltaY < 0 ? 1 : -1;
        const zoom = Math.exp(scroll * zoomIntensity);
        const [mouseX, mouseY] = getSVGXY(ev.clientX, ev.clientY, translate, scale);

        const s = Math.min(Math.max(scale * zoom, minScale), maxScale);
        setScale(s);
        setTranslate(getTranslateScaleToCursor(s, mouseX, mouseY, translate, scale));
    }, 20);

    return <svg 
        {...props} 
        width={width}
        height={height}
        preserveAspectRatio="none"
        viewBox={`${-translate[0] / scale} ${-translate[1] / scale} ${width / scale} ${height / scale}`}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
    > 
        {children}
    </svg>
}