import { JSX } from "preact";
import SVGPanZoom from "./SVGPanZoom";
import MapImage from "@assets/5.png";
import { useEffect, useState } from "preact/hooks";
import { PanZoomConfig } from "./SVGPanZoom/SVGPanZoom";
import { throttle } from "lodash";
import { usePlayerStore } from "@stores/PlayerStore";

const config : PanZoomConfig = {
    initialScale: 1,
    initialTranslation: [0, 0],
    maxScale: 5,
    minScale: 1,
    maxTranslate: [1000, 1000],
    minTranslate: [0, 0]
}

export default function SVGPlayerMap(props : JSX.SVGAttributes<SVGSVGElement>) {
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);
    const players = usePlayerStore(state => Array.from(state.players.values()));
    
    useEffect(() => {
        const cb = throttle(() => {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
        }, 100);
        window.addEventListener("resize", cb);
        return () => window.removeEventListener("resize", cb);
    }, []);

    return <SVGPanZoom {...props} width={width} height={height} config={config}>
        <image href={MapImage} height={1000} width={1000}/>
        {
            players.map(({ position: [x, y] }) => <circle cx={x / 2000 + 500} cy={y / 2000 + 500} r={10} class="fill-red-500"/>)
        }
    </SVGPanZoom>
}