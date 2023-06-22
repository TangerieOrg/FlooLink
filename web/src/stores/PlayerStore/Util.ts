export const valueToKey = <K, V>(v : V, obj : any) => Object.keys(obj).find(key => obj[key as any] === v)! as K;

const xScale = 0.00111;
const xOffset = 72;

const yScale = 0.00138;
const yOffset = 938;

export const to01Coords = (x : number, y : number) : [number, number] => [(x * xScale + xOffset) / 1024, (y * yScale + yOffset) / 1024];
export const toMapCoords = (x : number, y : number) : [number, number] => [x * xScale + xOffset, y * yScale + yOffset]; 