import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import router from "./routes";
import { setupSocket } from "./socket/setup";

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: '*'
    }
});

// Express Setup

// Forward IP
app.set('trust proxy', true)

// CORS
app.use(cors())
app.options('*', cors());

// Body Parsing
app.use(
    express.json(),
    express.urlencoded({
        extended: true
    })
);

app.use((req, res, next) => {
    // Disable cache
    res.setHeader("Surrogate-Control", "no-store");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Expires", "0");

    // Log requests
    // const trackingDetails = req.userid ? `USER ${req.userid}` : `TRACK ${req.tracking}`;
    // console.log(`[${req._ip}] ${req.url} (${JSON.stringify(req.body)})`);
    next();
})

app.use('/', router);

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (!res.headersSent) {
        console.log(`[ERR] '${err.message}'`);
        res.status(400);
        res.json({ error: err.message });
    }
})

io.on("connection", setupSocket)

export { io, server, app };