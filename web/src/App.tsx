import { useURLStoreUpdater } from "@stores/URLStore";
import Router from "./routes";

export default function App() {
    useURLStoreUpdater();

    return <div class="min-h-screen w-screen">
        <Router/>
    </div>;
}