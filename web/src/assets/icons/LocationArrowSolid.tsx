import { JSX } from "preact";
import FontAwesomeToSVGGroup from "./FontAwesomeToSVGGroup";

const width = 448;
const height = 512;
const rotate = -45;

const offX = -width/2;
const offY = -height/2;

// export default function LocationArrowSolid({scale, ...props} : Omit<JSX.SVGAttributes<SVGPathElement>, "d"> & {scale?: number}) {
//     return <g transform={`rotate(${rotate}) scale(${(scale ?? 20)/width} ${(scale ?? 20)/height}) translate(${offX} ${offY})`}>
//         <path d="M429.6 92.1c4.9-11.9 2.1-25.6-7-34.7s-22.8-11.9-34.7-7l-352 144c-14.2 5.8-22.2 20.8-19.3 35.8s16.1 25.8 31.4 25.8H224V432c0 15.3 10.8 28.4 25.8 31.4s30-5.1 35.8-19.3l144-352z" {...props}/>
//     </g>
// }

const LocationArrowSolid = FontAwesomeToSVGGroup(
    (props) => <path d="M429.6 92.1c4.9-11.9 2.1-25.6-7-34.7s-22.8-11.9-34.7-7l-352 144c-14.2 5.8-22.2 20.8-19.3 35.8s16.1 25.8 31.4 25.8H224V432c0 15.3 10.8 28.4 25.8 31.4s30-5.1 35.8-19.3l144-352z" {...props}/>,
    448,
    512,
    -45 
)

export default LocationArrowSolid;