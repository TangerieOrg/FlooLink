import express from "express";
import asyncHandler from "express-async-handler";

const TestRoutes = express.Router();


TestRoutes.get('/', (req, res) => {
    res.json({ key: "value" })
});

TestRoutes.get('/error', (req, res) => {
    throw new Error("Sync Error");
    res.json({});
})

TestRoutes.get('/asyncerror', asyncHandler(async (req, res) => {
    await new Promise((resolve) => setTimeout(resolve, 2000)).then(() => { throw new Error("Async Error") });
    res.json({});
}))

export default TestRoutes;