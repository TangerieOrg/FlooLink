import {
    Route,
    Routes,
} from "react-router-dom";
import FourOhFour from "./FourOhFour";
import HomeRoute from "./Home";

export default function Router() {
    return <Routes>
        <Route path="*" element={<FourOhFour/>}/>
        <Route path="/" element={<HomeRoute/>}/>
    </Routes>
}