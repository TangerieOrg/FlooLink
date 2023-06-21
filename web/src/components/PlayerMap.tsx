import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { Component } from "preact";
import MapImage from "@assets/5.png"
import { PlayerStore } from "@stores/PlayerStore";
import { memo } from "preact/compat";

const BOUNDS : any = [[0, 0], [32, 32]];

function PlayerMap() {
    const mapRef = useRef<L.Map>();
    const [v, setV] = useState(0);


    useEffect(() => {
        const map = L.map("map", {
            crs: L.CRS.Simple,
            maxBounds: BOUNDS,
            minZoom: 6,
            maxZoom: 8,
            bounceAtZoomLimits: false
        });
        L.imageOverlay(MapImage, [[0, 0], [32, 32]], {
            
        }).addTo(map);

        map.fitBounds(BOUNDS);

        mapRef.current = map;
    }, []);
    

    useEffect(() => {
        return PlayerStore.subscribe(state => {
            console.log(state);
        })
    }, []);

    return <div class="w-screen h-screen">
        <div id="map" class="w-screen h-screen"></div>
    </div>
}

export default memo(PlayerMap)