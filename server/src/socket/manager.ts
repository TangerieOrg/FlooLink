import { emitter } from "./events";
import { Server as SocketIOServer } from "socket.io";

export const setupManager = (io : SocketIOServer) => {
    let currentMembers : string[] = [];
    emitter.on("join", id => {
        currentMembers.push(id);
        io.emit("update", currentMembers);
    });

    emitter.on("leave", id => {
        currentMembers = currentMembers.filter(x => x !== id);
        io.emit("update", currentMembers);
        
    })
}