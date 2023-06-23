import { JSX } from "preact";
import SVGPanZoom from "./SVGPanZoom";
import MapImage from "@assets/5.png";
import { useEffect, useState } from "preact/hooks";
import { PanZoomConfig } from "./SVGPanZoom/SVGPanZoom";
import { throttle } from "lodash";
import { usePlayerStore } from "@stores/PlayerStore";
import { MediumTiles } from "@assets/tiles";


const TILES_PER_ROW = MediumTiles.length;
const MAP_SIZE = 1024;
const TILE_SIZE = MAP_SIZE / TILES_PER_ROW;

const initialWidth = window.innerWidth;
const initialHeight = window.innerHeight;

const config : PanZoomConfig = {
    initialScale: 1,
    initialTranslation: [(initialWidth - MAP_SIZE) / 2, (initialHeight - MAP_SIZE) / 2],
    maxScale: 25,
    minScale: 1
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
        {
            MediumTiles.map((row, y)  => <>
                {
                    row.map((url, x) => <image href={url} height={TILE_SIZE} width={TILE_SIZE} x={x * TILE_SIZE} y={y * TILE_SIZE}/>)
                }
            </>)
        }
        {
            players.map(({ position: [x, y] }) => <circle cx={x / 2000 + 500} cy={y / 2000 + 500} r={10} class="fill-red-500"/>)
        }
    </SVGPanZoom>
}