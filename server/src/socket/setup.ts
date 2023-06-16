import { Socket } from "socket.io";

export const setupSocket = (socket : Socket) => {
    socket.on("disconnect", () => console.log(`[DISCONNECT] ${socket.id}`));
    if(process.env.NODE_ENV === "development") {
        socket.onAny(console.log.bind(null, `[EVENT - ${socket.id}]`));
    }
    console.log(`[CONNECT] ${socket.id}`);
    socket.emit("hi");
}