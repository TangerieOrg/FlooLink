import {
    Route,
    Routes,
} from "react-router-dom";
import FourOhFour from "./FourOhFour";
import ServerSelectRoute from "./ServerSelect";
import MapRoute from "./Map";
import VoipRoute from "./voip";
// import VoiceChatRoute from "./VoiceChat";
// import TestPeerRoute from "./TestPeer";

export default function Router() {
    return <Routes>
        <Route path="*" element={<FourOhFour/>}/>
        <Route path="/" element={<ServerSelectRoute/>}/>
        <Route path="/map" element={<MapRoute/>}/>
        <Route path="/voip" element={<VoipRoute/>}/>
        {/* <Route path="/vc" element={<VoiceChatRoute/>}/>
        <Route path="/peer" element={<TestPeerRoute/>}/> */}
    </Routes>
}