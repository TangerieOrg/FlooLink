import { PlayerState } from "@stores/PlayerStore";

interface Props {
    player : PlayerState
}

export default function PlayerMarker({ player: {position: [x, y]} } : Props) {
    return <circle cx={x / 2000 + 500} cy={y / 2000 + 500} r={10} class="fill-red-500"/>;
}