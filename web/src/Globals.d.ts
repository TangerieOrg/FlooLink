declare module "*.css";
declare module "*.png";
declare module "*.jpg";
declare module "*.webp";

declare type ClassConstructor<T, TArgs extends unknown[] = []> = new(...args : TArgs) => T;


declare interface ChildrenProps {
    children?: import("preact").ComponentChildren
}

interface Window {
}