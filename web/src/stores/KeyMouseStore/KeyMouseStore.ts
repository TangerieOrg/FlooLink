import { createStore, createUseStore } from "@tangerie/better-global-store"
import { isEqual } from "lodash";
import { useEffect } from "preact/hooks";
import { JSX } from "preact";
import { Keys } from "./types";

interface State {
    downKeys : Set<Keys>;
}

const initial = () : State => ({
    downKeys: new Set()
});

export const KeyMouseStore = createStore({
    state: initial,
    actions: {}
}, { compare: isEqual });

const { set } = KeyMouseStore;

export const useKeyMouseStore = createUseStore(KeyMouseStore);

export const useKeyMouseInitiator = () => {
    return useEffect(() => {
        const onKeyDown : JSX.KeyboardEventHandler<any> = (ev) => set(state => {
            state.downKeys.add(ev.key as any)
        });

        const onKeyUp: JSX.KeyboardEventHandler<any> = (ev) => set(state => {
            state.downKeys.delete(ev.key as any);
        });

        const opts : AddEventListenerOptions = {
            capture: true,
            passive: true
        }

        window.addEventListener("keydown", onKeyDown, opts);
        window.addEventListener("keyup", onKeyUp, opts);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        }
    }, []);
}

export const selectIsKeyDown = (key : Keys) => (state : State) => state.downKeys.has(key);