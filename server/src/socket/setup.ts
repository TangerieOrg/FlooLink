import { Socket } from "socket.io";
import { emitter } from "./events";

export const setupSocket = (socket : Socket) => {
    emitter.emit("join", socket.id);
    console.log(`[CONNECT] ${socket.id}`);
    socket.on("disconnect", () => {
        emitter.emit("leave", socket.id);
        console.log(`[DISCONNECT] ${socket.id}`);
    });

    if(process.env.NODE_ENV === "development") {
        socket.onAny(console.log.bind(null, `[IN - ${socket.id}]`));
        socket.onAnyOutgoing(console.log.bind(null, `[OUT - ${socket.id}]`));
    }
}