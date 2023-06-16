import { ConnectionStore, getSocket, useConnectionStore, useConnectionUnloader } from "@stores/ConnectionStore";
import { useURLStoreUpdater } from "@stores/URLStore";
import Router from "./routes";
import { useEffect } from "preact/hooks";

export default function App() {
    useURLStoreUpdater();
    useConnectionUnloader();

    const status = useConnectionStore(state => state.status);

    useEffect(() => {
        ConnectionStore.actions.connect({});
    }, []);

    useEffect(() => {
        console.log(status);
        if(status === "Connected") {
            getSocket()?.emit("Hello from client");
        }
    }, [status]);


    return <div class="min-h-screen w-screen">
        <Router/>
    </div>;
}