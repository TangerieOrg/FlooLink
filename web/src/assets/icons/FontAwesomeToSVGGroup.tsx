import { JSX } from "preact";

type FontAwesomeSVG = (props : Omit<JSX.SVGAttributes<SVGPathElement>, "d">) => JSX.Element;

export default function FontAwesomeToSVGGroup(Component : FontAwesomeSVG, width : number, height : number, rotate : number) {
    const offX = -width/2;
    const offY = -height/2;
    return ({scale, transform, ...props} : Omit<JSX.SVGAttributes<SVGPathElement>, "d"> & {scale?: number, transform?: string}) => (
        <g transform={transform}>
            <g transform={`rotate(${rotate}) scale(${(scale ?? 20)/width} ${(scale ?? 20)/height}) translate(${offX} ${offY})`}>
                <Component {...props}/>
            </g>
        </g>
    )
}