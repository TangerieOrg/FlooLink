declare module "*.css" { export = url as string; }
declare module "*.png" { export = url as string; }
declare module "*.jpg" { export = url as string; }
declare module "*.webp" { export = url as string; }
declare module "*.svg" { export = url as string; }
declare module "*.glb" { export = url as string; }

declare type ClassConstructor<T, TArgs extends unknown[] = []> = new(...args : TArgs) => T;


declare interface ChildrenProps {
    children?: import("preact").ComponentChildren
}

interface Window {
}