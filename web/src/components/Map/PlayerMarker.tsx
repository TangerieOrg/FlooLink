import LocationArrowSolid from "@assets/icons/LocationArrowSolid";
import { ScreenScale } from "@components/SVGPanZoom/SVGPanZoomContext";
import { PlayerState } from "@stores/PlayerStore";
import { toMapCoords } from "@stores/PlayerStore/Util";

interface Props {
    player : PlayerState
}

export default function PlayerMarker({ player: { move, username } } : Props) {
    const [x, y] = toMapCoords(move.position[0], move.position[1]);
    return <ScreenScale x={x} y={y} class="opacity-70">
        <text y={-40} style={{fontSize: "20px", textAnchor: "middle"}} class="fill-white">{username}</text>
        <LocationArrowSolid class="fill-white" scale={40} transform={`rotate(${move.direction + 90})`}/>
    </ScreenScale>
}