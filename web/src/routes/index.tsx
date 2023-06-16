import {
    Route,
    Routes,
} from "react-router-dom";
import FourOhFour from "./FourOhFour";
import ServerSelectRoute from "./ServerSelect";
import VoiceChatRoute from "./VoiceChat";

export default function Router() {
    return <Routes>
        <Route path="*" element={<FourOhFour/>}/>
        <Route path="/" element={<ServerSelectRoute/>}/>
        <Route path="/vc" element={<VoiceChatRoute/>}/>
    </Routes>
}