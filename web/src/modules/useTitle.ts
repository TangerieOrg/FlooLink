import { useEffect } from "preact/hooks";

const BASE_TITLE = document.title;

export default function useTitle(title? : string) {
    useEffect(() => {
        if(title) document.title = title;
        else document.title = BASE_TITLE;
        return () => document.title = BASE_TITLE;
    }, [title]);
}

export function useSubtitle(subtitle? : string) {
    const title = subtitle ? `${BASE_TITLE} - ${subtitle}` : undefined;
    return useTitle(title);
}