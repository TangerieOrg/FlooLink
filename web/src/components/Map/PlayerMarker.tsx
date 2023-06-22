import { PlayerState } from "@stores/PlayerStore";

interface Props {
    player : PlayerState
}


const xScale = 0.00111;
const xOffset = 72;

const yScale = 0.00138;
const yOffset = 938;


export default function PlayerMarker({ player: {position: [x, y, z]} } : Props) {
    return <circle cx={x * xScale + xOffset} cy={y * yScale + yOffset} r={1} class="fill-red-500" onMouseDown={ev => { ev.preventDefault(); ev.stopPropagation();  console.log(x, z); }}/>;
}

/*
373260 -612884 = 483 92
331904 -363596 = 427 437
*/