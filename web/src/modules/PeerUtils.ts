import SimplePeer from "simple-peer";

// On initially joining
export function createInitiatorPeer() {
    const peer = new SimplePeer({
        initiator: true,
        trickle: false
    });

    // We recieve signal from STUN server
    peer.on("signal", signal => {
        console.log("[INIT]", signal);
        // Send signal to websocket
    });

    return peer;
}


// When another client joins and requests us
export function createRecieverPeer() {
    const peer = new SimplePeer({
        initiator: false,
        trickle: false
    });

    peer.on("signal", signal => {
        console.log("[REC]", signal);
        // Send return signal to websocket
    });

    // peer.signal(incomingSignal)

    return peer;
}