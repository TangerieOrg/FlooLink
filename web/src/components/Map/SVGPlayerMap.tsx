import { JSX } from "preact";
import SVGPanZoom from "../SVGPanZoom";
import { useEffect, useMemo, useState } from "preact/hooks";
import { PanZoomConfig } from "../SVGPanZoom/SVGPanZoom";
import { throttle } from "lodash";
import { usePlayerStore } from "@stores/PlayerStore";
import { MediumTiles as TileSet } from "@assets/tiles";
import PlayerMarker from "./PlayerMarker";

export default function SVGPlayerMap(props : JSX.SVGAttributes<SVGSVGElement>) {
    const [tiles, setTiles] = useState(TileSet);

    const TILES_PER_ROW = tiles.length;
    const MAP_SIZE = 1024;
    const TILE_SIZE = MAP_SIZE / TILES_PER_ROW;

    const initialWidth = window.innerWidth;
    const initialHeight = window.innerHeight;

    const config : PanZoomConfig = useMemo(() => ({
        initialScale: 1,
        initialTranslation: [(initialWidth - MAP_SIZE) / 2, (initialHeight - MAP_SIZE) / 2],
        maxScale: 25,
        minScale: 1
    }), []);

    const [width, setWidth] = useState(initialWidth);
    const [height, setHeight] = useState(initialHeight);
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
            tiles.map((row, y)  => <>
                {
                    row.map((url, x) => <image href={url} height={TILE_SIZE} width={TILE_SIZE} x={x * TILE_SIZE} y={y * TILE_SIZE}/>)
                }
            </>)
        }
        {
            players.map(player => <PlayerMarker player={player}/>)
        }
    </SVGPanZoom>
}