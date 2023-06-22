import { ComponentChildren, createContext, JSX } from "preact";
import { useContext } from "preact/hooks";

export interface SVGPanZoomContextValue {
    scale: number;
    translate: [number, number]
}

const SVGPanZoomContext = createContext<SVGPanZoomContextValue>({
    scale: 1,
    translate: [0, 0]
});

export const useSVGPanZoomContext = () => useContext(SVGPanZoomContext);

export const SVGPanZoomProvider = SVGPanZoomContext.Provider;

export const ScreenScale = ({children, x, y, ...props } : {children? : ComponentChildren, x : number, y : number} & Omit<JSX.SVGAttributes<SVGGElement>, "transform">) => {
    const { scale } = useSVGPanZoomContext();
    return <g {...props} transform={`translate(${x} ${y})`}>
        <g transform={`scale(${1/scale})`}>
            {children}
        </g>
    </g>
}