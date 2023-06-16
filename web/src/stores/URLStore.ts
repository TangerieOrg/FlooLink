import { createStore, createUseStore } from "@tangerie/better-global-store"
import { pick } from "lodash";
import { useLocation } from "react-router-dom";
import { useEffect } from "preact/hooks";

const BASE_URL = process.env.APP_BASE_URL ?? "/";

function toQueryString(data : Record<string, any>) {
    const params = new URLSearchParams();
    for(const key in data) params.set(key, data[key])
    return params.toString();
}

const getLocationParts = (pathname ?: string) => {
    if(pathname === undefined) pathname = window.location.pathname.slice(BASE_URL.length);
    if(pathname.at(0) === '/') pathname = pathname.slice(1)  // Remove leading '/'
    if(pathname.length === 0) return [];
    return pathname.split("/");
}

const getObjectFromURL = (search = window.location.search) : Record<string, string> => {
    const params = new URLSearchParams(search);
    return Object.fromEntries(params.entries()) as Record<string, string>;
}

const useOnQueryChanged = (cb : (pathname : string, search : string) => any) => {
    const { pathname, search } = useLocation();

    useEffect(() => cb(pathname, search), [pathname, search]);
}

interface State {
    path: string[],
    query: Record<string, string>
}

const initial : State = {
    path: getLocationParts(),
    query: getObjectFromURL()
}

export const URLStore = createStore({
    state: initial,
    actions: {
        update(state, pathname : string, query : string) {
            state.path = getLocationParts(pathname);
            state.query = getObjectFromURL(query);
        }
    }
});

export const useURLStore = createUseStore(URLStore);
export const useURLStoreUpdater = () => useOnQueryChanged((pathname, query) => {
    URLStore.actions.update(pathname, query);
})
export const selectPath = (state : State) => state.path;
export const selectQuery = (state : State) => state.query;
export const selectQueryParameters = <T extends {[K in keyof T]: string}>(keys : (keyof T)[]) => (state : State) => pick(state.query, keys) as {
    [K in keyof T]?: string
};