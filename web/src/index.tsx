if (process.env.NODE_ENV === 'development') {
    // Must use require here as import statements are only allowed
    // to exist at top-level.
    require("preact/debug");
} else {
    import("./modules/PWA").then(m => m.LoadPWA());
}

// import { io } from "socket.io-client";
// const socket = io("/", {
//     path: "/server/socket.io",
//     autoConnect: false
// })

// if(process.env.NODE_ENV === "development") {
//     socket.onAny(console.log.bind(null, `[SOCKET]`));
// }
// socket.on("connect", () => {
//     console.log("Connected");
// })

// socket.connect();

// window.addEventListener("beforeunload", () => {
//     socket.emit("BYEBYE")
//     if(socket.connected) socket.disconnect();
// })

import { BrowserRouter } from "react-router-dom";
import { render } from "preact";
import App from "./App";

render(<BrowserRouter basename={process.env.APP_BASE_URL}>
    <App />
</BrowserRouter>
, document.getElementById("root")!);