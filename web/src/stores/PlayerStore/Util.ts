export const valueToKey = <K, V>(v : V, obj : any) => Object.keys(obj).find(key => obj[key as any] === v)! as K;
export interface PlayerInitOptions {
    url : string;
    playerId : string;
}