import dotenv from 'dotenv';
import path from "path";



dotenv.config({
    path: path.join(process.cwd(), process.env.NODE_ENV === 'development' ? ".env.development" : ".env")
});

const port = process.env.EXPRESS_PORT ?? 80;

// Async load to ensure .env is loaded before server import
// Not required but gives me peace of mind

import("./server").then(({server}) => {
    server.listen(port, () => {
        console.log("Listening on port", port);
    })
})