import express from "express";
import cors from "cors";
import { createRun, getRun } from "./engine/runtime.js";
import { queueRunExecution, startExecutionWorker } from "./engine/executeQueued.js";
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.get("/health", (_req, res) => {
    res.json({
        ok: true,
        service: "sovereign-runtime",
        status: "online",
        timestamp: new Date().toISOString()
    });
});
app.post("/runs", async (req, res) => {
    const run = await createRun(req.body);
    res.json(run);
});
app.get("/runs/:projectId", async (req, res) => {
    const run = await getRun(req.params.projectId);
    res.status(run ? 200 : 404).json(run || { ok: false, error: "Run not found" });
});
app.post("/runs/:projectId/execute", async (req, res) => {
    const result = await queueRunExecution(req.params.projectId, req.body);
    res.json(result);
});
const port = Number(process.env.SOVEREIGN_RUNTIME_PORT || 4101);
app.listen(port, () => {
    console.log(`Sovereign Runtime online on ${port}`);
});
startExecutionWorker();
