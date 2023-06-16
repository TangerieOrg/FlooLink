import express from "express";
import TestRoutes from "./test";

const router = express.Router();

const routers : Record<string, express.Router> = {
    '/test': TestRoutes,
};

for(const key of Object.keys(routers)) {
    router.use(key, routers[key])
}

export default router;