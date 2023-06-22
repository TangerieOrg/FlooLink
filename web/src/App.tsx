import { useURLStoreUpdater } from "@stores/URLStore";
import Router from "./routes";
import { useKeyMouseInitiator } from "@stores/KeyMouseStore";

export default function App() {
    useURLStoreUpdater();
    useKeyMouseInitiator();

    return <div class="min-h-screen w-screen">
        <Router/>
    </div>;
}